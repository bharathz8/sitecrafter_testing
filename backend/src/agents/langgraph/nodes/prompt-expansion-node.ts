import { WebsiteState } from '../graph-state';
import { notifyPhaseChange } from '../website-graph';
import OpenAI from 'openai';

const apiKeys = [
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
].filter(k => k && k.length > 0) as string[];

let keyIdx = 0;

function getClient(): OpenAI {
    const key = apiKeys[keyIdx % apiKeys.length] || process.env.gemini;
    return new OpenAI({
        apiKey: key as string,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });
}

function rotateKey(): void {
    keyIdx = (keyIdx + 1) % apiKeys.length;
}

const EXPANSION_MODEL = 'gemini-2.5-flash-preview-05-20';

const SITECRAFTER_SYSTEM = `You are SiteCrafter AI -- the world's most advanced 3D website blueprint intelligence.

YOUR MISSION: Transform ANY user prompt (even 2-3 words) into a rich, detailed, production-ready 3D website blueprint.

You think like:
- A Hollywood VFX director (visual drama, cinematic timing)
- A Senior UX Engineer at Apple (interaction precision, micro-detail)
- A Three.js / R3F artist (spatial thinking, light, depth)
- A brand strategist (storytelling, emotion, conversion)

EXPANSION PIPELINE:

STEP 1 -- DECODE THE PROMPT
Extract even if not stated:
- Industry / Niche
- Target Audience
- Emotional Goal (what should users FEEL?)
- Business Goal (drive orders, capture leads, build trust?)
- Aesthetic Direction (infer from industry)
- Key Pages Needed (5-7 pages minimum)
- 3D Opportunities (what geometry, materials, effects fit this brand?)

STEP 2 -- NAME AND BRAND
Invent a PREMIUM brand name, tagline, and visual identity.
Make it feel like a real funded startup with a $50K design budget.

STEP 3 -- COLOR PALETTE
Design a SPECIFIC color palette with exact hex values:
- Background (near-black, rich: #050508 to #0a0a12)
- Primary brand color (vibrant, memorable)
- Secondary color (complementary)
- Accent color (electric, for CTAs and highlights)
- Text colors (primary white, secondary muted, tertiary very muted)
- Glassmorphism: bg-white/5, border-white/10

STEP 4 -- TYPOGRAPHY
Choose 2-3 Google Fonts that match the brand personality:
- Heading font (bold, distinctive)
- Body font (clean, readable)
Font pairing must feel premium and intentional.

STEP 5 -- PAGE BLUEPRINTS
For each page (5-7 pages), specify:
- Page name and route
- 4-6 sections per page
- For each section: heading text, body text, CTA text (REAL content, not lorem ipsum)
- 3D scene idea (what geometry, materials, animations fit)
- Interactive elements (hover, scroll, click behaviors)
- HTML overlay layout (glassmorphism cards, gradient text, staggered reveals)

STEP 6 -- 3D SCENE SPECIFICATIONS
For each major scene, describe:
- Geometry types (Sphere, Dodecahedron, Torus, IcosahedronGeometry etc.)
- Materials (MeshDistortMaterial, meshPhysicalMaterial, MeshWobbleMaterial)
- Lighting (ambient + spot + point with specific colors)
- Particle effects (Sparkles count, color, size)
- Post-processing (Bloom intensity, Vignette darkness)
- Interactions (onPointerOver scale, useFrame rotation, useScroll opacity)

STEP 7 -- INTERACTIVITY REQUIREMENTS
At least 8 interactive elements per page:
- Hover effects: scale, glow, color shift on buttons and cards
- Scroll animations: motion.div whileInView with staggered delays
- Glassmorphism cards: backdrop-blur-xl bg-white/5 border border-white/10
- Gradient text: bg-clip-text text-transparent bg-gradient-to-r
- Animated counters that count up on scroll
- Parallax depth between 3D and HTML layers
- Cursor-following effects or spotlight
- Floating decorative elements (gradient orbs, grid overlays)

RULES:
- ALL text must be REAL content specific to this business (NEVER lorem ipsum)
- NEVER reference @/components/ui/ (Button, Card, Input DO NOT EXIST)
- NEVER reference lucide-react (NOT installed)
- Use native HTML button, div, a for overlays
- NavBar3D and Footer3D are MANDATORY on every page
- LoadingScreen3D wraps every page
- Scene components return fragments (NO Canvas inside scenes)
- Pages own the Canvas with ScrollControls

OUTPUT FORMAT:
Return your expansion as a continuous, detailed text document (4000+ words).
Structure it with clear section headers using === markers.
Do NOT return JSON. Return rich, descriptive prose that will guide code generation.
Do NOT use emojis. Keep it professional and technical.`;

export async function promptExpansionNode(state: WebsiteState): Promise<Partial<WebsiteState>> {
    console.log('\n ===============================================');
    console.log(' NODE: PROMPT EXPANSION (SiteCrafter)');
    console.log(' ===============================================\n');

    notifyPhaseChange('prompt_expansion');

    const userPrompt = state.userPrompt;

    if (userPrompt.length > 3000) {
        console.log('    [Expansion] Prompt already detailed (>3000 chars), skipping expansion');
        return {
            expandedPrompt: userPrompt,
            currentPhase: 'prompt_expanded',
            messages: ['Prompt already detailed, skipping expansion'],
        };
    }

    const userMessage = `Expand this user prompt into a complete 3D website blueprint:

"${userPrompt}"

Remember:
1. Invent a premium brand name and tagline
2. Design a specific color palette with hex values
3. Choose Google Fonts
4. Design 5-7 pages with 4-6 sections each
5. Write REAL content (headings, descriptions, CTAs) -- NO lorem ipsum
6. Specify 3D scenes with geometry, materials, lighting, particles
7. Detail interactive behaviors (hover, scroll, click)
8. This is a PURE 3D project using React Three Fiber, Drei, and Three.js
9. NavBar3D (glassmorphism HTML nav) and Footer3D (dark cinematic HTML footer) are on every page
10. Every page wraps in LoadingScreen3D

Make it a website that wins Awwwards. Make users say WOW.`;

    const MAX_ATTEMPTS = 3;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            rotateKey();
            const client = getClient();

            console.log(`    [Expansion] Attempt ${attempt}/${MAX_ATTEMPTS}...`);

            const response = await client.chat.completions.create({
                model: EXPANSION_MODEL,
                messages: [
                    { role: 'system', content: SITECRAFTER_SYSTEM },
                    { role: 'user', content: userMessage },
                ],
                temperature: 0.9,
                max_tokens: 16000,
            });

            const expanded = response.choices[0]?.message?.content || '';

            if (expanded.length < 500) {
                console.warn(`    [Expansion] Response too short (${expanded.length} chars), retrying...`);
                rotateKey();
                continue;
            }

            console.log(`    [Expansion] Expanded to ${expanded.length} chars`);
            console.log(`    [Expansion] Preview: ${expanded.slice(0, 200)}...`);

            return {
                expandedPrompt: expanded,
                currentPhase: 'prompt_expanded',
                messages: [`Prompt expanded from ${userPrompt.length} to ${expanded.length} chars`],
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
        messages: ['Prompt expansion failed, using original prompt'],
    };
}
