import { WebsiteState } from '../graph-state';
import { queryDocumentation, isVectorStoreReady, tavilySearch } from '../../../rag/rag-3d';
import { invokeLLM } from '../llm-utils';
import crypto from 'crypto';

export async function rag3DContextNode(state: WebsiteState): Promise<Partial<WebsiteState>> {
    console.log('\n[rag-3d-context] Building RAG context from identified modules...');

    if (!state.enable3D) {
        console.log('[rag-3d-context] 3D not enabled, skipping.');
        return { currentPhase: 'rag_3d_skip', messages: ['RAG context skipped -- not 3D'] };
    }

    const modules = state.threeDModules || [];
    if (modules.length === 0) {
        console.log('[rag-3d-context] No 3D modules identified, skipping RAG.');
        return { ragContext: '', currentPhase: 'rag_3d_complete', messages: ['No 3D modules to query'] };
    }

    if (!isVectorStoreReady()) {
        console.warn('[rag-3d-context] Vector store not found, skipping RAG queries.');
        return { ragContext: '', currentPhase: 'rag_3d_complete', messages: ['Vector store not available'] };
    }

    const allChunks: { content: string; module: string; url: string; hash: string }[] = [];
    const seenHashes = new Set<string>();

    const addChunk = (content: string, mod: string, url: string) => {
        if (content.trim().length < 50) return;
        const hash = crypto.createHash('md5').update(content.trim().toLowerCase().replace(/\s+/g, ' ')).digest('hex');
        if (!seenHashes.has(hash)) {
            seenHashes.add(hash);
            allChunks.push({ content: content.trim(), module: mod, url, hash });
        }
    };

    for (const mod of modules) {
        try {
            const result = await queryDocumentation(mod);
            if (result.retrievedChunks > 0 && result.context) {
                const chunkParts = result.context.split('--- Chunk');
                for (const part of chunkParts) {
                    const moduleMatch = part.match(/Module:\s*(\S+)/);
                    const urlMatch = part.match(/Source:\s*(\S+)/);
                    addChunk(part, moduleMatch?.[1] || mod, urlMatch?.[1] || '');
                }
            }
            console.log(`  [rag-3d-context] ${mod}: ${result.retrievedChunks} chunks retrieved`);
        } catch (err: any) {
            console.warn(`  [rag-3d-context] Query failed for "${mod}": ${err.message?.slice(0, 60)}`);
        }
    }

    const promptKeywords = extractKeywords(state.userPrompt || '');
    if (promptKeywords.length > 0) {
        console.log(`  [rag-3d-context] Running prompt-based queries: ${promptKeywords.join(', ')}`);
        for (const keyword of promptKeywords) {
            try {
                const result = await queryDocumentation(keyword);
                if (result.retrievedChunks > 0 && result.context) {
                    const chunkParts = result.context.split('--- Chunk');
                    for (const part of chunkParts) {
                        const moduleMatch = part.match(/Module:\s*(\S+)/);
                        const urlMatch = part.match(/Source:\s*(\S+)/);
                        addChunk(part, moduleMatch?.[1] || keyword, urlMatch?.[1] || '');
                    }
                }
                console.log(`  [rag-3d-context] prompt:"${keyword}": ${result.retrievedChunks} chunks`);
            } catch {
                // silently skip failed prompt queries
            }
        }
    }

    console.log(`  [rag-3d-context] Running ${DEFAULT_3D_QUERIES.length} default 3D queries...`);
    for (const query of DEFAULT_3D_QUERIES) {
        try {
            const result = await queryDocumentation(query);
            if (result.retrievedChunks > 0 && result.context) {
                const chunkParts = result.context.split('--- Chunk');
                for (const part of chunkParts) {
                    const moduleMatch = part.match(/Module:\s*(\S+)/);
                    const urlMatch = part.match(/Source:\s*(\S+)/);
                    addChunk(part, moduleMatch?.[1] || query, urlMatch?.[1] || '');
                }
            }
        } catch { }
    }
    console.log(`  [rag-3d-context] Default queries done. Total chunks so far: ${allChunks.length}`);

    const llmExpanded = await expandQueriesWithLLM(state.userPrompt || '', modules);
    if (llmExpanded.length > 0) {
        console.log(`  [rag-3d-context] LLM expanded ${llmExpanded.length} additional queries: ${llmExpanded.slice(0, 5).join(', ')}...`);
        for (const query of llmExpanded) {
            try {
                const result = await queryDocumentation(query);
                if (result.retrievedChunks > 0 && result.context) {
                    const chunkParts = result.context.split('--- Chunk');
                    for (const part of chunkParts) {
                        const moduleMatch = part.match(/Module:\s*(\S+)/);
                        const urlMatch = part.match(/Source:\s*(\S+)/);
                        addChunk(part, moduleMatch?.[1] || query, urlMatch?.[1] || '');
                    }
                }
            } catch { }
        }
        console.log(`  [rag-3d-context] LLM expansion done. Total chunks: ${allChunks.length}`);
    }

    const totalQueries = modules.length + promptKeywords.length + DEFAULT_3D_QUERIES.length + llmExpanded.length;

    const topChunks = allChunks.slice(0, 70);

    let tavilyContext = '';
    const tavilyQueries = [
        `React Three Fiber ScrollControls page layout example ${new Date().getFullYear()}`,
        `@react-three/drei MeshDistortMaterial MeshWobbleMaterial usage`,
        `React Three Fiber EffectComposer Bloom postprocessing setup`,
    ];

    if (state.userPrompt) {
        const shortPrompt = state.userPrompt.slice(0, 80).replace(/[^a-zA-Z0-9\s]/g, '');
        tavilyQueries.push(`React Three Fiber 3D website ${shortPrompt}`);
    }

    console.log(`  [rag-3d-context] Running ${tavilyQueries.length} Tavily web searches...`);
    const tavilyResults: string[] = [];
    for (const query of tavilyQueries) {
        try {
            const results = await tavilySearch(query, 2);
            for (const r of results) {
                if (r.content && r.content.length > 100) {
                    tavilyResults.push(`--- Web Search: ${query} ---\nSource: ${r.url}\n${r.content.slice(0, 2000)}`);
                }
            }
        } catch { }
    }

    if (tavilyResults.length > 0) {
        tavilyContext = [
            '',
            '=== WEB SEARCH CONTEXT (Tavily) ===',
            '',
            ...tavilyResults.slice(0, 8),
            '',
            '=== END WEB SEARCH CONTEXT ===',
        ].join('\n');
        console.log(`  [rag-3d-context] Tavily: ${tavilyResults.length} web results appended`);
    } else {
        console.log(`  [rag-3d-context] Tavily: no results (API key may not be set)`);
    }

    const ragContext = [
        topChunks.length > 0 ? [
            '=== 3D DOCUMENTATION CONTEXT (from RAG vector store) ===',
            '',
            ...topChunks.map((c, i) => `--- RAG Chunk ${i + 1} (${c.module}) ---\n${c.content}`),
            '',
            '=== END 3D DOCUMENTATION CONTEXT ===',
        ].join('\n') : '',
        tavilyContext,
    ].filter(Boolean).join('\n');

    console.log(`[rag-3d-context] Built context: ${topChunks.length} RAG chunks + ${tavilyResults.length} web results from ${totalQueries} queries`);

    return {
        ragContext,
        currentPhase: 'rag_3d_complete',
        messages: [`RAG context: ${topChunks.length} chunks from ${totalQueries} queries + ${tavilyResults.length} web searches`],
    };
}

function extractKeywords(prompt: string): string[] {
    const words = prompt.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    const stopWords = new Set([
        'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'can', 'shall', 'must', 'and', 'but', 'or',
        'nor', 'not', 'so', 'yet', 'both', 'either', 'neither', 'for', 'to',
        'of', 'in', 'on', 'at', 'by', 'from', 'with', 'about', 'between',
        'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down',
        'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
        'i', 'me', 'my', 'we', 'our', 'you', 'your', 'it', 'its', 'they',
        'them', 'their', 'this', 'that', 'these', 'those', 'which', 'who',
        'make', 'create', 'build', 'want', 'need', 'like', 'website', 'web',
        'page', 'site', '3d', 'three', 'using', 'use',
    ]);

    const threejsTerms = [
        'animation', 'particle', 'glow', 'scene', 'material', 'geometry',
        'shader', 'lighting', 'shadow', 'reflection', 'glass', 'crystal',
        'float', 'orbit', 'scroll', 'interactive', 'immersive',
    ];

    const meaningful = words
        .filter(w => w.length > 2 && !stopWords.has(w))
        .slice(0, 8);

    const relevant3D = threejsTerms.filter(t => prompt.toLowerCase().includes(t));

    return [...new Set([...meaningful, ...relevant3D])].slice(0, 6);
}

const DEFAULT_3D_QUERIES = [
    'useFrame animation loop',
    'useThree camera viewport',
    'Canvas setup configuration',
    'ScrollControls pages damping',
    'Scroll html overlay',
    'useScroll offset scroll position',
    'Float animation component',
    'Sparkles particle effect',
    'ContactShadows ground shadow',
    'MeshDistortMaterial organic shape',
    'MeshWobbleMaterial wobble effect',
    'meshPhysicalMaterial clearcoat metalness',
    'meshStandardMaterial emissive glow',
    'EffectComposer postprocessing bloom',
    'Bloom luminance threshold smoothing',
    'Vignette darkness offset',
    'Noise grain effect',
    'Environment preset reflections',
    'PerspectiveCamera makeDefault',
    'fog depth atmosphere',
    'ambientLight intensity',
    'spotLight angle penumbra',
    'pointLight color position',
    'directionalLight shadow',
    'icosahedronGeometry args detail',
    'sphereGeometry segments',
    'torusGeometry tube radius',
    'torusKnotGeometry parameters',
    'boxGeometry dimensions',
    'coneGeometry height segments',
    'cylinderGeometry cap',
    'planeGeometry size',
    'group position rotation scale',
    'mesh onPointerOver onPointerOut',
    'useRef THREE.Mesh animation',
    'THREE.MathUtils.lerp smooth',
    'THREE.Vector3 set lerp',
    'THREE.Color setHSL',
    'Html drei overlay component',
    'Loader progress loading screen',
    'useProgress active progress',
    'Stars count depth',
    'Billboard face camera',
    'OrbitControls interaction',
    'React.lazy dynamic import suspense',
];

async function expandQueriesWithLLM(userPrompt: string, existingModules: string[]): Promise<string[]> {
    try {
        const prompt = `You are a Three.js/R3F technical query generator. Given this website idea: "${userPrompt.slice(0, 400)}"
And these already-identified 3D modules: ${existingModules.join(', ')}

Return exactly 10 RAG queries as a JSON array targeting specific R3F components, Drei helpers, Three.js materials, animations, lighting, postprocessing needed. Return ONLY a JSON array of strings, nothing else.

Example output:
["Float animation floating objects drei", "Environment preset warm lighting", "ContactShadows soft shadow ground", "Bloom postprocessing glow EffectComposer", "Html overlay button UI drei", "useFrame smooth animation lerp", "MeshStandardMaterial metalness roughness", "Sparkles particles atmosphere", "PresentationControls product rotation", "ScrollControls scroll sections"]`;

        const response = await invokeLLM(
            'Return only a JSON array of 10 search query strings. No markdown, no explanation.',
            prompt,
            0.3
        );

        const cleaned = response.replace(/```[\s\S]*?```/g, '').trim();
        const match = cleaned.match(/\[([\s\S]*?)\]/);
        if (match) {
            const parsed = JSON.parse(`[${match[1]}]`);
            if (Array.isArray(parsed)) {
                return parsed.filter((q: any) => typeof q === 'string' && q.length > 3).slice(0, 10);
            }
        }
    } catch (err: any) {
        console.warn(`  [rag-3d-context] LLM query expansion failed: ${err.message?.slice(0, 60)}`);
    }
    return [];
}

