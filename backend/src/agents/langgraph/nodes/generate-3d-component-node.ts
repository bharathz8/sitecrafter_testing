import { WebsiteState, GeneratedFile, createRegistryEntry } from '../graph-state';
import { invokeLLM, parseChirActions, extractExports, extractImports } from '../llm-utils';
import { getMemoryContext, updateMemory3D } from '../project-memory';
import { threeDPromptContext } from '../../../prompts/3dpromptcontext';
import { notifyFileCreated, notifyPhaseChange } from '../website-graph';

interface Section3DSpec {
    name: string;
    path: string;
    sectionType: string;
    contentDescription: string;
}

export async function generate3DComponentNode(state: WebsiteState): Promise<Partial<WebsiteState>> {
    console.log('\n[generate-3d-component] Generating 3D components...');
    notifyPhaseChange('3d_components');

    if (!state.enable3D) {
        console.log('[generate-3d-component] 3D not enabled, skipping.');
        return { currentPhase: 'generate_3d_skip', messages: ['3D component generation skipped'] };
    }

    const blueprint = state.blueprint;
    const modules = state.threeDModules || [];
    const ragContext = state.ragContext || '';
    const promptContext = threeDPromptContext || '';
    const memoryContext = state.projectMemory ? getMemoryContext(state.projectMemory) : '';
    const theme = state.dynamicTheme;
    const userPrompt = state.userPrompt || '';

    const sectionSpecs = buildSectionSpecs(blueprint);
    console.log(`[generate-3d] Will generate ${sectionSpecs.length} section-specific 3D components`);

    const newFiles = new Map<string, GeneratedFile>();
    const registry = new Map(state.fileRegistry);

    for (const spec of sectionSpecs) {
        console.log(`  [generate-3d] Generating ${spec.name} (${spec.sectionType})...`);

        const systemPrompt = build3DSystemPrompt();

        const userLLMPrompt = [
            `CRITICAL: Output EXACTLY ONE file: ${spec.path}`,
            `Do NOT output App.tsx, Header.tsx, Footer.tsx, Layout.tsx, main.tsx, index.css, utils.ts, LoadingScreen.tsx, or ANY other file.`,
            `Generate ONLY the single component requested below. ONE <chirAction> tag, ONE file.`,
            '',
            `COMPONENT: ${spec.name}`,
            `FILE PATH: ${spec.path}`,
            `SECTION TYPE: ${spec.sectionType}`,
            `CONTENT PURPOSE: ${spec.contentDescription}`,
            '',
            `WHAT THIS BUSINESS ACTUALLY DOES: ${userPrompt}`,
            '',
            `PROJECT CONTEXT:\n${memoryContext}`,
            '',
            theme ? `DESIGN THEME:\n  Primary: ${theme.palette.primary}\n  Secondary: ${theme.palette.secondary}\n  Accent: ${theme.palette.accent}\n  Style: ${theme.palette.style}\n  Animation: ${theme.animation.entrance}` : '',
            '',
            `AVAILABLE 3D MODULES: ${modules.join(', ')}`,
            '',
            blueprint ? `BLUEPRINT: ${blueprint.description}\nPAGES: ${blueprint.pages.map(p => p.name).join(', ')}` : '',
            '',
            `CONTENT-SPECIFIC INSTRUCTIONS:`,
            getContentInstructions(spec.sectionType, userPrompt),
            '',
            ragContext ? `3D DOCUMENTATION CONTEXT -- Use ONLY components, props, and patterns found here. Do NOT hallucinate components that are not documented:\n${ragContext.slice(0, 6000)}` : '',
            '',
            promptContext ? `ADDITIONAL THREE.JS REFERENCE:\n${promptContext.slice(0, 3000)}` : '',
        ].filter(Boolean).join('\n');

        const PROTECTED_PATHS = new Set([
            'src/App.tsx', 'src/main.tsx', 'src/index.css', 'src/lib/utils.ts',
            'src/components/layout/AppLayout.tsx',
        ]);
        const BLOCKED_PATTERNS = ['Layout/Header', 'Layout/Footer', 'Layout/Layout', 'Layout/Sidebar'];

        try {
            const response = await invokeLLM(systemPrompt, userLLMPrompt, 0.7, 5);
            const parsed = parseChirActions(response);

            if (parsed.length > 0) {
                let accepted = false;
                for (const file of parsed) {
                    const filePath = file.path.startsWith('src/') ? file.path : spec.path;

                    if (PROTECTED_PATHS.has(filePath)) {
                        console.log(`    BLOCKED (protected): ${filePath}`);
                        continue;
                    }
                    if (BLOCKED_PATTERNS.some(p => filePath.includes(p))) {
                        console.log(`    BLOCKED (2D layout): ${filePath}`);
                        continue;
                    }

                    const isRequestedFile = filePath === spec.path ||
                        filePath.endsWith(`/${spec.name}.tsx`) ||
                        filePath.includes(spec.name);

                    if (!isRequestedFile && accepted) {
                        console.log(`    BLOCKED (extra file): ${filePath}`);
                        continue;
                    }

                    const generatedFile: GeneratedFile = {
                        path: filePath,
                        content: file.content,
                        phase: '3d_components',
                        exports: extractExports(file.content),
                        imports: extractImports(file.content),
                    };
                    newFiles.set(filePath, generatedFile);
                    registry.set(filePath, createRegistryEntry(generatedFile));
                    notifyFileCreated(generatedFile);
                    console.log(`    Streamed: ${filePath}`);
                    console.log(`    Generated: ${filePath} (${file.content.length} chars)`);
                    accepted = true;
                }
            } else {
                const codeMatch = response.match(/```(?:tsx|jsx|typescript|javascript)?\n([\s\S]*?)```/);
                const code = codeMatch ? codeMatch[1].trim() : response.trim();
                if (code.length > 100) {
                    const generatedFile: GeneratedFile = {
                        path: spec.path,
                        content: code,
                        phase: '3d_components',
                        exports: extractExports(code),
                        imports: extractImports(code),
                    };
                    newFiles.set(spec.path, generatedFile);
                    registry.set(spec.path, createRegistryEntry(generatedFile));
                    notifyFileCreated(generatedFile);
                    console.log(`    Generated (fallback): ${spec.path} (${code.length} chars)`);
                }
            }
        } catch (err: any) {
            console.error(`  [generate-3d] Failed to generate ${spec.name}: ${err.message}`);
        }
    }

    const generatedPaths = Array.from(newFiles.keys());
    console.log(`[generate-3d-component] Generated ${newFiles.size} 3D component files`);

    const importInstructions = buildImportInstructions(sectionSpecs, generatedPaths);
    console.log('[generate-3d] Writing back 3D component paths to brain');

    let updatedMemory = state.projectMemory;
    if (updatedMemory) {
        updatedMemory = updateMemory3D(updatedMemory, generatedPaths, importInstructions);
    }

    return {
        files: newFiles,
        fileRegistry: registry,
        projectMemory: updatedMemory,
        currentPhase: 'generate_3d_complete',
        messages: [`Generated ${newFiles.size} 3D section components: ${generatedPaths.join(', ')}`],
    };
}

function buildSectionSpecs(blueprint: WebsiteState['blueprint']): Section3DSpec[] {
    const specs: Section3DSpec[] = [];

    specs.push({
        name: 'LoadingScreen3D',
        path: 'src/components/3d/LoadingScreen3D.tsx',
        sectionType: 'loader',
        contentDescription: 'A cinematic loading screen shown while 3D assets initialize. Uses useProgress from drei to track loading. Shows a centered logo/brand name with an animated progress indicator (orbital spinner or progress bar). Dark background. Fades out when loading completes. This component does NOT contain a Canvas -- it is a pure HTML/CSS overlay.',
    });

    specs.push({
        name: 'NavBar3D',
        path: 'src/components/3d/NavBar3D.tsx',
        sectionType: 'navbar',
        contentDescription: 'A fixed glassmorphism navigation bar rendered as pure HTML/CSS (NOT inside a Canvas). Position fixed, top 0, z-index 50. Uses backdrop-blur-md, bg-black/30, border-bottom border-white/10. Links are white text with hover glow. Brand name left, nav links right. Mobile hamburger with animated open/close. NO lucide-react icons -- use pure CSS hamburger lines.',
    });

    specs.push({
        name: 'Footer3D',
        path: 'src/components/3d/Footer3D.tsx',
        sectionType: 'footer',
        contentDescription: 'A dark, cinematic footer rendered as pure HTML/CSS (NOT inside a Canvas). bg-black, border-top border-white/10. Multi-column layout with company info, links, social icons. Social icons are pure SVG paths (NO lucide-react). Subtle gradient or glow accents. Copyright at bottom.',
    });

    specs.push({
        name: 'HeroScene3D',
        path: 'src/components/3d/HeroScene3D.tsx',
        sectionType: 'hero',
        contentDescription: 'Immersive full-screen hero with animated 3D objects representing the business, floating particles, dramatic lighting, post-processing effects. This is the first thing users see after the loader.',
    });

    if (!blueprint?.pages || blueprint.pages.length === 0) {
        specs.push(
            { name: 'FeaturesScene3D', path: 'src/components/3d/FeaturesScene3D.tsx', sectionType: 'features', contentDescription: 'Animated 3D feature showcase with floating icons, orbital layout, glowing accents' },
            { name: 'ShowcaseScene3D', path: 'src/components/3d/ShowcaseScene3D.tsx', sectionType: 'showcase', contentDescription: 'Product/service display with rotating 3D objects, spotlight lighting, interactive hover' },
            { name: 'BackgroundScene3D', path: 'src/components/3d/BackgroundScene3D.tsx', sectionType: 'background', contentDescription: 'Ambient floating geometry and particles used as a page-level background layer' },
        );
        return specs;
    }

    const seenTypes = new Set<string>(['hero']);

    for (const page of blueprint.pages) {
        const sections = page.sections || [];
        for (const section of sections) {
            const sType = classifySection(section);
            if (seenTypes.has(sType)) continue;
            if (['footer', 'navbar', 'loader'].includes(sType)) continue;
            seenTypes.add(sType);

            const name = `${capitalize(sType)}Scene3D`;
            specs.push({
                name,
                path: `src/components/3d/${name}.tsx`,
                sectionType: sType,
                contentDescription: `3D scene for the "${section}" section. Generate content-relevant 3D objects, animated elements, and proper lighting for this section.`,
            });
        }
    }

    if (!seenTypes.has('background')) {
        specs.push({
            name: 'BackgroundScene3D',
            path: 'src/components/3d/BackgroundScene3D.tsx',
            sectionType: 'background',
            contentDescription: 'Ambient floating geometry and particles used as a page-level background layer behind content',
        });
    }

    return specs;
}

function classifySection(sectionName: string): string {
    const lower = sectionName.toLowerCase();
    if (lower.match(/hero|banner|landing|intro|welcome/)) return 'hero';
    if (lower.match(/feature|capability|benefit|what we/)) return 'features';
    if (lower.match(/product|showcase|gallery|portfolio|work|project/)) return 'showcase';
    if (lower.match(/pricing|plan|tier|package/)) return 'pricing';
    if (lower.match(/testimonial|review|client|customer|feedback/)) return 'testimonials';
    if (lower.match(/team|about|who we|staff|people/)) return 'about';
    if (lower.match(/contact|form|reach|touch|connect/)) return 'contact';
    if (lower.match(/cta|call to action|get started|sign up|join/)) return 'cta';
    if (lower.match(/faq|question|help|support/)) return 'faq';
    if (lower.match(/footer|bottom/)) return 'footer';
    if (lower.match(/stat|number|metric|counter|achievement/)) return 'stats';
    if (lower.match(/process|how|step|workflow/)) return 'process';
    if (lower.match(/blog|article|news|post/)) return 'blog';
    return 'generic';
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function build3DSystemPrompt(): string {
    return [
        'You are an Awwwards-level React Three Fiber developer.',
        'You create IMMERSIVE, CINEMATIC, INTERACTIVE 3D web experiences.',
        'Think Bruno Simon, Midwam, Vault.xyz, Noomo Agency quality.',
        'Generate a COMPLETE, ERROR-FREE, production-ready React component.',
        '',
        '=== ARCHITECTURE (READ CAREFULLY) ===',
        '',
        'There are THREE types of components. Each has STRICT rules:',
        '',
        'TYPE 1: 3D SCENE COMPONENTS (HeroScene3D, FeaturesScene3D, etc.)',
        '  - Export a React component that returns a REACT FRAGMENT (<>...</>)',
        '  - Contains ONLY R3F elements: lights, mesh, group, Float, Sparkles, ContactShadows, fog',
        '  - NEVER contains: Canvas, div, Html, ScrollControls, Scroll, EffectComposer, Suspense',
        '  - The PAGE places this component INSIDE its Canvas',
        '  - Accept NO props (or optional className that is IGNORED)',
        '  - Use useFrame for animation, useScroll to react to page scroll',
        '  - Example:',
        '    export const HeroScene3D = () => (',
        '      <>',
        '        <ambientLight intensity={0.2} />',
        '        <spotLight position={[10,10,10]} angle={0.15} penumbra={1} intensity={1.5} color="#f472b6" />',
        '        <fog attach="fog" args={["#000", 5, 20]} />',
        '        <Float speed={2} rotationIntensity={1}>',
        '          <mesh><icosahedronGeometry args={[1, 2]} /><MeshDistortMaterial color="#f472b6" speed={2} distort={0.3} /></mesh>',
        '        </Float>',
        '        <Sparkles count={60} scale={15} size={2} speed={0.3} color="#f472b6" />',
        '      </>',
        '    );',
        '    export default HeroScene3D;',
        '',
        'TYPE 2: NAVBAR3D (plain HTML, NOT 3D)',
        '  - Pure HTML <nav> element with glassmorphism styling',
        '  - Uses <Link to="..."> from react-router-dom (NOT <a href>)',
        '  - import { cn } from "@/lib/utils" for className merging',
        '  - position: fixed, top: 0, z-index: 50, backdrop-blur-md, bg-black/30',
        '  - Mobile hamburger: pure CSS spans (3 lines -> X animation)',
        '  - NO Canvas, NO 3D, NO lucide-react',
        '',
        'TYPE 3: FOOTER3D (plain HTML, NOT 3D)',
        '  - Pure HTML <footer> element with dark cinematic styling',
        '  - bg-black, border-t border-white/10, multi-column grid',
        '  - Social icons: inline SVG paths (NO lucide-react)',
        '  - NO Canvas, NO 3D',
        '',
        'TYPE 4: LOADINGSCREEN3D (HTML overlay)',
        '  - HTML overlay that wraps children',
        '  - import { useProgress } from "@react-three/drei"',
        '  - Fades out when progress === 100',
        '  - NO Canvas, NO 3D elements inside this component',
        '',
        '=== MATERIAL RULES ===',
        '- Intrinsic materials: LOWERCASE: <meshPhysicalMaterial>, <meshStandardMaterial>, <meshBasicMaterial>',
        '- Drei materials: CAPITALIZED: <MeshDistortMaterial>, <MeshWobbleMaterial>',
        '  (These are imported from @react-three/drei, not intrinsic JSX)',
        '- meshPhysicalMaterial: clearcoat={1} roughness={0.1} metalness={0.8}',
        '- MeshDistortMaterial: speed={2} distort={0.3} for organic shapes',
        '- MeshWobbleMaterial: speed={1} factor={0.3} for fluid motion',
        '',
        '=== INTERACTIVE 3D ===',
        '- onPointerOver={() => { document.body.style.cursor = "pointer" }}',
        '- onPointerOut={() => { document.body.style.cursor = "default" }}',
        '- Use useFrame with refs for smooth hover scale (lerp)',
        '',
        '=== BANNED (WILL CRASH) ===',
        '- NEVER use <Text> or <Text3D> from drei (requires font files)',
        '- NEVER use MeshTransmissionMaterial (GPU crash)',
        '- NEVER reference local font paths (/fonts/...)',
        '- NEVER use useGLTF or useTexture (no external assets)',
        '- NEVER import from lucide-react (not available)',
        '- NEVER import from @/components/ui/ (Button, Card, Input, Badge, SplitText, ClickSpark, TextPressure, Aurora, Galaxy, Hyperspeed, ProfileCard, CircularGallery DO NOT EXIST in 3D projects)',
        '- NEVER import SplitText, ClickSpark, TextPressure, or ANY decorative UI component -- build everything with native HTML/CSS',
        '- Keep icosahedronGeometry detail max [1, 4]',
        '- Max 80 Sparkles particles',
        '',
        '=== FORBIDDEN IN SCENE COMPONENTS (TYPE 1) ===',
        '- Canvas (page owns it)',
        '- div, section, or any HTML wrapper',
        '- Html from drei (page handles text in <Scroll html>)',
        '- ScrollControls / Scroll (page owns scrolling)',
        '- EffectComposer (page handles post-processing)',
        '- Suspense (page handles loading)',
        '- ErrorBoundary (page handles errors)',
        '- Environment (page adds it)',
        '',
        '=== ALLOWED IN SCENE COMPONENTS (TYPE 1) ===',
        '- mesh, group, <> fragment',
        '- All geometry: boxGeometry, sphereGeometry, icosahedronGeometry, coneGeometry, cylinderGeometry, planeGeometry, torusGeometry, torusKnotGeometry',
        '- All materials: meshPhysicalMaterial, meshStandardMaterial, meshBasicMaterial, MeshDistortMaterial, MeshWobbleMaterial',
        '- Float, Sparkles, ContactShadows, Stars (from drei)',
        '- Lights: ambientLight, spotLight, pointLight, directionalLight',
        '- fog',
        '- useFrame, useThree, useScroll (from drei)',
        '- useRef, useState, useMemo from React',
        '',
        '=== ERROR PREVENTION (MANDATORY) ===',
        '1. Scene components: return <> fragment, NEVER <div> or <Canvas>',
        '2. Drei materials are CAPITALIZED: <MeshDistortMaterial>, NOT <meshDistortMaterial>',
        '3. Intrinsic materials are LOWERCASE: <meshPhysicalMaterial>, NOT <MeshPhysicalMaterial>',
        '4. ErrorBoundary class: use this.props.children, NOT this.children',
        '5. Icosahedron: use args={[1, 2]}, NOT a detail prop',
        '6. NEVER duplicate imports -- each source appears ONCE',
        '7. useFrame: use refs for animation, NEVER setState',
        '8. Float: NEVER nest Float inside Float',
        '9. All components: BOTH named export AND default export',
        '10. NavBar3D: use <Link to="..."> from react-router-dom, NOT <a href>',
        '11. Import cn: import { cn } from "@/lib/utils"',
        '12. LoadingScreen3D: ({ children }: { children?: React.ReactNode })',
        '13. EffectComposer: NEVER use disableNormalPass prop (deprecated); use enableNormalPass={false} if needed',
        '',
        '=== DARK CINEMATIC PALETTE ===',
        '- Background: #000000 or #050505 (set by page, not scene)',
        '- Accent glow: theme-colored emissive materials',
        '- Fog: <fog attach="fog" args={["#000", 5, 20]} /> (in scene)',
        '',
        '=== IMPORT PATTERNS ===',
        "import { useFrame, useThree } from '@react-three/fiber';",
        "import { Float, ContactShadows, Sparkles, MeshDistortMaterial, MeshWobbleMaterial, useScroll } from '@react-three/drei';",
        "import * as THREE from 'three';",
        '',
        '=== EXPORT ===',
        'export const ComponentName = () => { ... };',
        'export default ComponentName;',
        '',
        'OUTPUT: <chirAction type="file" filePath="PATH">CODE</chirAction>',
    ].join('\n');
}

function getContentInstructions(sectionType: string, userPrompt: string): string {
    const business = userPrompt.slice(0, 200);

    const instructions: Record<string, string> = {
        navbar: `Create a PURE HTML navigation bar (this is NOT a 3D component -- NO Canvas).
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

STRUCTURE:
- <nav> with position fixed, top 0, left 0, right 0, z-index 50
- backdrop-blur-md bg-black/30 border-b border-white/10
- Brand name on left: <Link to="/"> with bold text, tracking-[0.2em], uppercase
- Nav links on right: <Link to="..."> for each page (NOT <a href>)
- Mobile hamburger: <button> toggles isOpen state
  - 3 <span> elements (w-6 h-0.5 bg-white) that animate to X via rotate/translate
- Mobile menu: fixed inset-0 overlay with <Link> items, closes on click
- NO lucide-react. NO Canvas. NO 3D.
Export: export const NavBar3D = ... ; export default NavBar3D;`,

        footer: `Create a PURE HTML footer (this is NOT a 3D component -- NO Canvas).
STRUCTURE:
- <footer> with bg-black text-white py-20 px-6 border-t border-white/10
- Gradient accent line at top: h-[1px] bg-gradient-to-r from-transparent via-[accentColor] to-transparent
- Multi-column grid (1-4 cols responsive):
  Column 1: Brand name + short description
  Column 2: Quick links (anchor tags)
  Column 3: Contact info
  Column 4: Social icons using inline SVG paths (X/Twitter, GitHub, LinkedIn, Instagram)
- Copyright bar at bottom: text-[10px] uppercase tracking-[0.3em] text-white/30
- Decorative blur circles: absolute positioned, rounded-full, blur-[120px], opacity-10
- Wrap in ErrorBoundary class component (this.props.children)
- NO lucide-react. NO Canvas. NO 3D.
Export: export const Footer3D = ... ; export default Footer3D;`,

        loader: `Create a PURE HTML/CSS loading screen overlay (NO Canvas).
import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

CRITICAL BANNED IMPORTS:
- NEVER import SplitText, ClickSpark, TextPressure, Aurora, Galaxy, Hyperspeed, ProfileCard, or ANY component from @/components/ui/
- NEVER import from @/components/ui/ -- THOSE FILES DO NOT EXIST
- The ONLY allowed external import is useProgress from @react-three/drei
- Build ALL visual effects with pure HTML, CSS, and inline styles

REQUIREMENTS:
- Wraps children: ({ children }: { children?: React.ReactNode })
- Overlay: position fixed, inset 0, z-index 9999, bg #000
- useProgress() -> { progress, active }
- Centered brand text using plain HTML <h1> and <p> with CSS animations
- Animated progress bar using a <div> with width transition based on progress value
- CSS keyframe animations for pulsing text, gradient shifts, and fade effects (use <style> tag)
- When progress >= 100 && !active: opacity 0, pointer-events none (CSS transition 0.8s)
- Children render behind the overlay (return <>{children}<overlay/>)</>)
- Cinematic corner accents using positioned <div> elements with gradient backgrounds
- Ambient glow using large blurred <div> with low opacity
- NO Canvas, NO @react-three/fiber imports, NO @/components/ui/ imports
Export: export const LoadingScreen3D = ... ; export default LoadingScreen3D;`,

        hero: `PURE R3F FRAGMENT -- NO Canvas, NO div, NO Html, NO EffectComposer.
Return <> fragment with ONLY R3F elements for "${business}".
- Cinematic lighting: ambientLight(0.2), spotLight with theme color, pointLight for accents
- fog: <fog attach="fog" args={["#000", 5, 20]} />
- Large floating procedural geometry relevant to the business (3-5 main objects)
- Use Float for gentle hovering, MeshDistortMaterial for organic shapes
- Sparkles (max 60) for atmosphere
- ContactShadows for grounding
- Interactive: onPointerOver/Out for hover scale via useFrame + refs
- useScroll() to react to page scroll offset (rotate/translate group)
- All objects wrapped in a <group> for scroll-driven animation`,

        features: `PURE R3F FRAGMENT -- NO Canvas, NO div.
Return <> fragment with R3F elements representing key features.
- 3-6 distinct geometric shapes arranged in a circular or grid pattern
- Each shape: unique color, Float wrapper, interactive hover
- Use MeshDistortMaterial or meshPhysicalMaterial with emissive
- Sparkles for ambient glow
- useScroll() to animate group based on scroll position`,

        showcase: `PURE R3F FRAGMENT -- NO Canvas, NO div.
Return <> fragment for a product/portfolio spotlight.
- Center a main 3D object (torusKnot, icosahedron, or similar)
- Dramatic spotlight from multiple angles
- ContactShadows for grounding
- Surrounding smaller orbiting objects
- useFrame for smooth rotation
- meshPhysicalMaterial with clearcoat, metalness for premium look
- Interactive: hover to pause rotation`,

        pricing: `PURE R3F FRAGMENT -- NO Canvas, NO div.
Return <> fragment with floating platforms at different heights.
- 3 cylinders or boxes at varying Y positions (basic/pro/enterprise)
- Higher tier = higher position = brighter emissive glow
- Each platform: meshPhysicalMaterial with clearcoat
- Subtle Sparkles between tiers
- useFrame for gentle floating animation`,

        testimonials: `PURE R3F FRAGMENT -- NO Canvas, NO div.
Return <> fragment with floating panels in an arc.
- 3-5 platform meshes arranged in a gentle curve
- meshPhysicalMaterial with transparency for glass effect
- Sparkles for dreamy atmosphere
- Each panel at slightly different rotation/height
- Warm colored pointLights
- Float with different speeds per panel`,

        about: `PURE R3F FRAGMENT -- NO Canvas, NO div.
Return <> fragment telling the brand story through 3D.
- Abstract geometry representing company values (spheres = unity, cones = growth)
- MeshDistortMaterial for organic, living shapes
- Orbital animation patterns using useFrame
- Warm directional lighting
- ContactShadows for grounding`,

        contact: `PURE R3F FRAGMENT -- NO Canvas, NO div.
Return <> fragment with welcoming interactive elements.
- Soft glowing spheres and organic shapes
- MeshDistortMaterial with gentle distortion
- Sparkles for ambient warmth
- Interactive: objects respond to pointer with scale/color change
- Calm, inviting color palette`,

        cta: `PURE R3F FRAGMENT -- NO Canvas, NO div.
Return <> fragment with energetic, attention-grabbing elements.
- Bright emissive geometry with pulsing animations (useFrame sin/cos intensity)
- Spinning rings (torusGeometry) and orbiting particles
- High-contrast colored lights
- Sparkles with fast speed`,

        stats: `PURE R3F FRAGMENT -- NO Canvas, NO div.
Return <> fragment with 3D blocks/pillars at varying heights.
- 4-6 box or cylinder meshes at different Y scales
- Emissive edges using meshStandardMaterial with strong emissiveIntensity
- useFrame to animate pillars growing upward
- Each pillar a different theme-related color`,

        process: `PURE R3F FRAGMENT -- NO Canvas, NO div.
Return <> fragment with a 3D timeline/step visualization.
- Connected spheres along a curved path
- Lines between nodes using <line> geometry
- Sequential glow: useFrame cycles emissiveIntensity through nodes
- Each node: different geometric shape and color`,

        blog: `PURE R3F FRAGMENT -- NO Canvas, NO div.
Return <> fragment with subtle editorial 3D background.
- Floating abstract shapes with low opacity materials
- Minimal Sparkles (count 30)
- Muted colors, soft ambientLight
- Gentle Float animations`,

        faq: `PURE R3F FRAGMENT -- NO Canvas, NO div.
Return <> fragment for FAQ section.
- Floating spheres arranged in question-mark shape
- Gentle orbiting animation via useFrame
- Soft blue/purple pointLights
- Subtle Sparkles`,

        gallery: `PURE R3F FRAGMENT -- NO Canvas, NO div.
Return <> fragment for gallery/portfolio.
- Minimal ambient particles (Stars or Sparkles)
- Very subtle floating geometry
- Dark atmosphere with small bright accent meshes`,

        background: `PURE R3F FRAGMENT -- NO Canvas, NO div.
Return <> fragment for ambient background layer.
- Floating geometric shapes at various depths (z: -2 to -8)
- Low-key Sparkles (count 40)
- Semi-transparent meshPhysicalMaterial (opacity 0.3)
- useScroll for subtle parallax movement
- This renders BEHIND other content, keep it subtle`,

        generic: `PURE R3F FRAGMENT -- NO Canvas, NO div.
Return <> fragment for "${business}".
- Floating geometry relevant to the business
- Cinematic lighting (ambient + spot + point)
- fog for depth
- Float and Sparkles for atmosphere
- Interactive hover on key meshes`,
    };

    return instructions[sectionType] || instructions.generic;
}

function buildImportInstructions(specs: Section3DSpec[], generatedPaths: string[]): string {
    const lines = [
        '=== 3D SECTION COMPONENT INTEGRATION GUIDE ===',
        '',
        'The following 3D components have been generated for EACH section of the website.',
        'EVERY page section MUST use its corresponding 3D component.',
        '',
    ];

    for (const spec of specs) {
        const matchedPath = generatedPaths.find(p => p.includes(spec.name));
        if (!matchedPath) continue;

        const importPath = '@/' + matchedPath.replace(/^src\//, '').replace('.tsx', '');

        lines.push(`SECTION: ${spec.sectionType.toUpperCase()}`);
        lines.push(`  Component: ${spec.name}`);
        lines.push(`  Import: const ${spec.name} = lazy(() => import('${importPath}'));`);

        if (spec.sectionType === 'hero') {
            lines.push('  Usage: <section className="relative min-h-[90vh] overflow-hidden">');
            lines.push(`    <Suspense fallback={<FallbackLoader />}><${spec.name} className="absolute inset-0" /></Suspense>`);
            lines.push('    <div className="relative z-10">...content...</div>');
            lines.push('  </section>');
        } else if (spec.sectionType === 'background') {
            lines.push(`  Usage: <${spec.name} className="fixed inset-0 -z-10" />`);
        } else {
            lines.push(`  Usage: <section className="relative min-h-[60vh] overflow-hidden">`);
            lines.push(`    <Suspense fallback={<FallbackLoader />}><${spec.name} className="absolute inset-0 -z-10" /></Suspense>`);
            lines.push('    <div className="relative z-10 container mx-auto px-4 py-20">...section content...</div>');
            lines.push('  </section>');
        }
        lines.push('');
    }

    lines.push('RULES:');
    lines.push('- Use React.lazy() + <Suspense> for every 3D import.');
    lines.push('- Provide a gradient div as Suspense fallback.');
    lines.push('- EVERY section must have a 3D background via its dedicated component.');
    lines.push('- Text over 3D MUST use text-white with text-shadow/drop-shadow.');
    lines.push('- 3D sections need overflow-hidden.');
    lines.push('- Keep each section position: relative so z-indexing works.');

    return lines.join('\n');
}
