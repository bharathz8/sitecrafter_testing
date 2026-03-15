import { WebsiteState, GeneratedFile, createRegistryEntry } from '../graph-state';
import { invokeLLM, parseChirActions, extractExports, extractImports } from '../llm-utils';
import { getMemoryContext, updateMemory3D } from '../project-memory';
import { threeDPromptContext } from '../../../prompts/3dpromptcontext';
import { notifyFileCreated, notifyPhaseChange } from '../website-graph';
import OpenAI from 'openai';

const apiKeys = [
    process.env.gemini13,
    process.env.gemini12,
    process.env.gemini8,
    process.env.gemini9,
    process.env.gemini10,
    process.env.gemini11,
    process.env.gemini,
    process.env.gemini3,
    process.env.gemini4,
    process.env.gemini7,
    process.env.gemini6,
    process.env.gemini5,
    process.env.gemini2,
].filter(key => key && key.length > 0) as string[];

let currentKeyIndex = Math.floor(Math.random() * Math.max(apiKeys.length, 1));
function getClient(): OpenAI {
    return new OpenAI({
        apiKey: apiKeys[currentKeyIndex] || process.env.gemini2,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });
}
function rotateKey() {
    if (apiKeys.length > 1) currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
}

interface Section3DSpec {
    name: string;
    path: string;
    sectionType: string;
    contentDescription: string;
    geometryIdea: string;
    colorMood: string;
    animationStyle: string;
}

interface BusinessDNA {
    industry: string;
    energyLevel: string;
    sceneArchetype: string;
    colorTemperature: string;
    motionStyle: string;
    visualKeywords: string[];
    shaderRecommendation: string;
    particleStyle: string;
    narrativeArc: string;
}

async function extractBusinessDNA(userPrompt: string, blueprint: WebsiteState['blueprint']): Promise<BusinessDNA> {
    const prompt = `Analyze this business and extract its complete visual DNA for a cinematic 3D website.

BUSINESS: "${userPrompt}"
BLUEPRINT: ${blueprint?.description || ''}

Return a JSON object with these EXACT keys:
{
  "industry": "e.g. tech | luxury | creative | medical | food | finance | fitness | education | fashion | automotive",
  "energyLevel": "calm | dynamic | explosive",
  "sceneArchetype": "e.g. CosmicNebula | LiquidMetal | BioluminescentForest | CrystallineVault | DigitalMatrix | FloatingIslands | AuroraBorealis | DeepOcean | NeonMetropolis | EtherealGarden",
  "colorTemperature": "cool-blue | warm-gold | neon-cyan | deep-purple | emerald-dark | rose-champagne | midnight-crimson | arctic-white",
  "motionStyle": "fluid | snappy | organic | mechanical | ethereal",
  "visualKeywords": ["3-5 specific visual concepts e.g. precision, speed, luxury, trust, warmth"],
  "shaderRecommendation": "aurora | hologram | plasma | deepspace | liquidmetal",
  "particleStyle": "nebula | constellation | firefly | data-stream | stardust | embers | snowfall | pollen",
  "narrativeArc": "One sentence: the emotional journey from landing to CTA for this specific business"
}

Return ONLY valid JSON.`;

    try {
        rotateKey();
        const response = await getClient().chat.completions.create({
            model: 'gemini-2.5-flash-lite',
            messages: [
                { role: 'system', content: 'You are a creative director for Awwwards-winning 3D websites. Return only JSON.' },
                { role: 'user', content: prompt },
            ],
            temperature: 0.3,
        });

        const content = response.choices[0].message.content || '{}';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (err: any) {
        console.warn('[3D-DNA] Analysis failed:', err.message?.slice(0, 60));
    }

    return {
        industry: 'modern-business',
        energyLevel: 'dynamic',
        sceneArchetype: 'CosmicNebula',
        colorTemperature: 'deep-purple',
        motionStyle: 'fluid',
        visualKeywords: ['precision', 'innovation', 'premium', 'trust'],
        shaderRecommendation: 'aurora',
        particleStyle: 'nebula',
        narrativeArc: 'From mysterious darkness to vibrant revelation to confident action',
    };
}

async function buildBusinessSpecificSections(
    userPrompt: string,
    blueprint: WebsiteState['blueprint'],
    dna: BusinessDNA
): Promise<Section3DSpec[]> {

    const prompt = `You are an Awwwards-winning 3D web experience designer.

BUSINESS: "${userPrompt}"
VISUAL DNA: ${JSON.stringify(dna)}
PAGES: ${blueprint?.pages?.map(p => p.name).join(', ') || 'Home, Features, About, Contact'}
SECTIONS: ${blueprint?.pages?.flatMap(p => p.sections || []).join(', ') || 'Hero, Features, Showcase, Contact'}

Design 6-9 UNIQUE 3D scene components. Each must:
1. Feel COMPLETELY DIFFERENT from standard templates
2. Use geometry/materials that MATCH this exact business
3. Have a distinct visual personality
4. Create EMOTIONAL IMPACT through scroll-driven narrative

MANDATORY COMPONENTS (always include):
- LoadingScreen3D: HTML overlay, uses useProgress, NO Canvas
- NavBar3D: Glassmorphism HTML nav, NO Canvas  
- Footer3D: Dark cinematic HTML footer, NO Canvas

THEN add 5-6 BUSINESS-SPECIFIC SCENE components (fragments, NOT Canvas):

Return JSON array:
[
  {
    "name": "UniqueNameScene3D",
    "path": "src/components/3d/UniqueNameScene3D.tsx",
    "sectionType": "hero|features|showcase|process|stats|testimonials|cta|ambient|about|contact",
    "contentDescription": "Detailed 3-4 sentence description of WHAT this 3D scene contains, what geometries, materials, animations, and the EMOTIONAL NARRATIVE it tells through scroll",
    "geometryIdea": "e.g. 5 oversized donut geometries with custom aurora ShaderMaterial rotating around a central distorted sphere, connected by particle streams",
    "colorMood": "e.g. warm amber emissive with cream highlights, fog in #1a0800",
    "animationStyle": "e.g. slow counterrotating rings with scroll-linked y-position shift and particle morph at offset 0.5"
  }
]

BE MAXIMALLY CREATIVE. Think Bruno Simon, Active Theory, Resn.co.nz quality.
Return ONLY the JSON array.`;

    try {
        rotateKey();
        const response = await getClient().chat.completions.create({
            model: 'gemini-2.5-flash-lite',
            messages: [
                { role: 'system', content: 'You are a world-class 3D creative director. Design stunning, unique section concepts with scroll-driven narratives. Return only JSON.' },
                { role: 'user', content: prompt },
            ],
            temperature: 1.0,
        });

        const content = response.choices[0].message.content || '[]';
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const specs = JSON.parse(jsonMatch[0]) as Section3DSpec[];
            console.log(`[3D-Specs] Generated ${specs.length} business-specific sections`);
            return specs;
        }
    } catch (err: any) {
        console.warn('[3D-Specs] LLM failed:', err.message?.slice(0, 60));
    }

    return buildFallbackSpecs(dna);
}

function buildFallbackSpecs(dna: BusinessDNA): Section3DSpec[] {
    return [
        {
            name: 'LoadingScreen3D',
            path: 'src/components/3d/LoadingScreen3D.tsx',
            sectionType: 'loader',
            contentDescription: 'HTML loading overlay with useProgress. Dark background, brand name, animated progress bar.',
            geometryIdea: 'pure HTML overlay, no 3D',
            colorMood: 'dark with accent glow',
            animationStyle: 'fade out when progress complete',
        },
        {
            name: 'NavBar3D',
            path: 'src/components/3d/NavBar3D.tsx',
            sectionType: 'navbar',
            contentDescription: 'Fixed glassmorphism navigation bar. Pure HTML, backdrop-blur, no Canvas.',
            geometryIdea: 'pure HTML nav',
            colorMood: 'bg-black/30 border-white/10',
            animationStyle: 'hamburger toggle on mobile',
        },
        {
            name: 'Footer3D',
            path: 'src/components/3d/Footer3D.tsx',
            sectionType: 'footer',
            contentDescription: 'Dark cinematic footer. Multi-column, inline SVG social icons. Pure HTML.',
            geometryIdea: 'pure HTML footer',
            colorMood: 'bg-black border-white/10',
            animationStyle: 'gradient accent line top',
        },
        {
            name: 'HeroScene3D',
            path: 'src/components/3d/HeroScene3D.tsx',
            sectionType: 'hero',
            contentDescription: `NARRATIVE ROLE: Opening chapter. Scroll 0%: darkness with single glowing particle. Scroll 15%: particle explodes into 3000-particle nebula. Scroll 35%: particles converge into business-representative 3D shape. Scroll 60%: shape rotates revealing business name. Scroll 85%: camera zooms close filling viewport. Scroll 100%: flash transition. Uses CinematicCamera on CatmullRomCurve3, ParticleMorph system, ${dna.shaderRecommendation} ShaderMaterial background, animated Bloom 0.3-3.5 and Vignette 0.85-0.1 over scroll. Mouse parallax shifts objects 0.3 units.`,
            geometryIdea: `Central ${dna.sceneArchetype} geometry with particle morph system (scatter -> sphere -> explosion), ${dna.shaderRecommendation} shader background plane`,
            colorMood: dna.colorTemperature,
            animationStyle: `${dna.motionStyle} with scroll-driven 3-act narrative arc and cinematic camera fly-through`,
        },
        {
            name: 'FeaturesScene3D',
            path: 'src/components/3d/FeaturesScene3D.tsx',
            sectionType: 'features',
            contentDescription: `NARRATIVE ROLE: The reveal act. Each feature is a 3D floating island at different depths. As camera scrolls past each island it LIGHTS UP with details emerging. Islands are connected by glowing particle streams like neural networks. Hovering an island makes it rise y+0.5 with particles orbiting faster, emissive intensity triples. Each island activates at scroll offsets 0.2, 0.4, 0.6, 0.8. Html labels appear above each island.`,
            geometryIdea: `4-5 floating island geometries each with different shape (${dna.visualKeywords.join(', ')} themed), connected by custom BufferGeometry particle lines`,
            colorMood: dna.colorTemperature,
            animationStyle: 'scroll-linked activation sequence with hover interactions and particle connections',
        },
        {
            name: 'ShowcaseScene3D',
            path: 'src/components/3d/ShowcaseScene3D.tsx',
            sectionType: 'showcase',
            contentDescription: `NARRATIVE ROLE: The wow moment. Central hero object rotates on pedestal with PresentationControls for drag/rotate. 3-angle spotlight drama creating studio lighting. Orbiting detail geometries at radius=3 animated in useFrame. ContactShadows for grounded feel. Environment preset for reflections. ChromaticAberration on edges for premium feel.`,
            geometryIdea: 'Central hero geometry scale 2.5-3.5 with meshPhysicalMaterial (clearcoat=1, roughness=0, metalness=0.95), orbiting micro-geometries',
            colorMood: dna.colorTemperature,
            animationStyle: 'slow auto-rotation with hover pause and emissive increase',
        },
        {
            name: 'AboutScene3D',
            path: 'src/components/3d/AboutScene3D.tsx',
            sectionType: 'about',
            contentDescription: `NARRATIVE ROLE: Humanizing chapter. Calm, warm atmosphere contrasting energetic sections. Slow-moving organic shapes like breathing organisms. Warm lighting shifts from cool blue to amber over scroll. MeshDistortMaterial (distort=0.2, speed=1) for organic life. Soft ContactShadows. Slow Float animation (speed=0.3). HTML overlay smooth fade-in at scroll 0.3.`,
            geometryIdea: 'Organic morphing geometries with MeshDistortMaterial, particle figure morph at scroll 0.5',
            colorMood: 'warm amber gold shifting from cool',
            animationStyle: `${dna.motionStyle} organic breathing with slow documentary camera pan`,
        },
        {
            name: 'ContactScene3D',
            path: 'src/components/3d/ContactScene3D.tsx',
            sectionType: 'cta',
            contentDescription: `NARRATIVE ROLE: Closing chapter. Scene CONVERGES toward central glowing gateway form (torus with plasma shader). 500 particles flow inward from all directions. Intense Bloom (intensity=4.0) on gateway. Stars background (count=500, depth=50, fade=true). HTML contact form positioned via absolute CSS over Canvas.`,
            geometryIdea: 'Central gateway torus with plasma ShaderMaterial, convergence particle system, Stars background',
            colorMood: dna.colorTemperature,
            animationStyle: 'convergence animation with explosive particle burst on interaction',
        },
        {
            name: 'AmbientScene3D',
            path: 'src/components/3d/AmbientScene3D.tsx',
            sectionType: 'ambient',
            contentDescription: 'Subtle ambient particle field for background layers. Low-opacity floating geometry at varying depths.',
            geometryIdea: 'Sparkles + 8 small semi-transparent spheres at varying depths z=-3 to z=-8',
            colorMood: 'very subtle, opacity 0.2-0.3',
            animationStyle: 'slow float with parallax on scroll',
        },
    ];
}

function buildNarrativeContentInstruction(spec: Section3DSpec, dna: BusinessDNA, userPrompt: string): string {
    const business = userPrompt.slice(0, 200);

    const baseInstructions: Record<string, string> = {
        loader: `
PURE HTML LOADING SCREEN - NO CANVAS, NO 3D:
- import { useProgress } from '@react-three/drei'
- Full-screen fixed overlay, z-index 9999, bg-black
- Animated brand name: pure CSS letter-spacing animation
- Progress bar: width transitions from 0% to progress%
- Cinematic corners: 4 positioned divs with gradient edges
- Ambient blur orbs: 2-3 large blurred divs, low opacity, theme colors
- Fade out: opacity 0 + pointer-events none when progress >= 100
- NO imports from @/components/ui/ -- build everything with pure HTML/CSS
- Return: ({ children }) wraps children, overlay floats above

BANNED: lucide-react, @/components/ui/*, Three.js imports`,

        navbar: `
PURE GLASSMORPHISM HTML NAV - NO CANVAS:
- <nav> fixed top-0 left-0 right-0 z-50
- backdrop-blur-xl bg-black/20 border-b border-white/10
- Brand: tracking-[0.3em] uppercase font-black text-white, <Link to="/">
- Desktop links: <Link to="..."> with hover:text-white/60 transition
- Mobile hamburger: 3 <span> CSS lines that morph to X via rotate/translate
- Mobile menu: slide-down overlay with staggered link reveal
- NO lucide-react, NO Canvas, use <Link> from react-router-dom

INCLUDE: import { cn } from '@/lib/utils'`,

        footer: `
PURE DARK CINEMATIC HTML FOOTER - NO CANVAS:
- <footer> bg-black py-24 border-t border-white/5
- TOP ACCENT LINE: <div className="h-px w-full bg-gradient-to-r from-transparent via-[accent] to-transparent mb-16" />
- 4-column grid: Brand+tagline, Links, Services/Info, Social
- SOCIAL ICONS: Pure inline SVG paths ONLY (X/Twitter, GitHub, LinkedIn, Instagram, Dribbble)
- DECORATIVE: 2 large blur orbs (position absolute, rounded-full, blur-[200px], opacity-5)
- COPYRIGHT bar: text-[10px] tracking-[0.4em] uppercase text-white/20 mt-12
- NO lucide-react, NO Canvas

Make footer feel PREMIUM, like Apple/Stripe quality.`,

        hero: `
PURE R3F FRAGMENT - Return <> NEVER <Canvas> or <div>:

This hero scene is for: "${business}"
Energy Level: ${dna.energyLevel} -- animations should feel ${dna.energyLevel}
Scene Archetype: ${dna.sceneArchetype}
Shader: Use the ${dna.shaderRecommendation} shader pattern for atmospheric background
Particle Style: Create particles that feel like ${dna.particleStyle}
Story: ${dna.narrativeArc}

NARRATIVE ROLE: Opening chapter -- establish the world, create intrigue.

VISUAL STORY (map useScroll().offset to these states):
- Scroll 0.0-0.15 (ACT 1 ESTABLISH): Complete darkness, 1 tiny glowing particle at center. Heavy vignette, minimal bloom. Camera is wide/high establishing shot.
- Scroll 0.15-0.35 (TRANSITION): Particle explodes outward forming 2000+ particle nebula. Objects are distant, fragmented.
- Scroll 0.35-0.60 (ACT 2 REVEAL): Particles converge into 3D business shape. Bloom intensifies dramatically. Camera pushes in close.
- Scroll 0.60-0.85 (TRANSITION): Object rotates to reveal detail. Energy increases.
- Scroll 0.85-1.0 (ACT 3 RESOLVE): Energy explosion, particles scatter outward, everything vibrant. ChromaticAberration activates. Camera pulls back.

MANDATORY ELEMENTS:
1. CinematicCamera component: CatmullRomCurve3 with 6 control points, camera.position.lerp to curve point, camera.lookAt(0,0,0)
2. ParticleMorph system: 3000+ particles morphing between 3 shapes (scatter->sphere->explosion) tied to scroll
3. ${dna.shaderRecommendation} ShaderMaterial as background plane with uTime uniform animated in useFrame
4. Animated postprocessing refs: Bloom intensity lerp 0.3->3.5, Vignette darkness lerp 0.85->0.1
5. Mouse parallax: objects shift 0.3 units toward cursor using useThree().pointer
6. Minimum 3 lights: ambientLight + 2 spotLights with theme colors
7. fog for depth atmosphere
8. Minimum 200 lines of actual code
9. Minimum 3 useFrame loops with different purposes (camera, particles, shader animation)

FORBIDDEN: Canvas, div, Html, ScrollControls, Scroll, EffectComposer, Suspense, Text, Text3D, lucide-react`,

        features: `
PURE R3F FRAGMENT for features section:
Business: "${business}"
Energy: ${dna.energyLevel} | Motion: ${dna.motionStyle}

NARRATIVE ROLE: The reveal act -- show what makes this business powerful.

VISUAL STORY:
- Each feature is a 3D "island" floating in space at different depths
- As camera scrolls past each island, it LIGHTS UP with details emerging
- Islands connected by glowing particle streams (like neural network)
- Hovering an island: it rises y+0.5, particles orbit faster, emissive triples

MANDATORY ELEMENTS:
1. 4-6 DISTINCT floating island geometries (each different shape + material)
2. Particle streams connecting them using custom BufferGeometry lines
3. Each island has its own mini pointLight that pulses with useFrame
4. Scroll-driven reveal: each island activates at scroll offset 0.2, 0.4, 0.6, 0.8
5. onPointerOver: island rises, particles orbit faster, emissiveIntensity x3
6. useScroll() for scroll reactivity
7. Minimum 3 useFrame animation loops
8. Minimum 1 custom ShaderMaterial on at least one element
9. STAGGERED Float speeds (1.2, 1.8, 2.4, 0.9, 1.5)
10. Different depth layers: z=2 to z=5 (foreground), z=-1 to z=1 (mid), z=-5 to z=-10 (bg)

LIGHTING: warm ambient + colored point lights near each cluster
FORBIDDEN: Canvas, div, Html, ScrollControls, Scroll, EffectComposer, Text, Text3D`,

        showcase: `
PURE R3F FRAGMENT for showcase/product section:
Business: "${business}"

NARRATIVE ROLE: The wow moment -- audience falls in love with the product.

VISUAL STORY:
- Central hero object rotates on perfect pedestal
- Spotlights from 3 angles create dramatic studio lighting
- Orbiting detail objects show features at different angles
- Background: dark with subtle distant geometry

MANDATORY ELEMENTS:
1. HERO OBJECT: Large centerpiece (scale 2.5-3.5) with meshPhysicalMaterial (clearcoat=1, roughness=0, metalness=0.95, envMapIntensity=3)
2. SPOTLIGHT DRAMA: 3 spotLights at 120-degree intervals, different intensities
3. ContactShadows for grounded feel
4. Environment preset (studio/warehouse) for reflections
5. ORBIT RING: thin torus around object at 45-degree angle animated with useFrame
6. 8-10 tiny orbiting spheres at radius=3 with useFrame sin/cos animation
7. onPointerOver = pause rotation + increase emissive, onPointerOut = resume
8. useScroll() for scroll-linked entrance animation
9. Custom ShaderMaterial on at least one decorative element

Make it look like LUXURY product photography in 3D.
FORBIDDEN: Canvas, div, PresentationControls (use manual rotation instead), Text, Text3D`,

        process: `
PURE R3F FRAGMENT for process/how-it-works section:
Business: "${business}"

CREATE: A 3D timeline/journey visualization with scroll narrative
1. 3-5 nodes (spheres radius 0.3) positioned along a curved path
2. Glowing TUBE connecting them: cylinder segments following CatmullRomCurve3
3. Each node: different emissive color (gradient progression, theme colors)
4. SEQUENTIAL GLOW: useFrame cycles emissiveIntensity through nodes like a pulse wave
5. Current active node: scales to 1.5x + bright glow based on scroll.offset
6. Custom ShaderMaterial on the connecting tube (hologram or plasma pattern)
7. useScroll() to drive which node is active

FORBIDDEN: Canvas, div, Text, Text3D`,

        stats: `
PURE R3F FRAGMENT for stats/numbers section:

CONCEPT: 3D data visualization pillars with scroll entrance
1. 4-6 box geometries at different Y heights representing data values
2. Materials: meshPhysicalMaterial with emissive + slight transparency
3. Colors: gradient from cool to hot based on value
4. ANIMATION: pillars GROW from y=0 when scroll brings them into view (useScroll)
5. Custom ShaderMaterial on at least one background element
6. 3 different useFrame animation loops
7. Labels via Html from drei positioned above each pillar

FORBIDDEN: Canvas, div (except inside Html), Text3D`,

        testimonials: `
PURE R3F FRAGMENT for testimonials section:

CONCEPT: Floating testimonial planes in 3D arc formation
1. 3-5 plane geometries (args=[2.5, 1.5]) with meshPhysicalMaterial (transmission=0.4, thickness=0.1, clearcoat=1)
2. Arc formation, cards at slight angles facing viewer
3. Gentle Float at different speeds and rotationIntensity
4. Soft spotlight on each card
5. Background: Sparkles + ambient fog
6. useScroll(): cards tilt and separate as user scrolls
7. Custom ShaderMaterial glow on card edges

FORBIDDEN: Canvas, div (except inside Html), Text, Text3D`,

        cta: `
PURE R3F FRAGMENT for call-to-action section:
Business: "${business}"

NARRATIVE ROLE: Closing chapter -- invite action, create urgency.

VISUAL STORY:
- Scene CONVERGES toward central glowing gateway form
- All particles stream inward to central point
- Gateway is an invitation -- a portal, a glowing ring

MANDATORY ELEMENTS:
1. Central gateway geometry (torusKnot or torus) with plasma/energy ShaderMaterial
2. Convergence animation: 500+ particles flow inward from all directions using BufferGeometry
3. Intense Bloom effect (intensity=4.0 equivalent via emissive materials)
4. Stars component in background (count=500, depth=50)
5. PULSING: emissiveIntensity oscillates via Math.sin in useFrame
6. 3+ useFrame animation loops (particles, gateway rotation, light pulsing)
7. Energy rings: 3-4 torus geometries at different scales, fast rotation
8. useScroll() for scroll-driven convergence timing

FORBIDDEN: Canvas, div, Html, ScrollControls, EffectComposer, Text, Text3D`,

        about: `
PURE R3F FRAGMENT for about section:
Business: "${business}"

NARRATIVE ROLE: Humanizing chapter -- make the brand feel real and trustworthy.

VISUAL STORY:
- Calm, warm atmosphere contrasting energetic earlier sections
- Slow-moving organic shapes like breathing organisms
- Warm lighting (amber/gold) replacing cool palette
- Camera moves gently like slow documentary pan

MANDATORY ELEMENTS:
1. Organic morphing geometry using MeshDistortMaterial (distort=0.2, speed=1)
2. Warm color shift: animate light color from cool blue to warm amber over scroll
3. Soft ContactShadows for grounded, real feeling
4. Slow Float animation (speed=0.3, floatIntensity=0.5) on main objects
5. useScroll() for scroll-driven atmosphere change
6. Custom ShaderMaterial on background element (aurora pattern, warm colors)
7. 3+ useFrame loops (organic motion, light color shift, shader animation)

FORBIDDEN: Canvas, div, Text, Text3D`,

        contact: `
PURE R3F FRAGMENT for contact section:
Business: "${business}"

NARRATIVE ROLE: Final invitation section with convergence energy.

MANDATORY ELEMENTS:
1. Central gateway torus with custom ShaderMaterial (plasma or hologram)
2. 300+ particles converging inward using BufferGeometry + useFrame position lerp
3. Stars background (count=500, depth=50)
4. Intense emissive glow on central object
5. useScroll() for convergence timing
6. 3+ useFrame loops

FORBIDDEN: Canvas, div, Html, Text, Text3D`,

        ambient: `
PURE R3F FRAGMENT for ambient background:

MINIMAL ATMOSPHERIC LAYER:
1. Sparkles count=30, scale=25, size=0.5, speed=0.1, color=theme, opacity=0.3
2. 6-8 tiny spheres (radius 0.05-0.15) scattered at z=-3 to z=-8
3. ALL materials: meshStandardMaterial opacity=0.15-0.25 transparent
4. PARALLAX: useScroll() + slight xy position shifts
5. Custom ShaderMaterial on one large background plane (aurora or deepspace, very low alpha)

Keep it VERY subtle. This is a supporting layer.`,
    };

    const baseInstruction = baseInstructions[spec.sectionType] || baseInstructions['features'];

    return `
${baseInstruction}

ADDITIONAL CONTEXT FOR THIS SPECIFIC SCENE:
- Business: ${business}
- Spec: ${spec.contentDescription}
- Geometry vision: ${spec.geometryIdea}  
- Color mood: ${spec.colorMood}
- Animation personality: ${spec.animationStyle}

BUSINESS DNA (follow this exactly):
- Industry: ${dna.industry}
- Energy Level: ${dna.energyLevel} -- your animations should feel ${dna.energyLevel}
- Scene Archetype: ${dna.sceneArchetype} -- your visual style is ${dna.sceneArchetype}
- Color Temperature: ${dna.colorTemperature}
- Motion Style: ${dna.motionStyle}
- Visual Keywords: ${dna.visualKeywords.join(', ')} -- every element should embody these
- Recommended Shader: Use the ${dna.shaderRecommendation} shader pattern for backgrounds
- Particle Style: Create particles that feel like ${dna.particleStyle}
- Story to Tell: ${dna.narrativeArc}

Make every geometry, material, animation, and color choice serve this DNA.
Make this scene UNMISTAKABLY unique to this exact business. Not generic. Not a template.
Write a COMPLETE MURAL (200+ lines), not a thumbnail.
`;
}

function build3DSystemPrompt(dna: BusinessDNA): string {
    return `You are the world's greatest creative 3D web developer. You have built sites that won Awwwards Site of the Year, FWA, and CSS Design Awards. You think like Bruno Simon, Aristide Benoist, and Active Theory combined. You do NOT generate simple floating spheres. You generate CINEMATIC EXPERIENCES. You write COMPLETE code -- never placeholder comments, never TODO, never abbreviated sections. Every component you write is a COMPLETE MURAL, not a thumbnail.

MINIMUM CODE STANDARDS (MANDATORY -- FAILURE TO MEET = REJECTED):
- Minimum 200 lines of actual TypeScript/JSX code
- Minimum 4 distinct geometry types (no repeating same geometry)
- Minimum 3 useFrame animation loops with different purposes
- Minimum 1 custom shaderMaterial with vertexShader + fragmentShader and a uTime uniform animated in useFrame
- Minimum 1 scroll-reactive section using useScroll() from @react-three/drei
- Minimum 1 mouse-reactive section using useThree() pointer
- Minimum 3 light sources (ambientLight + at least 2 of: spotLight, pointLight, directionalLight, hemisphereLight)
- Minimum 2 depth layers: foreground objects (z=2 to z=5), midground (z=-1 to z=1), background (z=-5 to z=-10)
- All animations must be smooth using THREE.MathUtils.lerp or easing functions -- NO sudden jumps

STORY ARCHITECTURE (THE MOST IMPORTANT SECTION):
Every scene component MUST tell a visual story through scroll. Map useScroll().offset to a 3-act narrative arc:

ACT 1 (offset 0.0 to 0.33): ESTABLISH
- The world is dark, mysterious, sparse
- Objects are distant, fragmented, or hidden
- Heavy vignette feel via dark lighting, minimal emissive
- Camera is wide/high -- establishing shot
- User emotion target: CURIOSITY

ACT 2 (offset 0.33 to 0.66): REVEAL
- Objects converge, light increases
- The product/service comes into focus
- Emissive intensifies dramatically at the reveal peak
- Camera pushes in close -- intimate
- User emotion target: WONDER / AWE

ACT 3 (offset 0.66 to 1.0): RESOLVE
- Energy explosion -- particles scatter outward
- Everything feels alive, vibrant, energetic
- Color temperature shifts warm
- Camera pulls back to show the full world
- User emotion target: EXCITEMENT / ACTION

Implement this by using useScroll() and mapping .offset to these states inside a useFrame loop.

CINEMATIC CAMERA SYSTEM:
For HeroScene3D and any full-page scene: add a CinematicCamera sub-component.
- Create a CatmullRomCurve3 with 6 control points representing camera positions through the scroll journey
- Use useScroll() to get current position on curve
- Update camera.position and camera.lookAt in useFrame
- Path: START wide (z=12, y=3) -> DIVE IN (z=2, y=0) -> ORBIT LEFT (x=-4, z=3) -> ORBIT RIGHT (x=4, z=3) -> RISE UP (y=6, z=6) -> END pull back (z=10, y=1)

Example:
const curve = useMemo(() => new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 3, 12),
  new THREE.Vector3(0, 0, 2),
  new THREE.Vector3(-4, 1, 3),
  new THREE.Vector3(4, 1, 3),
  new THREE.Vector3(0, 6, 6),
  new THREE.Vector3(0, 1, 10),
]), []);
useFrame(() => {
  const t = scroll.offset;
  const point = curve.getPoint(t);
  camera.position.lerp(point, 0.05);
  camera.lookAt(0, 0, 0);
});

CUSTOM GLSL SHADERS:
You MUST use custom shaderMaterial for atmospheric backgrounds. Choose the shader pattern that best fits the business type:
- AURORA: for wellness, nature, calm, tech (animated wave plane with color mixing)
- HOLOGRAM: for tech, cybersecurity, AI, gaming (scanlines + edge glow + flicker)
- PLASMA: for energy, fintech, crypto, sports (interference pattern plasma)
- DEEP SPACE: for luxury, mystery, premium (nebula noise + star glints)
- LIQUID METAL: for automotive, manufacturing, premium tech (reflective ripples)

All shaders need: vertexShader string, fragmentShader string, uniforms with uTime, and useFrame animation.

PARTICLE MORPHING SYSTEM:
For hero and feature scenes, add particles using BufferGeometry with 2000-5000 particles that morph between shapes:
- Shape A (scroll 0.0-0.3): Random scattered cloud
- Shape B (scroll 0.3-0.6): Recognizable business shape (sphere/torus/custom arrangement)
- Shape C (scroll 0.6-1.0): Explosive outward scatter

Use THREE.MathUtils.lerp in useFrame to interpolate particle positions.

POSTPROCESSING PRESETS (in the system prompt for reference only -- scene components cannot include EffectComposer but should design visuals that LOOK AMAZING with these applied by the page):
- HERO: Bloom intensity=1.5->3.5 (scroll animated), Vignette darkness=0.85->0.1, Noise opacity=0.08
- FEATURES: Bloom intensity=0.8, ChromaticAberration (hover animated), Vignette darkness=0.4
- SHOWCASE: Bloom intensity=1.2, DepthOfField, ChromaticAberration
- ABOUT: Bloom intensity=0.6, Vignette darkness=0.3
- CTA/CONTACT: Bloom intensity=4.0 (via high emissive materials), ChromaticAberration

COMPONENT ARCHITECTURE (STRICT):

TYPE 1 -- SCENE COMPONENTS (HeroScene3D, FeaturesScene3D, etc.):
  Returns a React Fragment (<>...</>)
  Contains ONLY R3F elements: mesh, group, lights, Float, Sparkles, ContactShadows, fog, shaderMaterial, points
  NO Canvas, NO div, NO HTML elements inside
  ALWAYS uses useScroll() for scroll reactivity
  Export BOTH named AND default: export const X = ...; export default X;

TYPE 2 -- PURE HTML OVERLAY COMPONENTS (NavBar3D, Footer3D, LoadingScreen3D):
  Returns a regular div
  NO Canvas, NO R3F elements, NO Three.js
  Pure Tailwind CSS + glassmorphism styling
  LoadingScreen3D: uses useProgress from drei
  NavBar3D: uses <Link> from react-router-dom

MATERIAL CASING (CRITICAL):
LOWERCASE (Three.js intrinsic): meshPhysicalMaterial, meshStandardMaterial, meshBasicMaterial, shaderMaterial
CAPITALIZED (drei imported): MeshDistortMaterial, MeshWobbleMaterial, MeshPortalMaterial

VISUAL IDENTITY: ${dna.energyLevel.toUpperCase()} | ${dna.sceneArchetype}
Scene theme: ${dna.narrativeArc}
Motion: ${dna.motionStyle}
Shader: ${dna.shaderRecommendation}
Particles: ${dna.particleStyle}
Keywords: ${dna.visualKeywords.join(' | ')}

VISUAL UNIQUENESS RULES:
- NEVER use the same geometry for more than 2 objects in one component
- NEVER use MeshDistortMaterial or MeshWobbleMaterial as your ONLY material -- combine with ShaderMaterial backgrounds
- NEVER have a static scene -- everything must move
- Each component MUST feel visually different from every other component in the same project
- Hero=dark/cold, features=medium, About=warm, CTA=bright/energetic

ABSOLUTELY BANNED:
- Text, Text3D (crashes -- no font files)
- MeshTransmissionMaterial (GPU crash)
- useGLTF, useTexture (no assets)
- lucide-react (not installed)
- @/components/ui/* (Button, Card DO NOT EXIST)
- Canvas inside scene components
- disableNormalPass on EffectComposer
- setState inside useFrame
- Nesting Float inside Float

OUTPUT FORMAT:
<chirAction type="file" filePath="PATH">
// COMPLETE CODE -- 200+ lines minimum
</chirAction>

ONE chirAction tag. ONE file. No markdown.`;
}

function buildHtmlOverlaySystemPrompt(sectionType: string): string {
    const isLoader = sectionType === 'loader' || sectionType === 'loading';
    return `You are an expert React/TypeScript developer building a PURE HTML glassmorphism component for a 3D website.

THIS IS A ${sectionType.toUpperCase()} COMPONENT -- PURE HTML/CSS ONLY. ZERO 3D CODE.

ABSOLUTE BANNED IMPORTS (violating = component rejected):
- @react-three/fiber -- ANY import
- @react-three/drei -- ANY import${isLoader ? ' EXCEPT useProgress' : ''}
- @react-three/postprocessing -- ANY import
- three / THREE -- ANY import
- Canvas, useFrame, useThree, useScroll (R3F version)
- ScrollControls, Scroll -- from drei
- lucide-react
- @/components/ui/*

ALLOWED IMPORTS ONLY:
  import React, { useState, useEffect, useRef } from 'react';
  import { motion, AnimatePresence } from 'framer-motion';
  import { Link, useNavigate } from 'react-router-dom';
${isLoader ? `  import { useProgress } from '@react-three/drei';
` : ''}
STYLE REQUIREMENTS:
- Dark glassmorphism: bg-black/20 backdrop-blur-xl border border-white/10
- Use framer-motion for all animations
- Social/nav icons: inline <svg> paths ONLY -- no icon library
- Text: text-white, text-white/70, tracking-widest, uppercase
- Premium feel -- Apple/Stripe quality

${sectionType === 'navbar' ? `NAVBAR SPECIFICS:
- Fixed positioning: fixed top-0 left-0 right-0 z-50
- Height: h-16
- Desktop: horizontal link list
- Mobile: hamburger (3 <span> lines morphing to X via rotate transform)
- Links: use <Link to="..."> from react-router-dom
- NO onClick={() => window.location.href} -- always use Link or useNavigate` : ''}

${sectionType === 'footer' ? `FOOTER SPECIFICS:
- Dark background: bg-black border-t border-white/5
- Large vertical padding: py-20
- TOP ACCENT LINE: <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-16" />
- 4-column grid layout
- Social icons: pure inline <svg> for X/Twitter, GitHub, LinkedIn, Instagram
- Copyright: text-xs uppercase tracking-widest text-white/20` : ''}

${isLoader ? `LOADER SPECIFICS:
- Wraps children: ({ children }: { children?: React.ReactNode })
- Full-screen fixed overlay: position fixed, inset 0, z-index 9999
- Use useProgress() to get { progress, active }
- Fade out: opacity 0 + pointer-events-none when progress >= 100
- Show animated brand name + progress bar (width = progress%)
- 2-3 decorative blur orbs (position absolute, blurred, low opacity)
- Transition: opacity 0.8s ease` : ''}

OUTPUT FORMAT:
<chirAction type="file" filePath="PATH">
// COMPLETE PRODUCTION-READY CODE -- minimum 80 lines
</chirAction>

ONE chirAction tag. ZERO 3D imports.`;
}

function score3DComponent(content: string): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 10;

    if (
        content.includes('export default function') &&
        content.includes('<Canvas') &&
        (content.includes('useFrame(') || content.includes('useThree('))
    ) {
        issues.push('useFrame/useThree called outside Canvas -- will crash at runtime');
        score -= 4;
    }

    if (/<ShaderMaterial[\s/>]/.test(content)) {
        issues.push('<ShaderMaterial> used as JSX component -- must be lowercase <shaderMaterial attach="material">');
        score -= 3;
    }

    if (content.includes('ChromaticAberration') && /offset=\{\s*\[/.test(content)) {
        issues.push('ChromaticAberration offset must be new THREE.Vector2(x, y), not an array');
        score -= 2;
    }

    if (content.includes('useGLTF(')) {
        issues.push('No .glb files exist -- remove useGLTF and use procedural geometry');
        score -= 4;
    }

    if (content.includes('extend({') && !content.includes('declare global')) {
        issues.push('extend() used without JSX namespace declaration -- add declare global { namespace JSX { interface IntrinsicElements { ... } } }');
        score -= 2;
    }

    if (content.includes('MeshTransmissionMaterial')) {
        issues.push('MeshTransmissionMaterial is banned -- causes GPU crash -- use meshPhysicalMaterial with transmission prop');
        score -= 3;
    }

    if (content.includes('<Html') && content.includes('ScrollControls') && !content.includes('occlude')) {
        issues.push('<Html> inside ScrollControls should have occlude prop');
        score -= 1;
    }

    return { score, issues };
}

export async function generate3DComponentNode(state: WebsiteState): Promise<Partial<WebsiteState>> {
    console.log('\n[generate-3d-component] Generating CINEMATIC business-specific 3D components...');
    notifyPhaseChange('3d_components');

    if (!state.enable3D) {
        return { currentPhase: 'generate_3d_skip', messages: ['3D component generation skipped'] };
    }

    const blueprint = state.blueprint;
    const modules = state.threeDModules || [];
    const ragContext = state.ragContext || '';
    const promptContext = threeDPromptContext || '';
    const memoryContext = state.projectMemory ? getMemoryContext(state.projectMemory) : '';
    const theme = state.dynamicTheme;
    const userPrompt = state.userPrompt || '';

    console.log('[generate-3d] Extracting business DNA...');
    const dna = await extractBusinessDNA(userPrompt, blueprint);
    console.log(`[generate-3d] DNA: ${dna.industry} | ${dna.energyLevel} | ${dna.sceneArchetype} | shader=${dna.shaderRecommendation} | particles=${dna.particleStyle}`);

    console.log('[generate-3d] Building business-specific section specs...');
    const sectionSpecs = await buildBusinessSpecificSections(userPrompt, blueprint, dna);
    console.log(`[generate-3d] ${sectionSpecs.length} unique sections planned`);

    const newFiles = new Map<string, GeneratedFile>();
    const registry = new Map(state.fileRegistry);

    const PROTECTED_PATHS = new Set([
        'src/App.tsx', 'src/main.tsx', 'src/index.css', 'src/lib/utils.ts',
        'src/components/layout/AppLayout.tsx',
    ]);

    const htmlOverlayTypes = new Set(['loader', 'navbar', 'footer']);

        const results = await Promise.allSettled(
        sectionSpecs.map(async (spec) => {
            console.log(`  [generate-3d] Creating ${spec.name} (${spec.sectionType})...`);

            const isHtmlOverlay = htmlOverlayTypes.has(spec.sectionType);
            const contentInstruction = isHtmlOverlay
                ? ''
                : buildNarrativeContentInstruction(spec, dna, userPrompt);
            const systemPrompt = isHtmlOverlay
                ? buildHtmlOverlaySystemPrompt(spec.sectionType)
                : build3DSystemPrompt(dna);

            const userLLMPrompt = [
                `GENERATE ONE SINGLE FILE: ${spec.path}`,
                `ONE <chirAction> tag. ONE file. Do NOT generate any other files.`,
                '',
                `COMPONENT: ${spec.name}`,
                `FILE PATH: ${spec.path}`,
                `SECTION TYPE: ${spec.sectionType}`,
                '',
                `BUSINESS: ${userPrompt}`,
                '',
                ...(!isHtmlOverlay && theme ? [
                    `DESIGN THEME: "${theme.palette.name}"`,
                    `  Primary: ${theme.palette.primary}`,
                    `  Secondary: ${theme.palette.secondary}`,
                    `  Accent: ${theme.palette.accent}`,
                    `  Style: ${theme.palette.style}`,
                    `  Animation: ${theme.animation.name}`,
                ] : isHtmlOverlay && theme ? [
                    `COLOR PALETTE for glassmorphism accents:`,
                    `  Primary: ${theme.palette.primary}`,
                    `  Accent: ${theme.palette.accent}`,
                ] : []),
                '',
                ...(!isHtmlOverlay ? [
                    `AVAILABLE 3D MODULES: ${modules.join(', ')}`,
                    '',
                    contentInstruction,
                    '',
                    ragContext ? `3D DOCUMENTATION:\n${ragContext.slice(0, 6000)}` : '',
                    promptContext ? `THREE.JS REFERENCE:\n${promptContext.slice(0, 4000)}` : '',
                ] : [
                    `Build a premium glassmorphism ${spec.sectionType} for this business: ${userPrompt}`,
                    `Make it visually stunning with framer-motion animations.`,
                    `Reflect the brand colors: primary ${theme?.palette?.primary || '#f472b6'}, accent ${theme?.palette?.accent || '#22d3ee'}`,
                ]),
            ].filter(Boolean).join('\n');

            const response = await invokeLLM(systemPrompt, userLLMPrompt, 0.85, 5);
            return { spec, response };
        })
    );

    for (const result of results) {
        if (result.status !== 'fulfilled') {
            const reason = (result as PromiseRejectedResult).reason;
            console.error(`  [generate-3d] Promise rejected: ${reason?.message || reason}`);
            continue;
        }

        const { spec, response } = result.value;
        let code = '';
        const parsed = parseChirActions(response);

        if (parsed.length > 0) {
            for (const file of parsed) {
                const filePath = file.path.startsWith('src/') ? file.path : spec.path;
                if (PROTECTED_PATHS.has(filePath)) continue;

                const isCorrectFile =
                    filePath === spec.path ||
                    filePath.endsWith(`/${spec.name}.tsx`) ||
                    filePath.includes(spec.name);

                if (!isCorrectFile && newFiles.size > 0) continue;

                code = file.content;
                break;
            }
        }

        if (!code) {
            const codeMatch = response.match(/```(?:tsx|jsx|typescript|javascript)?\n([\s\S]*?)```/);
            code = codeMatch ? codeMatch[1].trim() : response.trim();
        }

        if (code.length < 100) {
            console.warn(`  [generate-3d] ${spec.name}: code too small (${code.length} chars), skipping`);
            continue;
        }

        const isScene = !htmlOverlayTypes.has(spec.sectionType);
        if (isScene) {
            const quality = score3DComponent(code);
            if (quality.score < 7) {
                console.log(`  [quality-gate] ${spec.name} scored ${quality.score}/10, regenerating...`);
                console.log(`  [quality-gate] Issues: ${quality.issues.join(', ')}`);

                const fixPrompt = `Your previous component scored ${quality.score}/10.
CRITICAL ISSUES TO FIX:
${quality.issues.map((iss, n) => `${n + 1}. ${iss}`).join('\n')}

Regenerate the ENTIRE component from scratch. Make it 3x richer.
The previous version was too minimal. Write a MURAL not a thumbnail.
MINIMUM 200 lines of real code. Include custom shaderMaterial, multiple useFrame loops, useScroll narrative, particle systems.
${buildNarrativeContentInstruction(spec, dna, userPrompt)}`;

                try {
                    const retryResponse = await invokeLLM(build3DSystemPrompt(dna), fixPrompt, 0.9, 3);
                    const retryParsed = parseChirActions(retryResponse);
                    if (retryParsed.length > 0 && retryParsed[0].content.length > code.length) {
                        code = retryParsed[0].content;
                        console.log(`  [quality-gate] Retry produced ${code.length} chars`);
                    } else {
                        const retryCodeMatch = retryResponse.match(/```(?:tsx|jsx|typescript|javascript)?\n([\s\S]*?)```/);
                        const retryCode = retryCodeMatch ? retryCodeMatch[1].trim() : '';
                        if (retryCode.length > code.length) {
                            code = retryCode;
                            console.log(`  [quality-gate] Retry fallback produced ${code.length} chars`);
                        }
                    }
                } catch (retryErr: any) {
                    console.warn(`  [quality-gate] Retry failed: ${retryErr.message?.slice(0, 60)}`);
                }
            } else {
                console.log(`  [quality-gate] ${spec.name} scored ${quality.score}/10 -- passed`);
            }
        }

        const filePath = spec.path;
        const generatedFile: GeneratedFile = {
            path: filePath,
            content: code,
            phase: '3d_components',
            exports: extractExports(code),
            imports: extractImports(code),
        };
        newFiles.set(filePath, generatedFile);
        registry.set(filePath, createRegistryEntry(generatedFile));
        notifyFileCreated(generatedFile);
        console.log(`    [done] ${filePath} (${code.length} chars)`);
    }

    const generatedPaths = Array.from(newFiles.keys());
    console.log(`[generate-3d] Generated ${newFiles.size} cinematic 3D components`);

    const importInstructions = buildImportInstructions(sectionSpecs, generatedPaths, dna);

    let updatedMemory = state.projectMemory;
    if (updatedMemory) {
        updatedMemory = updateMemory3D(updatedMemory, generatedPaths, importInstructions);
    }

    return {
        files: newFiles,
        fileRegistry: registry,
        projectMemory: updatedMemory,
        currentPhase: 'generate_3d_complete',
        messages: [
            `Generated ${newFiles.size} cinematic 3D components for ${dna.industry}`,
            `DNA: ${dna.sceneArchetype} | ${dna.shaderRecommendation} shader | ${dna.particleStyle} particles`,
            `Sections: ${generatedPaths.join(', ')}`,
        ],
    };
}

function buildImportInstructions(
    specs: Section3DSpec[],
    generatedPaths: string[],
    dna: BusinessDNA
): string {
    const lines = [
        '=== CINEMATIC 3D COMPONENT INTEGRATION ===',
        '',
        `Business DNA: ${dna.industry} | ${dna.energyLevel} | ${dna.sceneArchetype}`,
        `Narrative: ${dna.narrativeArc}`,
        '',
        'SCENE COMPONENT INTEGRATION GUIDE:',
        '(Scene components go INSIDE <Scroll> at Y offsets)',
        '(HTML overlays go OUTSIDE Canvas)',
        '',
    ];

    const sceneComponents = specs.filter(
        s => !['navbar', 'footer', 'loader'].includes(s.sectionType)
    );

    let yOffset = 0;
    for (const spec of sceneComponents) {
        const matched = generatedPaths.find(p => p.includes(spec.name));
        if (!matched) continue;
        const importPath = '@/' + matched.replace(/^src\//, '').replace('.tsx', '');

        lines.push(`SECTION: ${spec.sectionType.toUpperCase()} -- ${spec.name}`);
        lines.push(`  import: const ${spec.name} = lazy(() => import('${importPath}'));`);
        if (yOffset === 0) {
            lines.push(`  placement: <${spec.name} /> (at Y=0, first in <Scroll>)`);
        } else {
            lines.push(`  placement: <group position={[0, ${yOffset}, 0]}><${spec.name} /></group>`);
        }
        lines.push(`  html section: <section className="h-screen w-screen flex items-center justify-center">`);
        lines.push(`    (motion.div content with glassmorphism cards)`);
        lines.push('  </section>');
        lines.push('');
        yOffset -= 10;
    }

    lines.push('MANDATORY HTML OVERLAYS (outside Canvas):');
    lines.push("  import LoadingScreen3D from '@/components/3d/LoadingScreen3D'");
    lines.push("  import NavBar3D from '@/components/3d/NavBar3D'");
    lines.push("  import Footer3D from '@/components/3d/Footer3D'");
    lines.push('');
    lines.push(`ScrollControls pages: ${Math.max(sceneComponents.length + 2, 8)}`);
    lines.push(`ScrollControls damping: 0.03`);
    lines.push('');
    lines.push('CANVAS SETTINGS (required for cinematic quality):');
    lines.push('  gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}');
    lines.push('  dpr={[1, 2]}');
    lines.push('  shadows');
    lines.push('  camera={{ fov: 60, near: 0.1, far: 1000 }}');
    lines.push('');
    lines.push('PERFORMANCE (add inside Canvas):');
    lines.push('  <AdaptiveDpr pixelated />');
    lines.push('  <AdaptiveEvents />');
    lines.push('');
    lines.push('POSTPROCESSING (add inside Canvas, outside ScrollControls):');
    lines.push('  <EffectComposer>');
    lines.push('    <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} />');
    lines.push('    <Vignette eskil={false} offset={0.1} darkness={0.7} />');
    lines.push('    <ChromaticAberration offset={[0.002, 0.002]} />');
    lines.push('    <Noise opacity={0.04} />');
    lines.push('  </EffectComposer>');
    lines.push('');
    lines.push('EVERY PAGE STRUCTURE:');
    lines.push('<LoadingScreen3D>');
    lines.push('  <NavBar3D />');
    lines.push('  <div className="fixed inset-0 bg-black overflow-hidden" style={{ zIndex: 0 }}>');
    lines.push('    <Canvas ...canvasSettings>');
    lines.push('      <AdaptiveDpr pixelated />');
    lines.push('      <AdaptiveEvents />');
    lines.push('      <ScrollControls pages={8} damping={0.03}>');
    lines.push('        <Scroll> {/* 3D scenes */} </Scroll>');
    lines.push('        <Scroll html> {/* HTML content + <Footer3D /> last */} </Scroll>');
    lines.push('      </ScrollControls>');
    lines.push('      <Environment preset="city" />');
    lines.push('      <EffectComposer>...</EffectComposer>');
    lines.push('    </Canvas>');
    lines.push('  </div>');
    lines.push('</LoadingScreen3D>');

    return lines.join('\n');
}