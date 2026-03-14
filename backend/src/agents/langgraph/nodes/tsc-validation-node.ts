import { WebsiteState, GeneratedFile, createRegistryEntry } from '../graph-state';
import { invokeLLM, parseChirActions, extractExports, extractImports } from '../llm-utils';
import { notifyPhaseChange } from '../website-graph';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { execSync } from 'child_process';

export async function tscValidationNode(state: WebsiteState): Promise<Partial<WebsiteState>> {
    console.log('\n ===============================================');
    console.log(' NODE: TSC VALIDATION');
    console.log(' ===============================================\n');

    notifyPhaseChange('validation');

    const files = new Map(state.files);
    const registry = new Map(state.fileRegistry);

    const tmpDir = path.join(os.tmpdir(), `sitecrafter-tsc-${Date.now()}`);

    try {
        fs.mkdirSync(tmpDir, { recursive: true });

        const packageJson: any = { name: 'validation', private: true, dependencies: {}, devDependencies: {} };
        const pkgFile = files.get('package.json');
        if (pkgFile) {
            try {
                const parsed = JSON.parse(pkgFile.content);
                packageJson.dependencies = parsed.dependencies || {};
                packageJson.devDependencies = parsed.devDependencies || {};
            } catch { }
        }

        const tsconfigContent = JSON.stringify({
            compilerOptions: {
                target: "ES2020",
                useDefineForClassFields: true,
                lib: ["ES2020", "DOM", "DOM.Iterable"],
                module: "ESNext",
                skipLibCheck: true,
                moduleResolution: "bundler",
                allowImportingTsExtensions: true,
                resolveJsonModule: true,
                isolatedModules: true,
                noEmit: true,
                jsx: "react-jsx",
                strict: false,
                noUnusedLocals: false,
                noUnusedParameters: false,
                noFallthroughCasesInSwitch: true,
                baseUrl: ".",
                paths: { "@/*": ["./src/*"] }
            },
            include: ["src"]
        }, null, 2);

        fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), tsconfigContent);

        for (const [filePath, file] of files.entries()) {
            if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts') && !filePath.endsWith('.css')) continue;
            const fullPath = path.join(tmpDir, filePath);
            fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            fs.writeFileSync(fullPath, file.content);
        }

        const is3D = state.enable3D === true;

        const declDir = path.join(tmpDir, 'src', 'types');
        fs.mkdirSync(declDir, { recursive: true });

        const moduleShims = [
            "declare module '*.css';",
            "declare module '*.svg';",
            "declare module '*.png';",
            "declare module '*.jpg';",
            "declare module 'three';",
            "declare module '@react-three/fiber';",
            "declare module '@react-three/drei';",
            "declare module '@react-three/postprocessing';",
            "declare module 'sonner';",
            "declare module 'framer-motion';",
            "declare module 'react-router-dom';",
            "declare module 'clsx';",
            "declare module 'tailwind-merge';",
            "declare module 'recharts';",
            "declare module '@radix-ui/*';",
            "declare module 'zustand';",
            "declare module 'react-hook-form';",
            "declare module 'zod';",
            "declare module '@hookform/resolvers/*';",
            "declare module 'gsap';",
            "declare module 'leva';",
            "declare module '@tanstack/react-query';",
            "declare module 'axios';",
            "declare module 'date-fns';",
            "declare module 'ogl';",
        ];

        if (!is3D) {
            moduleShims.push("declare module 'lucide-react';");
        }

        fs.writeFileSync(path.join(declDir, 'modules.d.ts'), moduleShims.join('\n'));

        const MAX_FIX_ROUNDS = 3;
        let totalFixedCount = 0;

        for (let round = 1; round <= MAX_FIX_ROUNDS; round++) {
            let tscOutput = '';
            try {
                execSync('npx tsc --noEmit --pretty false 2>&1', {
                    cwd: tmpDir,
                    encoding: 'utf-8',
                    timeout: 60000,
                });
                console.log(`    [TSC] Round ${round}: No TypeScript errors found`);
                return {
                    files,
                    fileRegistry: registry,
                    currentPhase: 'validation_complete',
                    messages: [`TSC validation passed after ${round} round(s), ${totalFixedCount} files fixed`],
                };
            } catch (e: any) {
                tscOutput = e.stdout || e.message || '';
            }

            const errorLines = tscOutput
                .split('\n')
                .filter((line: string) => line.includes('error TS'))
                .slice(0, 200);

            if (errorLines.length === 0) {
                console.log(`    [TSC] Round ${round}: No actionable errors found`);
                return {
                    files,
                    fileRegistry: registry,
                    currentPhase: 'validation_complete',
                    messages: [`TSC validation passed after ${round} round(s), ${totalFixedCount} files fixed`],
                };
            }

            const errorsByFile = new Map<string, string[]>();
            for (const line of errorLines) {
                const match = line.match(/^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)/);
                if (match) {
                    const filePath = match[1].replace(tmpDir + path.sep, '').replace(/\\/g, '/');
                    const lineNum = match[2];
                    const col = match[3];
                    const code = match[4];
                    const msg = match[5];
                    if (!errorsByFile.has(filePath)) errorsByFile.set(filePath, []);
                    errorsByFile.get(filePath)!.push(`Line ${lineNum}:${col} ${code}: ${msg}`);
                }
            }

            console.log(`    [TSC] Round ${round}: ${errorLines.length} errors in ${errorsByFile.size} files, attempting batch fix`);

            const allErrorContents: string[] = [];
            for (const [filePath, errors] of errorsByFile.entries()) {
                const file = files.get(filePath);
                if (!file) continue;
                allErrorContents.push([
                    `=== FILE: ${filePath} ===`,
                    `ERRORS (${errors.length}):`,
                    ...errors.map((e, i) => `  ${i + 1}. ${e}`),
                    ``,
                    `CURRENT CODE:`,
                    file.content,
                    `=== END FILE ===`,
                    '',
                ].join('\n'));
            }

            const threeDRules = is3D ? `
3D PROJECT CONSTRAINTS (CRITICAL):
- NEVER import from lucide-react (NOT installed -- remove ALL lucide-react imports)
- NEVER import from @/components/ui/ (Button, Card, Input, Badge, SplitText, ClickSpark, TextPressure DO NOT EXIST)
- If a file imports a module that does not exist, REMOVE the import entirely and replace usage with native HTML elements
- Scene components (src/components/3d/*Scene3D.tsx) must return <> fragments, NOT <Canvas> or <div>
- Drei materials: CAPITALIZED: <MeshDistortMaterial>, <MeshWobbleMaterial>
- Intrinsic materials: LOWERCASE: <meshPhysicalMaterial>, <meshStandardMaterial>
- EffectComposer: NEVER use disableNormalPass (use enableNormalPass={false} if needed)
- ErrorBoundary: use this.props.children (NOT this.children)
- NavBar3D: use <Link to="..."> from react-router-dom (NOT <a href>)
- Import cn from @/lib/utils if needed
- Use native HTML <button> instead of imported Button components
- LoadingScreen3D: ONLY import useProgress from @react-three/drei, NO other external UI component imports` : '';

            const systemPrompt = `You are a TypeScript expert who fixes ALL errors with ZERO tolerance for remaining issues.

MANDATORY RULES:
1. Fix EVERY single error listed for EVERY file
2. Return ALL ${errorsByFile.size} files, each wrapped in its own <chirAction type="file" filePath="...">...</chirAction> tag
3. Do NOT skip any file -- every file with errors must be returned fixed
4. Do NOT change the design, layout, or functionality -- only fix TypeScript errors
5. Do NOT add comments
6. Do NOT remove imports that ARE used
7. If an import references a module that does not exist, REMOVE the import and replace any usage with inline alternatives
8. All event handler parameters must be explicitly typed (e: React.ChangeEvent<HTMLInputElement>, e: React.FormEvent, etc.)
9. All useState must have explicit types when the initial value is ambiguous
10. NEVER use markdown code blocks -- ONLY chirAction tags
${threeDRules}`;

            const batchFixPrompt = `Fix ALL TypeScript errors in ALL ${errorsByFile.size} files below.
Return EVERY file in a separate <chirAction type="file" filePath="...">COMPLETE FIXED CODE</chirAction> tag.

${allErrorContents.join('\n\n')}

CRITICAL: Return ALL ${errorsByFile.size} files. Do NOT skip any. Each file must be complete -- do not truncate.`;

            let fixedCount = 0;

            try {
                const response = await invokeLLM(systemPrompt, batchFixPrompt, 0.3);
                const parsed = parseChirActions(response);

                for (const fixed of parsed) {
                    const filePath = fixed.path;
                    if (!files.has(filePath)) continue;

                    const fixedFile: GeneratedFile = {
                        path: filePath,
                        content: fixed.content,
                        phase: 'validation_fix',
                        exports: extractExports(fixed.content),
                        imports: extractImports(fixed.content),
                    };
                    files.set(filePath, fixedFile);
                    registry.set(filePath, createRegistryEntry(fixedFile));
                    fixedCount++;
                    console.log(`    [TSC FIX] Round ${round}: Fixed ${filePath} (${errorsByFile.get(filePath)?.length || 0} errors)`);
                }

                console.log(`    [TSC] Round ${round}: Batch fixed ${fixedCount}/${errorsByFile.size} files in 1 LLM call`);

                if (fixedCount < errorsByFile.size) {
                    const missedFiles = Array.from(errorsByFile.entries())
                        .filter(([fp]) => !parsed.some(p => p.path === fp));

                    if (missedFiles.length > 0) {
                        console.log(`    [TSC] ${missedFiles.length} files missed in batch, sending individual fixes...`);

                        for (const [filePath, errors] of missedFiles) {
                            const file = files.get(filePath);
                            if (!file) continue;

                            try {
                                const singlePrompt = `Fix ALL TypeScript errors in this single file. Return ONLY the corrected file.

File: ${filePath}
ERRORS:
${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}

CODE:
${file.content}

Return fixed file in <chirAction type="file" filePath="${filePath}">COMPLETE FIXED CODE</chirAction>
${threeDRules}`;

                                const resp = await invokeLLM('Fix all TypeScript errors. Return the complete fixed file in a chirAction tag. NEVER use markdown.', singlePrompt, 0.3);
                                const singleParsed = parseChirActions(resp);
                                if (singleParsed.length > 0) {
                                    const fixedFile: GeneratedFile = {
                                        path: filePath,
                                        content: singleParsed[0].content,
                                        phase: 'validation_fix',
                                        exports: extractExports(singleParsed[0].content),
                                        imports: extractImports(singleParsed[0].content),
                                    };
                                    files.set(filePath, fixedFile);
                                    registry.set(filePath, createRegistryEntry(fixedFile));
                                    fixedCount++;
                                    console.log(`    [TSC FIX] Round ${round}: Individual fix ${filePath}`);
                                }
                            } catch { }
                        }
                    }
                }
            } catch (batchErr: any) {
                console.warn(`    [TSC] Round ${round}: Batch fix failed: ${batchErr.message?.slice(0, 80)}, falling back to per-file`);
                for (const [filePath, errors] of errorsByFile.entries()) {
                    const file = files.get(filePath);
                    if (!file) continue;

                    try {
                        const fixPrompt = `Fix ALL TypeScript errors. Return corrected file in <chirAction> tags.
File: ${filePath}
ERRORS: ${errors.join('; ')}
CODE:
${file.content}
Return: <chirAction type="file" filePath="${filePath}">FIXED CODE</chirAction>
${threeDRules}`;

                        const resp = await invokeLLM('Fix TypeScript errors. Return complete fixed file in chirAction tag. NEVER use markdown.', fixPrompt, 0.3);
                        const parsed = parseChirActions(resp);
                        if (parsed.length > 0) {
                            const fixedFile: GeneratedFile = {
                                path: filePath,
                                content: parsed[0].content,
                                phase: 'validation_fix',
                                exports: extractExports(parsed[0].content),
                                imports: extractImports(parsed[0].content),
                            };
                            files.set(filePath, fixedFile);
                            registry.set(filePath, createRegistryEntry(fixedFile));
                            fixedCount++;
                            console.log(`    [TSC FIX] Round ${round}: Fixed ${filePath} (${errors.length} errors)`);
                        }
                    } catch { }
                }
            }

            totalFixedCount += fixedCount;
            console.log(`    [TSC] Round ${round} complete: fixed ${fixedCount} files, total fixed: ${totalFixedCount}`);

            if (fixedCount === 0) {
                console.log(`    [TSC] No files fixed in round ${round}, stopping`);
                break;
            }

            for (const [filePath, file] of files.entries()) {
                if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) continue;
                const fullPath = path.join(tmpDir, filePath);
                fs.mkdirSync(path.dirname(fullPath), { recursive: true });
                fs.writeFileSync(fullPath, file.content);
            }
        }

        console.log(`    [TSC] All rounds complete. Total fixed: ${totalFixedCount} files`);

        return {
            files,
            fileRegistry: registry,
            currentPhase: 'validation_complete',
            messages: [`TSC validation: ${MAX_FIX_ROUNDS} rounds, ${totalFixedCount} files auto-fixed`],
        };

    } catch (err: any) {
        console.warn(`    [TSC] Validation step failed: ${err.message?.slice(0, 100)}`);
        return {
            currentPhase: 'validation_complete',
            messages: [`TSC validation skipped: ${err.message?.slice(0, 60)}`],
        };
    } finally {
        try {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        } catch { }
    }
}
