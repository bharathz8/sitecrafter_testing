import { WebsiteState } from '../graph-state';
import { notifyPhaseChange } from '../website-graph';
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

let keyIdx = 0;
function getClient(): OpenAI {
    const key = apiKeys[keyIdx % apiKeys.length] || process.env.gemini;
    return new OpenAI({
        apiKey: key as string,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });
}
function rotateKey() { keyIdx = (keyIdx + 1) % apiKeys.length; }

const EXPANSION_MODEL = 'gemini-2.5-flash-preview-05-20';

// ═══════════════════════════════════════════════════════════════════
// SITECRAFTER 3D EXPANSION SYSTEM
// ═══════════════════════════════════════════════════════════════════

const SITECRAFTER_3D_SYSTEM = `You are SiteCrafter AI — the world's most visionary 3D web experience architect.

You think like:
● A Pixar cinematographer (light, shadow, depth, emotion)
● A senior Three.js artist from Resn, Instrument, or Jam3
● A brand strategist who knows color psychology
● A UX director obsessed with "the scroll reveal"

YOUR SINGLE MOST IMPORTANT RULE:
Every website must feel like it was designed specifically for THIS exact business.
No generic floating spheres. No default blue gradients. No template feelings.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — DECODE THE BUSINESS SOUL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ask yourself: What does this business FEEL like?
- A luxury bakery feels: warm amber light, sugar crystals, soft butter yellows
- A cybersecurity firm feels: electric neon lines, cold steel, data flows, sharp edges
- A yoga studio feels: flowing silk ribbons, morning sunrise gradients, soft bokeh
- A gaming startup feels: particle explosions, neon grids, fast motion blur
- A law firm feels: marble textures, gold accents, monolithic structures, gravitas

Extract:
• The ONE emotion you want visitors to feel the instant the page loads
• The SIGNATURE visual metaphor (e.g., "data neurons", "growing crystals", "silk fabric")
• The COLOR story (specific hex values, not "blue and green")
• The MOTION language (explosive? meditative? rhythmic? liquid?)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — INVENT THE BRAND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create a PREMIUM brand identity:
- Company name: evocative, memorable, industry-appropriate
- Tagline: 5-7 words that capture the essence
- Visual identity: describe logo concept, key typography, primary visual
- Brand voice: premium/playful/authoritative/warm/technical

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — COLOR STORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Design a PRECISE color palette with exact hex values:

BACKGROUND WORLD: The 3D environment color
  Must be rich dark (near-black with a colored tint):
  Examples: #050508 (cold midnight), #080502 (warm void), #020508 (deep ocean), #060408 (purple night)

PRIMARY BRAND: The hero color — must be VIBRANT and MEMORABLE
  Avoid: generic #6366f1 purple or #3b82f6 blue
  Think: #FF6B35 (volcanic orange), #00F5D4 (electric aqua), #FFD700 (pure gold), #E040FB (electric violet)

SECONDARY: Complementary to primary
ACCENT: High contrast for CTAs and key interactions
EMISSIVE: Color used for glowing 3D materials (slightly more saturated than primary)
FOG COLOR: Match background world (string for three.js fog)

HTML OVERLAY COLORS:
  Text: white for dark backgrounds
  Glassmorphism: bg-white/5 border-white/10 for 3D backgrounds
  Button: brand gradient or solid primary

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — TYPOGRAPHY & FONTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Choose 2 Google Fonts that MATCH the brand personality:
- Bold/Display font for hero headings (e.g., Syne, Space Grotesk, Bebas Neue, Rajdhani)
- Clean/Readable font for body (e.g., Inter, DM Sans, Outfit, Plus Jakarta Sans)

Specify: weights, letter-spacing, line-height for each use case

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — 3D SCENE BLUEPRINTS (most important section!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For EACH 3D scene, specify with MAXIMUM PRECISION:

HERO SCENE:
- Central object: [exact geometry + args + scale]
- Material: [exact material type + all properties]
- Lighting: [each light with position, color hex, intensity, type]
- Particles: [Sparkles config OR Stars config]
- Animation: [useFrame code concept — what rotates, what oscillates]
- Fog: [color + near + far values]
- Scroll behavior: [what happens on scroll.offset change]
- Wow factor: [the ONE thing that makes this stunning]

ADDITIONAL SCENES:
- Same level of detail for each scene
- Each scene must feel DIFFERENT from previous ones
- Explain the GEOMETRY VOCABULARY of each scene

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6 — PAGE BLUEPRINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Design 4-6 pages. For each:
- Route and purpose
- 4-6 scroll sections
- For each section: EXACT HEADING TEXT, body copy, CTA text
- Which 3D scene component goes behind it
- HTML overlay design: glassmorphism cards, staggered reveals, gradient text

Heading examples by brand voice:
  Premium: "Crafted for the extraordinary"
  Tech: "Zero latency. Maximum signal."
  Creative: "Where ideas find their form"
  Wellness: "Move with intention. Live with purpose."

ALL COPY MUST BE REAL — no lorem ipsum, no placeholders.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 7 — INTERACTIVE MOMENTS (minimum 8 per page)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every interaction must feel INTENTIONAL:
1. On scroll: 3D objects morph, rotate, or translate (specify direction)
2. On hover button: glow pulse + scale 1.05 + shadow-[0_0_30px_rgba(primary,0.4)]
3. Section reveal: motion.div whileInView with staggered children
4. Glassmorphism cards: hover lifts to bg-white/10 + scale-[1.02]
5. Navigation: Link hover shows colored underline slide from left
6. CTA button: pulsing ring animation + click ripple
7. Hero text: bg-clip-text text-transparent bg-gradient-to-r shimmer
8. Cursor: custom CSS or spotlight effect

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 8 — TECHNICAL SPECIFICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EffectComposer setup (for each page):
- Bloom: intensity=[0.8-2.0], luminanceThreshold=[0.1-0.3], luminanceSmoothing=0.9
- Vignette: offset=0.1, darkness=[0.6-0.9]
- Noise: opacity=[0.02-0.05] for film grain
- ChromaticAberration (optional for dramatic pages): offset=[0.001, 0.001]

ScrollControls:
- pages=[4-6] based on content depth
- damping=0.1 for smooth scroll

Performance:
- Canvas dpr={[1, 1.5]}
- React.lazy for ALL scene components
- Suspense with dark gradient fallback

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- NavBar3D and Footer3D on EVERY page
- LoadingScreen3D wraps EVERY page
- NO lucide-react anywhere
- NO @/components/ui/ imports  
- Scene components return <> fragments (NO Canvas, NO div)
- Pages OWN the single Canvas
- ALL text must be real brand copy
- NO emojis anywhere in the output

OUTPUT FORMAT:
Rich descriptive prose, 4000+ words, structured with === section headers.
Maximum creative detail on 3D scenes. Make the developer excited to implement this.`;

// ═══════════════════════════════════════════════════════════════════
// CREATIVE PROMPTING VARIATIONS
// ═══════════════════════════════════════════════════════════════════

const CREATIVE_INSPIRATIONS = [
    'Think of the most jaw-dropping moment in a movie or game. Create that feeling through 3D web.',
    'Design this as if Kubrick directed it — obsessive attention to visual detail, immersive atmosphere.',
    'This website should feel like entering a different dimension. What does that dimension look like?',
    'Imagine this brand had an unlimited budget for their digital HQ. Design that space.',
    'What if this website existed in 2035? Design the future version of this brand.',
];

// ═══════════════════════════════════════════════════════════════════
// UNIQUENESS ENFORCER
// ═══════════════════════════════════════════════════════════════════

function buildUniquenessDirective(userPrompt: string): string {
    const lower = userPrompt.toLowerCase();

    // Domain-specific visual directions
    if (lower.match(/bak|cake|pastry|bread|dessert|sweet|confect/)) {
        return `BAKING/FOOD VISUAL DIRECTION:
- Geometry should evoke the product: torus = donut/bagel, sphere = bread roll, cylinder = cake layer
- Colors: warm amber (#FF8C42), cream (#FFF5E1), rich brown (#3D1C02), sugar pink (#FFACC7)
- Particles: "sugar crystal" sparkles — small, bright, slightly warm
- Background fog: warm sepia (#160800)
- Key animation: MeshDistortMaterial suggesting dough/batter rising and morphing
- Lighting: warm key light (amber), cool fill (lavender) for depth like professional food photography
- Unique element: floating layered "cake stack" geometry made of stacked cylinders with slight taper`;
    }

    if (lower.match(/tech|saas|software|ai|data|cloud|startup|platform|app/)) {
        return `TECH/SAAS VISUAL DIRECTION:
- Geometry: crystalline, sharp, lattice structures — dodecahedron, icosahedron, cube networks
- Colors: electric cyan (#00F5FF), deep void (#020810), signal blue (#1E90FF), data white (#E8F4FF)
- Particles: "data packets" — organized lines/grids of tiny particles
- Background fog: deep navy (#010308)
- Key animation: objects form/dissolve as if data is materializing
- Lighting: cold desaturated key + electric accent colors
- Unique element: interconnected node network — spheres linked by thin glowing cylinders`;
    }

    if (lower.match(/fashion|cloth|apparel|style|luxury|jewel|boutique/)) {
        return `FASHION/LUXURY VISUAL DIRECTION:
- Geometry: fluid, organic, ribbon-like — planeGeometry with bezier curves, torus variations
- Colors: obsidian (#0A0A0A), rose gold (#B76E79), champagne (#F7E7CE), pearl white (#F8F6F0)
- Particles: "diamond dust" — tiny high-opacity sparks
- Background fog: near-black with warm tint (#080504)
- Key animation: fabric-like MeshWobbleMaterial with very gentle factor=0.1
- Lighting: dramatic top-down key (high-fashion editorial), rim lights for silhouette
- Unique element: oversized floating ring torus with metallic clearcoat material`;
    }

    if (lower.match(/gym|fitness|sport|workout|health|wellness|yoga|meditat/)) {
        return `FITNESS/WELLNESS VISUAL DIRECTION:
- Geometry: dynamic tension forms — torusKnot for strength, sphere for balance, cone for direction
- Colors: energetic orange (#FF6B1A), power black (#0D0D0D), vital white (#FFFFFF), calm teal (#00BFA5)
- Particles: "energy field" — fast-moving, directional
- Background fog: deep charcoal (#0A0A0A)
- Key animation: continuous rotation with varying speeds, pulse on beat
- Lighting: high contrast dramatic like sports photography studio
- Unique element: pulsing energy rings expanding outward from central sphere`;
    }

    if (lower.match(/agenc|design|creat|studio|portfol|art/)) {
        return `CREATIVE/AGENCY VISUAL DIRECTION:
- Geometry: asymmetric, experimental — combine unexpected shapes: flat planes + spheres + spikes
- Colors: brand-specific bold choice + deep neutral, maximum contrast
- Particles: "idea sparks" — random burst patterns
- Background fog: pure black (#000000) for maximum contrast
- Key animation: objects orbit each other creating dynamic tension
- Lighting: gallery-style isolated spotlights on each object
- Unique element: abstract "logo form" made of multiple primitive combinations`;
    }

    // Default: make something distinctive based on first words
    const keywords = userPrompt.split(' ').slice(0, 3).join(' ');
    return `CUSTOM VISUAL DIRECTION for "${keywords}":
- Study the business deeply and create BESPOKE visual metaphors
- The 3D geometry should be a DIRECT visual metaphor for the product/service
- Invent a color story that NOBODY has seen before for this industry
- Create a motion language that feels INEVITABLE for this brand
- Every design choice must have a REASON connected to the brand values`;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN NODE
// ═══════════════════════════════════════════════════════════════════

export async function promptExpansionNode(state: WebsiteState): Promise<Partial<WebsiteState>> {
    console.log('\n ===============================================');
    console.log(' NODE: PROMPT EXPANSION (SiteCrafter 3D Pro)');
    console.log(' ===============================================\n');

    notifyPhaseChange('prompt_expansion');

    const userPrompt = state.userPrompt;

    if (userPrompt.length > 3000) {
        console.log('    [Expansion] Prompt already detailed (>3000 chars), skipping');
        return {
            expandedPrompt: userPrompt,
            currentPhase: 'prompt_expanded',
            messages: ['Prompt already detailed, skipping expansion'],
        };
    }

    // Pick a creative inspiration for this expansion
    const inspiration = CREATIVE_INSPIRATIONS[Math.floor(Math.random() * CREATIVE_INSPIRATIONS.length)];
    const uniquenessDirective = buildUniquenessDirective(userPrompt);

    const userMessage = `EXPAND THIS INTO A COMPLETE 3D WEBSITE BLUEPRINT:

"${userPrompt}"

CREATIVE INSPIRATION FOR THIS PROJECT:
${inspiration}

VISUAL DIRECTION (MANDATORY):
${uniquenessDirective}

REQUIREMENTS:
1. Invent a PREMIUM brand name and emotionally resonant tagline
2. Design an EXACT color palette with hex values (not generic colors)
3. Choose Google Fonts that MATCH the brand personality
4. Design 4-6 pages with 4-6 SCROLL SECTIONS each
5. Write REAL content (headings, descriptions, CTAs) — ZERO lorem ipsum
6. Specify 3D scenes with PRECISE geometry, materials, lighting, particles
7. Detail interactive behaviors for MINIMUM 8 interactions per page
8. This is a PURE React Three Fiber project — scenes are R3F fragments
9. NavBar3D (glassmorphism HTML) + Footer3D (dark HTML) on every page
10. LoadingScreen3D (HTML with useProgress) wraps every page
11. Pages own the Canvas with ScrollControls — scenes are lazy-loaded fragments

MAKE IT AN AWWWARDS WINNER. Make developers excited. Make clients say "finally."
Absolutely no generic choices. Everything must earn its place by serving the brand.`;

    const MAX_ATTEMPTS = 3;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            rotateKey();
            const client = getClient();

            console.log(`    [Expansion] Attempt ${attempt}/${MAX_ATTEMPTS} with creative mode...`);

            const response = await client.chat.completions.create({
                model: EXPANSION_MODEL,
                messages: [
                    { role: 'system', content: SITECRAFTER_3D_SYSTEM },
                    { role: 'user', content: userMessage },
                ],
                temperature: 0.95, // High creativity
                max_tokens: 16000,
            });

            const expanded = response.choices[0]?.message?.content || '';

            if (expanded.length < 500) {
                console.warn(`    [Expansion] Response too short (${expanded.length} chars), retrying...`);
                rotateKey();
                continue;
            }

            console.log(`    [Expansion] Expanded to ${expanded.length} chars`);
            console.log(`    [Expansion] Preview: ${expanded.slice(0, 200).replace(/\n/g, ' ')}...`);

            return {
                expandedPrompt: expanded,
                currentPhase: 'prompt_expanded',
                messages: [
                    `Prompt expanded: ${userPrompt.length} → ${expanded.length} chars`,
                    `Creative mode: ${inspiration.slice(0, 50)}...`,
                ],
            };

        } catch (err: any) {
            console.warn(`    [Expansion] Attempt ${attempt} failed: ${err.message?.slice(0, 80)}`);
            rotateKey();
            if (attempt < MAX_ATTEMPTS) {
                await new Promise(r => setTimeout(r, 1500));
            }
        }
    }

    console.log('    [Expansion] All attempts failed, using original prompt');
    return {
        expandedPrompt: userPrompt,
        currentPhase: 'prompt_expanded',
        messages: ['Prompt expansion failed, using original'],
    };
}