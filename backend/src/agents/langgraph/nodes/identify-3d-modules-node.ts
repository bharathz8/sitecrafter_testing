import { WebsiteState } from '../graph-state';
import { invokeLLM } from '../llm-utils';

export async function identify3DModulesNode(state: WebsiteState): Promise<Partial<WebsiteState>> {
    console.log('\n[identify-3d-modules] Identifying required 3D modules...');

    if (!state.enable3D) {
        console.log('[identify-3d-modules] 3D not enabled, skipping.');
        return { currentPhase: 'identify_3d_skip', messages: ['3D module identification skipped'] };
    }

    const userPrompt = state.userPrompt || '';
    const blueprintDesc = state.blueprint?.description || '';
    const pages = state.blueprint?.pages?.map(p => `${p.name}: ${p.description}`).join('\n') || '';
    const sections = state.blueprint?.pages?.flatMap(p => p.sections || []).join(', ') || '';

    const systemPrompt = [
        'You are an expert React Three Fiber and Three.js architect.',
        'Given a website project, identify 25-35 3D modules/components needed to build a FULLY 3D website.',
        'Every section of every page will be rendered with 3D elements, so you need a wide variety.',
        '',
        'Return a JSON object with two arrays:',
        '{',
        '  "core": ["Canvas", "useFrame", ...],',
        '  "content": ["Sphere", "MeshDistortMaterial", ...]',
        '}',
        '',
        'CORE MODULES (always include these ~10):',
        '- Canvas, useFrame, useThree, PerspectiveCamera, OrbitControls',
        '- Environment, ambientLight, directionalLight, pointLight, Float',
        '',
        'CONTENT MODULES (pick 15-25 based on the project theme):',
        '- Geometry: Sphere, Box, Torus, TorusKnot, Cylinder, Cone, RoundedBox, Dodecahedron, Icosahedron, Ring, Plane',
        '- Materials: MeshStandardMaterial, MeshPhysicalMaterial, MeshDistortMaterial, MeshWobbleMaterial, meshNormalMaterial',
        '- Effects: Sparkles, Stars, ContactShadows, Bloom, fog',
        '- Layout: Html, Center, Billboard, ScrollControls, Scroll, useScroll',
        '- Animation: useSpring, Trail, MeshPortalMaterial',
        '- Interaction: useCursor, useIntersect',
        '',
        'BANNED (NEVER include):',
        '- Text, Text3D (requires font files that crash at runtime)',
        '- MeshTransmissionMaterial (crashes WebGL context)',
        '- useGLTF, useTexture (no external assets available)',
        '',
        'CONTENT AWARENESS:',
        '- For food/bakery: Sphere, Torus, Cylinder, RoundedBox, organic shapes',
        '- For tech/SaaS: Box, Dodecahedron, wireframes, MeshDistortMaterial, Grid',
        '- For creative/portfolio: Float, ScrollControls, MeshWobbleMaterial, Sparkles',
        '- For e-commerce: RoundedBox, Cylinder, Ring, MeshPhysicalMaterial, reflections',
        '- For agency: Stars, fog, Bloom effects, dramatic lighting',
        '',
        'Return valid JSON only, no markdown, no explanation.',
    ].join('\n');

    const prompt = [
        `PROJECT: ${blueprintDesc}`,
        `USER REQUEST: ${userPrompt}`,
        `PAGES:\n${pages}`,
        `SECTIONS: ${sections}`,
        '',
        'Identify 25-35 React Three Fiber / Drei / Three.js modules for a FULLY 3D website where every section is 3D.',
    ].join('\n');

    try {
        const response = await invokeLLM(systemPrompt, prompt, 0.3, 3);

        let modules: string[] = [];
        try {
            const jsonMatch = response.match(/\{[\s\S]*?\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                const core = Array.isArray(parsed.core) ? parsed.core : [];
                const content = Array.isArray(parsed.content) ? parsed.content : [];
                modules = [...core, ...content];
            }
            if (modules.length === 0) {
                const arrayMatch = response.match(/\[[\s\S]*?\]/);
                if (arrayMatch) {
                    modules = JSON.parse(arrayMatch[0]);
                }
            }
        } catch {
            console.warn('[identify-3d-modules] Failed to parse JSON, using defaults');
        }

        const banned = ['Text', 'Text3D', 'MeshTransmissionMaterial', 'useGLTF', 'useTexture'];
        modules = modules.filter(m => !banned.includes(m));

        if (!Array.isArray(modules) || modules.length < 10) {
            modules = getContentAwareDefaults(userPrompt);
        }

        const unique = [...new Set(modules)].slice(0, 35);
        console.log(`[identify-3d-modules] Identified ${unique.length} modules: ${unique.join(', ')}`);

        return {
            threeDModules: unique,
            currentPhase: 'identify_3d_complete',
            messages: [`Identified ${unique.length} 3D modules: ${unique.join(', ')}`],
        };
    } catch (err: any) {
        console.error('[identify-3d-modules] LLM call failed:', err.message);
        const fallback = getContentAwareDefaults(userPrompt);
        return {
            threeDModules: fallback,
            currentPhase: 'identify_3d_complete',
            messages: [`3D module identification failed, using ${fallback.length} defaults`],
        };
    }
}

function getContentAwareDefaults(prompt: string): string[] {
    const base = [
        'Canvas', 'useFrame', 'useThree', 'PerspectiveCamera', 'OrbitControls',
        'Environment', 'ambientLight', 'directionalLight', 'pointLight', 'Float',
        'Sparkles', 'ContactShadows', 'Html', 'Center',
        'MeshStandardMaterial', 'MeshPhysicalMaterial', 'MeshDistortMaterial',
    ];

    const lower = prompt.toLowerCase();

    if (lower.match(/food|cake|bake|restaurant|chef|kitchen|edible|dessert|sweet/)) {
        return [...base, 'Sphere', 'Torus', 'Cylinder', 'RoundedBox', 'MeshWobbleMaterial', 'Stars', 'Ring', 'Cone'];
    }
    if (lower.match(/tech|saas|startup|software|ai|data|cloud|platform|dashboard/)) {
        return [...base, 'Box', 'Dodecahedron', 'Icosahedron', 'Grid', 'Trail', 'Stars', 'Bloom', 'fog'];
    }
    if (lower.match(/portfolio|creative|design|art|photography|studio/)) {
        return [...base, 'ScrollControls', 'Scroll', 'useScroll', 'MeshWobbleMaterial', 'Billboard', 'Stars', 'Ring'];
    }
    if (lower.match(/shop|store|ecommerce|product|buy|sell|fashion|clothing/)) {
        return [...base, 'RoundedBox', 'Cylinder', 'Ring', 'Plane', 'Billboard', 'Stars', 'Torus'];
    }

    return [...base, 'Sphere', 'Box', 'Torus', 'Stars', 'MeshWobbleMaterial', 'ScrollControls', 'RoundedBox', 'Dodecahedron'];
}
