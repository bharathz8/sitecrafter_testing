import { WebsiteState } from '../graph-state';
import { queryDocumentation, queryDocumentationDiverse, isVectorStoreReady, tavilySearch } from '../../../rag/rag-3d';
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

    console.log(`  [rag-3d-context] Running LLM-expanded queries FIRST (project-specific priority)...`);
    const llmExpanded = await expandQueriesWithLLM(state.userPrompt || '', modules);
    if (llmExpanded.length > 0) {
        console.log(`  [rag-3d-context] LLM expanded ${llmExpanded.length} queries: ${llmExpanded.slice(0, 5).join(', ')}...`);
        for (const query of llmExpanded) {
            try {
                const result = await queryDocumentationDiverse(query);
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

    console.log(`  [rag-3d-context] Running ${DEFAULT_3D_QUERIES.length} default 3D queries (banned terms filtered)...`);
    const safeDefaults = DEFAULT_3D_QUERIES.filter(q => !BANNED_RAG_TERMS.some(b => q.toLowerCase().includes(b.toLowerCase())));
    for (const query of safeDefaults) {
        try {
            const result = await queryDocumentationDiverse(query);
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

    const totalQueries = modules.length + promptKeywords.length + safeDefaults.length + llmExpanded.length;

    // Module-balanced chunk selection: group by module, take proportional slices
    const chunkBuckets: Record<string, typeof allChunks> = {};
    for (const chunk of allChunks) {
        const mod = (chunk.module || 'general').toLowerCase();
        let bucket = 'general';
        if (mod.includes('three') && !mod.includes('fiber')) bucket = 'threejs';
        else if (mod.includes('drei')) bucket = 'drei';
        else if (mod.includes('r3f') || mod.includes('fiber') || mod.includes('react-three')) bucket = 'r3f';
        if (!chunkBuckets[bucket]) chunkBuckets[bucket] = [];
        chunkBuckets[bucket].push(chunk);
    }
    const TARGET_CHUNKS = 100;
    const threejsSlice = Math.ceil(TARGET_CHUNKS * 0.3);
    const dreiSlice = Math.ceil(TARGET_CHUNKS * 0.4);
    const r3fSlice = Math.ceil(TARGET_CHUNKS * 0.2);
    const generalSlice = TARGET_CHUNKS - threejsSlice - dreiSlice - r3fSlice;

    const topChunks = [
        ...(chunkBuckets['threejs'] || []).slice(0, threejsSlice),
        ...(chunkBuckets['drei'] || []).slice(0, dreiSlice),
        ...(chunkBuckets['r3f'] || []).slice(0, r3fSlice),
        ...(chunkBuckets['general'] || []).slice(0, generalSlice),
    ];

    // Fill remaining slots from any bucket
    if (topChunks.length < TARGET_CHUNKS) {
        const used = new Set(topChunks.map(c => c.hash));
        for (const chunk of allChunks) {
            if (topChunks.length >= TARGET_CHUNKS) break;
            if (!used.has(chunk.hash)) {
                topChunks.push(chunk);
                used.add(chunk.hash);
            }
        }
    }

    console.log(`  [rag-3d-context] Module-balanced selection: ${topChunks.length} chunks (threejs:${(chunkBuckets['threejs'] || []).slice(0, threejsSlice).length} drei:${(chunkBuckets['drei'] || []).slice(0, dreiSlice).length} r3f:${(chunkBuckets['r3f'] || []).slice(0, r3fSlice).length} general:${(chunkBuckets['general'] || []).slice(0, generalSlice).length})`);

    let tavilyContext = '';
    const tavilyQueries = [
        `awwwards site of the year 3D website react three fiber ${new Date().getFullYear()}`,
        `Bruno Simon portfolio techniques three.js breakdown`,
        `react three fiber particle morphing BufferGeometry example`,
        `GLSL shader material animated background react three fiber`,
        `codrops creative coding WebGL scroll storytelling ${new Date().getFullYear()}`,
        `Active Theory agency 3D web experience techniques`,
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
    const threejsTerms = [
        'particle', 'glow', 'shader', 'lighting', 'shadow', 'reflection',
        'glass', 'crystal', 'orbit', 'scroll', 'immersive', 'hologram',
        'neon', 'plasma', 'aurora', 'nebula', 'morph', 'wireframe',
        'metallic', 'emissive', 'bloom', 'vignette', 'fog', 'caustics',
    ];

    const promptLower = prompt.toLowerCase();
    const found = threejsTerms.filter(t => promptLower.includes(t));

    const businessTerms = promptLower
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !STOP_WORDS.has(w))
        .slice(0, 4);

    return [...new Set([...found, ...businessTerms])].slice(0, 6);
}

const STOP_WORDS = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'shall', 'must', 'and', 'but', 'or',
    'nor', 'not', 'so', 'yet', 'both', 'either', 'neither', 'for', 'to',
    'of', 'in', 'on', 'at', 'by', 'from', 'with', 'about', 'between',
    'through', 'during', 'before', 'after', 'above', 'below',
    'make', 'create', 'build', 'want', 'need', 'like', 'website', 'web',
    'page', 'site', 'three', 'using', 'use', 'this', 'that', 'what',
    'which', 'where', 'when', 'only', 'just', 'also', 'very', 'some',
    'than', 'then', 'because', 'each', 'every', 'such', 'here', 'there',
]);

const BANNED_RAG_TERMS = [
    'useSpring',
    'MeshTransmissionMaterial',
    'useGLTF',
    'useFBX',
    'DreiImage',
    'Reflector',
    'softShadows',
    'Text3D',
    'useTexture',
];

const DEFAULT_3D_QUERIES = [
    'useFrame animation loop',
    'Canvas setup configuration',
    'ScrollControls pages damping useScroll',
    'MeshDistortMaterial organic shape',
    'meshPhysicalMaterial clearcoat metalness emissive',
    'Bloom luminance threshold EffectComposer',
    'Environment preset reflections',
    'ShaderMaterial vertexShader fragmentShader uTime uniform',
    'CatmullRomCurve3 camera path scroll animation',
    'particle morph BufferGeometry position lerp useFrame',
    'Stars deep space background drei',
    'AdaptiveDpr AdaptiveEvents performance drei',
    'useProgress active progress loading',
    'PresentationControls product showcase drei',
    'fog depth atmosphere ambientLight spotLight',
];



async function expandQueriesWithLLM(userPrompt: string, existingModules: string[]): Promise<string[]> {
    try {
        const prompt = `You are an expert Three.js/React Three Fiber Technical Architect.
Your task is to analyze the user's business requirements and strictly determine the optimal 3D rendering techniques (materials, shaders, geometry, lighting, math/animations) needed to achieve a cinematic quality specific to their industry.

User's Request: "${userPrompt.slice(0, 400)}"

Already identified generic 3D modules: ${existingModules.join(', ')}

First, intuitively guess the business type (e.g., Tech Startup, Bakery, Fashion Brand, Beverage, Sports, Cosmic, Medical, Automotive).
Then, strictly formulate exactly 15 highly technical RAG (Retrieval-Augmented Generation) search queries to fetch documentation from our vector database. These queries should pull specific documentation on how to build the required visual aesthetics.

Examples of industry-specific queries:
- Beverage: "glass transmission refraction IOR liquid shader", "tube cylinder organic curved geometry refractive"
- Tech/AI: "wireframe grid holographic neon glitch shader", "data visualization floating node network procedural"
- Food: "organic blob shape metaball smooth merge geometry", "warm ambient light golden hour soft shadow"
- Space: "galaxy star field procedural noise GLSL shader", "nebula volumetric fog density color gradient"

Generate EXACTLY 15 queries. Focus heavily on 'ShaderMaterial', 'meshPhysicalMaterial props', 'particle systems', 'postprocessing Bloom/Noise', and 'useFrame math lerp'.

Return ONLY a JSON array of 15 strings. Nothing else.`;

        const response = await invokeLLM(
            'Return only a JSON array of 15 search query strings. No markdown, no explanation.',
            prompt,
            0.5
        );

        const cleaned = response.replace(/```[\s\S]*?```/g, '').trim();
        const match = cleaned.match(/\[([\s\S]*?)\]/);
        if (match) {
            const parsed = JSON.parse(`[${match[1]}]`);
            if (Array.isArray(parsed)) {
                return parsed
                    .filter((q: any) => typeof q === 'string' && q.length > 3)
                    .filter((q: string) => !BANNED_RAG_TERMS.some(b => q.toLowerCase().includes(b.toLowerCase())))
                    .slice(0, 15);
            }
        }
    } catch (err: any) {
        console.warn(`  [rag-3d-context] LLM query expansion failed: ${err.message?.slice(0, 60)}`);
    }
    return [];
}

