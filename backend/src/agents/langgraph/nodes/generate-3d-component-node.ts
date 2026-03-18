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

// ──── RANDOMIZED NAV / FOOTER / LOADER ARCHETYPES ────
const NAV_ARCHETYPES = [
    {
        name: 'glassmorphism-floating',
        desc: 'Glassmorphism floating bar — backdrop-blur-xl bg-black/20 border-b border-white/10, fixed top-4 mx-6 rounded-2xl',
        brandStyle: 'tracking-[0.3em] uppercase font-black with text-shadow glow',
        mobileMenu: 'slide-down overlay with staggered framer-motion reveal',
        hoverEffect: 'underline grows from left using CSS scaleX transform',
    },
    {
        name: 'side-drawer',
        desc: 'Minimal top-right hamburger that opens a full-height side drawer from right — bg-black/95 w-80, nav links stacked vertically with staggered motion.div, close X top-right',
        brandStyle: 'bottom-left fixed, vertical text writing-mode rotated 180deg tracking-[0.5em]',
        mobileMenu: 'same drawer, full-width on mobile',
        hoverEffect: 'link text shifts right 12px with opacity pulse',
    },
    {
        name: 'fullscreen-takeover',
        desc: 'Tiny circle button top-right that expands into FULLSCREEN overlay bg-black/98 with giant centered nav links (text-6xl), animated with clipPath circle expand from button origin',
        brandStyle: 'absolute top-left text-xs tracking-[0.6em] uppercase font-light',
        mobileMenu: 'same fullscreen takeover',
        hoverEffect: 'each link has a background gradient line that slides in from left on hover',
    },
    {
        name: 'bottom-dock',
        desc: 'macOS-style dock fixed bottom-6 center — rounded-full bg-white/5 backdrop-blur-2xl px-8 py-3, nav items as icon+label columns with scale-110 hover, brand name hidden (shown only on scroll-top)',
        brandStyle: 'fade-in at scroll=0 as large centered text, fades out on scroll',
        mobileMenu: 'dock stays but items become icon-only, long-press shows label tooltip',
        hoverEffect: 'item scales to 1.15 with subtle glow ring animation',
    },
    {
        name: 'split-header',
        desc: 'Two-part header: left half has brand name, right half has nav links flush-right. Separated by a thin vertical gradient line. bg-transparent, border-b border-white/5. On scroll, collapses to single centered row',
        brandStyle: 'font-serif italic text-2xl tracking-wide',
        mobileMenu: 'bottom sheet sliding up with framer-motion spring animation',
        hoverEffect: 'link gets a dot indicator below using ::after pseudo-element',
    },
    {
        name: 'orbital-menu',
        desc: 'Floating circle button top-right with 3 dots. On click, nav links FAN OUT in a semi-circle arc (like a radial menu) using framer-motion with spring physics. Each link is a small pill shape. Click outside to collapse',
        brandStyle: 'top-left, text-sm font-mono tracking-[0.4em] uppercase with blinking cursor animation',
        mobileMenu: 'same orbital fan-out, slightly larger pills',
        hoverEffect: 'pill scales up and gets border-glow in accent color',
    },
    {
        name: 'ticker-bar',
        desc: 'Narrow top bar with brand left and a horizontally scrolling ticker of nav links (infinite CSS marquee animation). Hover pauses ticker, click navigates. Below ticker: 1px gradient line accent',
        brandStyle: 'font-black text-lg inline with the ticker flow',
        mobileMenu: 'ticker stops, links stack vertically in a dropdown',
        hoverEffect: 'link background highlights with accent color/10 rounded',
    },
];

const FOOTER_ARCHETYPES = [
    {
        name: 'classic-4col',
        desc: '4-column grid footer — Brand+tagline | Quick Links | Services | Social. Top gradient accent line h-px. Copyright bar at bottom with text-[10px] tracking-[0.4em]. bg-black py-24. 2 decorative blur orbs absolute',
        socialStyle: 'inline SVG icons in a row with hover scale',
    },
    {
        name: 'mega-footer',
        desc: 'Full-width dark footer with large brand name (text-8xl font-black opacity-5 as watermark behind). 3-col grid above: nav links, newsletter email input, social. Bottom copyright. bg-gradient-to-b from-black to-gray-950',
        socialStyle: 'circular bordered icon buttons with hover fill',
    },
    {
        name: 'minimal-centered',
        desc: 'Extremely minimal — centered brand name, single row of nav links below, tiny copyright. No grid columns. Lots of vertical spacing py-32. Single accent line top. Feels premium and clean',
        socialStyle: 'text-only social links (Twitter, GitHub, etc.) separated by middot ·',
    },
    {
        name: 'split-cta-footer',
        desc: 'Upper half: large CTA section with heading "Ready to start?" and accent-colored button. Lower half: 3-column classic links + copyright. Divided by gradient line. Dark bg with subtle noise texture (CSS background-image)',
        socialStyle: 'small icon row under brand column',
    },
    {
        name: 'stacked-reveal',
        desc: 'Footer sections stacked vertically (not columns) — each section separated by thin border-white/5 line. Brand block, then Links block, then Social block, then Copyright. Each uses full width. Feels editorial/magazine',
        socialStyle: 'large social icons in a centered row with labels underneath',
    },
    {
        name: 'asymmetric-art',
        desc: 'Asymmetric layout: brand + tagline takes 60% left with large text. Right 40% has stacked nav links and social. A large decorative gradient circle (blur-[300px] opacity-5) anchored bottom-right. Very artistic feel',
        socialStyle: 'vertical stack of social links with hover indent',
    },
];

const LOADER_ARCHETYPES = [
    {
        name: 'letter-stagger',
        desc: 'Brand name with staggerChildren letter-by-letter reveal. Progress bar below: gradient from primary to accent. 3 corner decorations. 2 ambient blur orbs. Fade out on complete',
    },
    {
        name: 'counter-reveal',
        desc: 'Giant centered number counting 0-100 (text-9xl font-black). Brand name tiny above. On 100, number morphs into brand name with layoutId animation. Minimal, dramatic',
    },
    {
        name: 'ring-pulse',
        desc: 'Centered SVG ring that fills clockwise (stroke-dashoffset animation) as progress increases. Brand name inside ring. Pulsing glow on the ring edge. Clean dark background. Exit: ring scales up and fades',
    },
    {
        name: 'line-scan',
        desc: 'Horizontal line scanning top to bottom repeatedly (like a scanner). Brand name revealed as the line passes over it (clip-path). Progress shown as subtle bottom bar. Futuristic/techy feel',
    },
    {
        name: 'particle-assemble',
        desc: 'CSS-only: 20-30 small dots (divs) scattered randomly, animate toward center to form a simple shape/brand initial. Progress bar at bottom. On complete, dots burst outward and fade. Pure CSS animations with animation-delay stagger',
    },
];

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
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

    for (let attempts = 0; attempts < 3; attempts++) {
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
            console.warn(`[3D-DNA] Analysis attempt ${attempts + 1} failed:`, err.message?.slice(0, 60));
        }
    }

    throw new Error("[3D-DNA] Failed to extract Business DNA after 3 attempts.");
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

    for (let attempts = 0; attempts < 3; attempts++) {
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
            console.warn(`[3D-Specs] LLM attempt ${attempts + 1} failed:`, err.message?.slice(0, 60));
        }
    }

    throw new Error("[3D-Specs] Failed to generate distinct business specific sections after 3 attempts.");
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

DYNAMIC DATA INJECTION — THESE ARE MANDATORY:
The user message contains the EXACT brand name, nav links, tagline, and colors to use.
You MUST copy them verbatim. NEVER substitute generic placeholder text.
NEVER invent nav link labels or routes. NEVER write "Your Company", "Brand Name",
"Link 1", "Lorem ipsum", or any invented content.
The brand name, links, tagline, and colors are in the user message — use them EXACTLY as provided.

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
=== CRITICAL: STANDALONE OVERLAY -- NO CHILDREN PROP ===
- Component signature: const LoadingScreen3D: React.FC = () => { ... }
- DO NOT accept children. DO NOT wrap page content.
- Full-screen fixed overlay: position fixed, inset 0, z-index 9999
- Use useProgress() to get { progress, active }
- Manage unmount via internal useState (isLoaded)
- When progress >= 100: set isLoaded=true after short delay
- When isLoaded: opacity 0 + pointer-events-none
- Show animated brand name + progress bar (width = progress%)
- 2-3 decorative blur orbs (position absolute, blurred, low opacity)
- Transition: opacity 0.8s ease via framer-motion AnimatePresence

CORRECT USAGE IN PAGES:
  <div className="relative">
    <LoadingScreen3D />     {/* Standalone absolute overlay */}
    <NavBar3D />
    <Canvas>...</Canvas>
  </div>

FORBIDDEN USAGE:
  <LoadingScreen3D><PageContent /></LoadingScreen3D>  {/* BANNED */}` : ''}

OUTPUT FORMAT:
<chirAction type="file" filePath="PATH">
// COMPLETE PRODUCTION-READY CODE -- minimum 80 lines
</chirAction>

ONE chirAction tag. ZERO 3D imports.`;
}

interface QualityIssue {
    severity: 'CRASH' | 'TS_ERROR' | 'WARNING' | 'PERFORMANCE';
    code: string;
    description: string;
    scoreDeduction: number;
}

function score3DComponent(content: string, componentName: string): {
    score: number;
    issues: QualityIssue[];
    mustRegenerate: boolean;
} {
    const issues: QualityIssue[] = [];
    let score = 10;
    const nameLower = componentName.toLowerCase();

    if (content.includes('useSpring') && content.includes('@react-three/drei')) {
        issues.push({ severity: 'CRASH', code: 'DREI_USESPRING', description: 'useSpring is NOT exported from @react-three/drei -- use useRef + lerp in useFrame instead', scoreDeduction: 4 });
        score -= 4;
    }

    const hasCanvas = content.includes('<Canvas') || content.includes('<Canvas>');
    const hasR3FHooks = content.includes('useFrame(') || content.includes('useThree(') || content.includes('useScroll()');
    if (hasCanvas && hasR3FHooks) {
        const canvasIdx = content.indexOf('<Canvas');
        const hookIdx = Math.min(
            content.includes('useFrame(') ? content.indexOf('useFrame(') : Infinity,
            content.includes('useThree(') ? content.indexOf('useThree(') : Infinity,
            content.includes('useScroll()') ? content.indexOf('useScroll()') : Infinity
        );
        if (hookIdx < canvasIdx) {
            issues.push({ severity: 'CRASH', code: 'R3F_HOOKS_OUTSIDE_CANVAS', description: 'useFrame/useThree/useScroll called before Canvas -- move into a child component rendered INSIDE <Canvas>', scoreDeduction: 4 });
            score -= 4;
        }
    }

    if (content.includes('MeshTransmissionMaterial')) {
        issues.push({ severity: 'CRASH', code: 'BANNED_MATERIAL', description: 'MeshTransmissionMaterial causes GPU crash -- use meshPhysicalMaterial with transmission={0.9} ior={1.5}', scoreDeduction: 3 });
        score -= 3;
    }

    if (content.includes('useGLTF(')) {
        issues.push({ severity: 'CRASH', code: 'USEGLFT_NO_MODELS', description: 'useGLTF called but no .glb/.gltf files exist -- use procedural geometries', scoreDeduction: 4 });
        score -= 4;
    }

    if ((nameLower.includes('loading') || nameLower.includes('loader') || nameLower.includes('splash')) &&
        (content.includes('children') && (content.includes('props.children') || content.includes('{ children }') || content.includes('{children}')))) {
        issues.push({ severity: 'CRASH', code: 'LOADING_WRAPPER_PATTERN', description: 'LoadingScreen accepts children which kills page content -- must be standalone overlay with NO children prop', scoreDeduction: 4 });
        score -= 4;
    }

    if ((nameLower.includes('footer') || nameLower.includes('navbar') || nameLower.includes('nav3d') || nameLower.includes('header')) &&
        (content.includes("from '@react-three/fiber'") || content.includes('from "@react-three/fiber"') ||
         content.includes("from '@react-three/drei'") || content.includes('from "@react-three/drei"'))) {
        const isLoader = nameLower.includes('loading') || nameLower.includes('loader');
        if (!isLoader || content.includes('useFrame') || content.includes('Canvas')) {
            issues.push({ severity: 'CRASH', code: 'LAYOUT_R3F_IMPORTS', description: 'Footer/Navbar/Header imports @react-three/* but renders outside Canvas -- use pure HTML/CSS + framer-motion only', scoreDeduction: 4 });
            score -= 4;
        }
    }

    if (/<ShaderMaterial[\s/>]/.test(content)) {
        issues.push({ severity: 'TS_ERROR', code: 'SHADERMATERIAL_CASING', description: '<ShaderMaterial> must be lowercase <shaderMaterial attach="material">', scoreDeduction: 3 });
        score -= 3;
    }

    if (content.includes('ChromaticAberration') && /offset=\{\s*\[/.test(content)) {
        issues.push({ severity: 'TS_ERROR', code: 'CHROMATIC_VECTOR', description: 'ChromaticAberration offset must be new THREE.Vector2(), not array', scoreDeduction: 2 });
        score -= 2;
    }

    // CHECK A — extend() without per-element JSX namespace declaration
    if (content.includes('extend({') || content.includes('extend( {')) {
        const extendedNames = [...content.matchAll(/extend\(\{\s*(\w+)/g)].map(m => m[1]);
        for (const name of extendedNames) {
            const jsxName = name.charAt(0).toLowerCase() + name.slice(1);
            if (!content.includes(`'${jsxName}'`) && !content.includes(`"${jsxName}"`)) {
                issues.push({ severity: 'TS_ERROR', code: 'MISSING_JSX_NAMESPACE',
                    description: `extend({${name}}) used but declare global JSX namespace missing for <${jsxName}>`,
                    scoreDeduction: 2 });
                score -= 2;
            }
        }
        if (extendedNames.length > 0 && !content.includes('declare global')) {
            issues.push({ severity: 'TS_ERROR', code: 'EXTEND_NO_JSX_NAMESPACE',
                description: 'extend() used without declare global JSX namespace declaration',
                scoreDeduction: 0 /* already deducted per-name above */ });
        }
    }

    // CHECK B — destructured props with no TypeScript interface
    const componentMatches = [...content.matchAll(/const \w+[^=]*=\s*\(\s*\{([^}]+)\}/g)];
    for (const match of componentMatches) {
        const propsStr = match[1];
        if (propsStr.includes(',') && !content.includes('interface') && !content.includes('type Props')) {
            issues.push({ severity: 'TS_ERROR', code: 'IMPLICIT_ANY_PROPS',
                description: 'Component has destructured props but no TypeScript interface defined — add interface Props { ... }',
                scoreDeduction: 2 });
            score -= 2;
            break;
        }
    }

    // CHECK C — ChromaticAberration missing required radialModulation / modulationOffset props
    if (content.includes('ChromaticAberration') &&
        (!content.includes('radialModulation') || !content.includes('modulationOffset'))) {
        issues.push({ severity: 'TS_ERROR', code: 'CHROMATIC_MISSING_PROPS',
            description: 'ChromaticAberration missing required radialModulation and modulationOffset props',
            scoreDeduction: 1 });
        score -= 1;
    }

    // CHECK D — EffectComposer inside a scene fragment (not a page)
    const isSceneFragment = !nameLower.includes('page') && !nameLower.includes('layout');
    if (isSceneFragment && content.includes('EffectComposer')) {
        issues.push({ severity: 'CRASH', code: 'EFFECT_COMPOSER_IN_FRAGMENT',
            description: 'EffectComposer must be in the page Canvas, not inside a scene fragment',
            scoreDeduction: 3 });
        score -= 3;
    }

    if ((content.includes('range') || content.includes('range[')) &&!nameLower.includes('loading') && !nameLower.includes('footer') && !nameLower.includes('navbar')) {
        const hasDefault = content.includes('range = [') || content.includes('range=[') || content.includes('range?: [');
        if (!hasDefault && content.match(/\brange\b/g)) {
            issues.push({ severity: 'TS_ERROR', code: 'RANGE_POSSIBLY_UNDEFINED', description: 'range prop used without default value -- add ({ range = [0, 1] }: { range?: [number, number] })', scoreDeduction: 2 });
            score -= 2;
        }
    }

    const refAccesses = content.match(/(\w+Ref)\.current\./g) || [];
    if (refAccesses.length > 0 && refAccesses[0]) {
        const refName = refAccesses[0].split('.')[0];
        if (!content.includes(`if (!${refName}.current)`) && !content.includes(`${refName}.current &&`) && !content.includes(`${refName}.current?.`)) {
            issues.push({ severity: 'TS_ERROR', code: 'REF_NO_NULL_CHECK', description: `${refName}.current accessed without null check -- add: if (!${refName}.current) return;`, scoreDeduction: 1 });
            score -= 1;
        }
    }

    if (content.includes('.material.emissive') || content.includes('.material.roughness') || content.includes('.material.metalness') || content.includes('.material.transmission')) {
        if (!content.includes('as THREE.Mesh') && !content.includes('as THREE.MeshStandard') && !content.includes('as THREE.MeshPhysical')) {
            issues.push({ severity: 'TS_ERROR', code: 'MATERIAL_TYPE_ASSERTION', description: 'Material property accessed without type cast -- use (ref.current.material as THREE.MeshStandardMaterial)', scoreDeduction: 2 });
            score -= 2;
        }
    }

    if (content.includes('useFrame(') && !content.includes('range') && !content.includes('visible = false') && !content.includes('scroll.offset') && !nameLower.includes('loading') && !nameLower.includes('ambient')) {
        issues.push({ severity: 'PERFORMANCE', code: 'NO_VISIBILITY_CULLING', description: 'useFrame runs with no visibility culling -- add scroll range guard for GPU performance', scoreDeduction: 2 });
        score -= 2;
    }

    const lineCount = content.split('\n').length;
    if (lineCount < 100 && content.includes('@react-three') && !nameLower.includes('loading') && !nameLower.includes('contact') && !nameLower.includes('ambient')) {
        issues.push({ severity: 'WARNING', code: 'COMPONENT_TOO_THIN', description: `3D scene is only ${lineCount} lines -- needs minimum 100 lines with proper setup`, scoreDeduction: 1 });
        score -= 1;
    }

    if (content.includes('<Canvas') && !content.includes('<Suspense')) {
        issues.push({ severity: 'WARNING', code: 'NO_SUSPENSE_BOUNDARY', description: 'Canvas has no Suspense fallback', scoreDeduction: 1 });
        score -= 1;
    }

    const finalScore = Math.max(0, score);
    const mustRegenerate = finalScore < 7 || issues.some(i => i.severity === 'CRASH' && i.scoreDeduction >= 3);

    return { score: finalScore, issues, mustRegenerate };
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
                    ragContext ? `3D DOCUMENTATION:\n${ragContext}` : '',
                    promptContext ? `THREE.JS REFERENCE:\n${promptContext}` : '',
                ] : (() => {
                    const projectName = blueprint?.projectName ||
                        userPrompt.match(/"projectName"\s*:\s*"([^"]+)"/)?.[1] ||
                        'Studio';

                    const tagline = blueprint?.description
                        ? blueprint.description.split('.')[0].trim()
                        : 'Crafting extraordinary experiences';

                    const navLinks = (blueprint?.pages || [])
                        .filter((p: any) => p.name && p.route)
                        .map((p: any) => `{ label: "${p.name}", route: "${p.route}" }`)
                        .join(', ') ||
                        '{ label: "Home", route: "/" }, { label: "About", route: "/about" }, { label: "Contact", route: "/contact" }';

                    const contactEmail = (blueprint as any)?.contactEmail ||
                        userPrompt.match(/[\w.-]+@[\w.-]+\.\w{2,}/)?.[0] ||
                        '';

                    const accentHex = theme?.palette?.accent || '#22d3ee';
                    const primaryHex = theme?.palette?.primary || '#f472b6';

                    if (spec.sectionType === 'navbar') {
                        const navStyle = pickRandom(NAV_ARCHETYPES);
                        console.log(`  [style-pick] NavBar: ${navStyle.name}`);
                        return [
                        `Build a premium "${navStyle.name}" style NavBar3D for this exact brand:`,
                        ``,
                        `STYLE: ${navStyle.desc}`,
                        ``,
                        `BRAND NAME (use EXACTLY this — no substitutions): "${projectName}"`,
                        `BRAND TYPOGRAPHY: ${navStyle.brandStyle}`,
                        `NAV LINKS (use EXACTLY these routes — no inventions):`,
                        `  ${navLinks}`,
                        `ACCENT COLOR: ${accentHex}`,
                        `PRIMARY COLOR: ${primaryHex}`,
                        ``,
                        `REQUIREMENTS:`,
                        `- Brand is wrapped in <Link to="/">`,
                        `- Each nav link is a <Link to={route}> — NO onClick window.location`,
                        `- Mobile menu: ${navStyle.mobileMenu}`,
                        `- Hover effect: ${navStyle.hoverEffect}`,
                        `- NO lucide-react, NO @react-three imports, NO @/components/ui`,
                        `- Pure inline SVG for any icons`,
                        `- Add framer-motion animations for entrance and interactions`,
                        `- Must be VISUALLY UNIQUE — not generic glassmorphism if the style says otherwise`,
                        ];
                    }

                    if (spec.sectionType === 'footer') {
                        const footerStyle = pickRandom(FOOTER_ARCHETYPES);
                        console.log(`  [style-pick] Footer: ${footerStyle.name}`);
                        return [
                        `Build a cinematic "${footerStyle.name}" style Footer3D for this exact brand:`,
                        ``,
                        `STYLE: ${footerStyle.desc}`,
                        ``,
                        `BRAND NAME (use EXACTLY this): "${projectName}"`,
                        `TAGLINE (use EXACTLY this): "${tagline}"`,
                        ...(contactEmail ? [`CONTACT EMAIL: ${contactEmail}`] : []),
                        `NAV LINKS for footer quick-links (use these exact routes):`,
                        `  ${navLinks}`,
                        `ACCENT COLOR: ${accentHex} — use for gradient accent line and hover states`,
                        ``,
                        `REQUIREMENTS:`,
                        `- Social icons: ${footerStyle.socialStyle}`,
                        `  For SVG icons, write full inline <svg> paths for X/Twitter, GitHub, LinkedIn, Instagram`,
                        `  (write the full SVG path data — no icon library)`,
                        `- Copyright: "© ${new Date().getFullYear()} ${projectName}. All rights reserved."`,
                        `- bg-black or bg-gradient dark base`,
                        `- NO lucide-react, NO @react-three imports, NO @/components/ui`,
                        `- Add framer-motion viewport entrance animations`,
                        `- Must match the "${footerStyle.name}" aesthetic described above — NOT generic 4-column if style says otherwise`,
                        ];
                    }

                    if (spec.sectionType === 'loader' || spec.sectionType === 'loading') {
                        const loaderStyle = pickRandom(LOADER_ARCHETYPES);
                        console.log(`  [style-pick] Loader: ${loaderStyle.name}`);
                        return [
                        `Build a cinematic "${loaderStyle.name}" style LoadingScreen3D for this brand:`,
                        ``,
                        `STYLE: ${loaderStyle.desc}`,
                        ``,
                        `BRAND NAME (show EXACTLY this during loading): "${projectName}"`,
                        `ACCENT COLOR: ${accentHex}`,
                        `PRIMARY COLOR: ${primaryHex}`,
                        ``,
                        `REQUIREMENTS:`,
                        `- STANDALONE OVERLAY — component signature must be:`,
                        `  const LoadingScreen3D: React.FC = () => { ... }`,
                        `  NO children prop. NO wrapping. Floats above everything.`,
                        `- Full-screen fixed: position:fixed inset-0 z-[9999] bg-black`,
                        `- Progress tracking: use import { useProgress } from '@react-three/drei'`,
                        `- Fade out: when progress >= 100, animate opacity to 0 + pointerEvents none`,
                        `  use framer-motion AnimatePresence exit={{ opacity: 0 }}`,
                        `- NO @react-three/fiber, NO Canvas, NO useFrame`,
                        `- ONLY allowed drei import: import { useProgress } from '@react-three/drei'`,
                        `- Implement the "${loaderStyle.name}" aesthetic exactly as described above`,
                        ];
                    }

                    return [
                        `Build a premium glassmorphism ${spec.sectionType} for: ${userPrompt}`,
                        `Brand: "${projectName}" | Colors: ${primaryHex} / ${accentHex}`,
                    ];
                })()),
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
            const quality = score3DComponent(code, spec.name);
            if (quality.mustRegenerate) {
                const crashIssues = quality.issues.filter(i => i.severity === 'CRASH' || i.severity === 'TS_ERROR');
                console.log(`  [quality-gate] ${spec.name} scored ${quality.score}/10 -- REGENERATING (${crashIssues.length} critical issues)`);
                crashIssues.forEach(i => console.log(`    [${i.severity}] ${i.code}: ${i.description}`));

                const issuesList = crashIssues.map(i => `- [${i.severity}] ${i.code}: ${i.description}`).join('\n');
                const fixPrompt = `PREVIOUS ATTEMPT FAILED QUALITY GATE (score ${quality.score}/10).
CRITICAL ISSUES TO FIX:
${issuesList}

You MUST fix ALL of these issues. Do NOT repeat any banned patterns.
Generate a completely new implementation that avoids all these problems.
MINIMUM 200 lines of real code. Include custom shaderMaterial, multiple useFrame loops, useScroll narrative, particle systems.
${buildNarrativeContentInstruction(spec, dna, userPrompt)}`;

                try {
                    const retryResponse = await invokeLLM(build3DSystemPrompt(dna), fixPrompt, 0.9, 3);
                    const retryParsed = parseChirActions(retryResponse);
                    if (retryParsed.length > 0 && retryParsed[0].content.length > code.length) {
                        code = retryParsed[0].content;
                        const retryScore = score3DComponent(code, spec.name);
                        console.log(`  [quality-gate] Retry: ${code.length} chars, score ${retryScore.score}/10`);
                    } else {
                        const retryCodeMatch = retryResponse.match(/```(?:tsx|jsx|typescript|javascript)?\n([\s\S]*?)```/);
                        const retryCode = retryCodeMatch ? retryCodeMatch[1].trim() : '';
                        if (retryCode.length > code.length) {
                            code = retryCode;
                            console.log(`  [quality-gate] Retry fallback: ${code.length} chars`);
                        }
                    }
                } catch (retryErr: any) {
                    console.warn(`  [quality-gate] Retry failed: ${retryErr.message?.slice(0, 60)}`);
                }
            } else {
                console.log(`  [quality-gate] ${spec.name} scored ${quality.score}/10 -- passed`);
            }
        } else {
            const overlayCheck = score3DComponent(code, spec.name);
            if (overlayCheck.issues.some(i => i.code === 'LAYOUT_R3F_IMPORTS' || i.code === 'LOADING_WRAPPER_PATTERN')) {
                console.log(`  [quality-gate] ${spec.name} HTML overlay has R3F imports or wrapper pattern -- regenerating`);
                try {
                    const retryResponse = await invokeLLM(buildHtmlOverlaySystemPrompt(spec.sectionType), `CRITICAL: Your previous ${spec.name} had R3F imports or used children wrapper pattern. Generate a PURE HTML/CSS component with ZERO @react-three imports and NO children prop.\nBUSINESS: ${userPrompt}`, 0.85, 3);
                    const retryParsed = parseChirActions(retryResponse);
                    if (retryParsed.length > 0 && retryParsed[0].content.length > 80) {
                        code = retryParsed[0].content;
                        console.log(`  [quality-gate] ${spec.name} overlay regenerated: ${code.length} chars`);
                    }
                } catch (retryErr: any) {
                    console.warn(`  [quality-gate] Overlay retry failed: ${retryErr.message?.slice(0, 60)}`);
                }
            } else {
                console.log(`  [quality-gate] ${spec.name} HTML overlay verified -- no R3F imports`);
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

    // ──── BUILD SCENE-TO-PAGE MAPPING ────
    // Maps each page to its assigned scene components based on section classification
    const scenePageMap: Record<string, string[]> = {};
    const sceneSpecs = sectionSpecs.filter(s => !['navbar', 'footer', 'loader'].includes(s.sectionType));
    const generatedSceneNames = sceneSpecs
        .filter(s => generatedPaths.some(p => p.includes(s.name)))
        .map(s => ({ name: s.name, sectionType: s.sectionType }));

    const pages = blueprint?.pages || [];

    // classifySection helper (mirrors page-node.ts logic)
    const classifySection = (sectionName: string): string => {
        const lower = sectionName.toLowerCase();
        if (lower.match(/hero|banner|landing|intro|welcome/)) return 'hero';
        if (lower.match(/feature|capability|benefit|what we/)) return 'features';
        if (lower.match(/product|showcase|gallery|portfolio|work|project/)) return 'showcase';
        if (lower.match(/pricing|plan|tier|package/)) return 'pricing';
        if (lower.match(/testimonial|review|client|customer|feedback/)) return 'testimonials';
        if (lower.match(/team|about|who we|staff|people/)) return 'about';
        if (lower.match(/contact|form|reach|touch|connect/)) return 'contact';
        if (lower.match(/cta|call to action|get started|sign up|join/)) return 'cta';
        if (lower.match(/stat|number|metric|counter|achievement/)) return 'stats';
        if (lower.match(/process|how|step|workflow/)) return 'process';
        return 'features';
    };

    // Find ambient scene (always added to every page)
    const ambientScene = generatedSceneNames.find(s => s.sectionType === 'ambient');

    for (const page of pages) {
        const pageName = page.name.replace(/\s+/g, '');
        const pageSections = (page.sections || []).map(s => classifySection(s));
        const assignedScenes: string[] = [];

        // Match page sections to generated scenes
        for (const scene of generatedSceneNames) {
            if (scene.sectionType === 'ambient') continue; // handled separately
            if (pageSections.includes(scene.sectionType)) {
                assignedScenes.push(scene.name);
            }
        }

        // HomePage always gets hero + features if available
        const isHome = page.route === '/' || page.name.toLowerCase().includes('home');
        if (isHome) {
            const heroScene = generatedSceneNames.find(s => s.sectionType === 'hero');
            const featScene = generatedSceneNames.find(s => s.sectionType === 'features');
            if (heroScene && !assignedScenes.includes(heroScene.name)) assignedScenes.unshift(heroScene.name);
            if (featScene && !assignedScenes.includes(featScene.name)) assignedScenes.push(featScene.name);
        }

        // Ensure every page gets at least 3 scenes (pick unassigned ones)
        if (assignedScenes.length < 3) {
            for (const scene of generatedSceneNames) {
                if (scene.sectionType === 'ambient') continue;
                if (!assignedScenes.includes(scene.name)) {
                    assignedScenes.push(scene.name);
                }
                if (assignedScenes.length >= 3) break;
            }
        }

        // Always add ambient scene
        if (ambientScene && !assignedScenes.includes(ambientScene.name)) {
            assignedScenes.push(ambientScene.name);
        }

        scenePageMap[pageName] = assignedScenes;
    }

    console.log('[generate-3d] Scene-to-page mapping:');
    Object.entries(scenePageMap).forEach(([page, scenes]) => {
        console.log(`  ${page}: ${scenes.join(', ')}`);
    });

    let updatedMemory = state.projectMemory;
    if (updatedMemory) {
        updatedMemory = updateMemory3D(updatedMemory, generatedPaths, importInstructions);
    }

    return {
        files: newFiles,
        fileRegistry: registry,
        projectMemory: updatedMemory,
        importInstructions: importInstructions,
        scenePageMap: scenePageMap,
        currentPhase: 'generate_3d_complete',
        messages: [
            `Generated ${newFiles.size} cinematic 3D components for ${dna.industry}`,
            `DNA: ${dna.sceneArchetype} | ${dna.shaderRecommendation} shader | ${dna.particleStyle} particles`,
            `Sections: ${generatedPaths.join(', ')}`,
            `Scene mapping: ${Object.entries(scenePageMap).map(([p, s]) => `${p}=[${s.join(',')}]`).join(' | ')}`,
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
    lines.push('EVERY PAGE STRUCTURE (LoadingScreen3D is STANDALONE, NOT a wrapper):');
    lines.push('<div className="relative min-h-screen bg-black">');
    lines.push('  <LoadingScreen3D />  {/* Standalone absolute overlay -- NO children */}');
    lines.push('  <NavBar3D />');
    lines.push('  <div className="fixed inset-0 bg-black overflow-hidden" style={{ zIndex: 0 }}>');
    lines.push('    <Suspense fallback={<div className="w-full h-full bg-black" />}>');
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
    lines.push('    </Suspense>');
    lines.push('  </div>');
    lines.push('</div>');

    return lines.join('\n');
}