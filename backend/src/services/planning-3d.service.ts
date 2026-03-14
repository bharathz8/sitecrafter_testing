import type { PlanningResponse, ProjectBlueprint } from '../types/planning.types';
import { OutputParser } from '../utils/parser.utils';
import { UI3DService } from './ui-3d.service';
import { generateDynamicTheme, formatThemeForPrompt, DynamicDesignTheme } from './dynamic-trends.service';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.gemini,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const openai2 = new OpenAI({
  apiKey: process.env.gemini2,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const PLANNING_MODEL = "gemini-2.5-flash-lite";

interface ProjectAnalysis {
  type: 'frontend';
  nodeCount: number;
  complexity: 'complex';
}

export class Planning3DService {

  private static async generate3DFrontendContext(requirements: string, blueprint: ProjectBlueprint): Promise<string> {
    const frontendPrompt = `YOU ARE AN AUTONOMOUS AI AGENT -- ELITE 3D WEB EXPERIENCE ARCHITECT

USER'S REQUEST: "${requirements}"

YOUR MISSION:
From this ONE request, you will independently design a CINEMATIC, IMMERSIVE, INTERACTIVE 3D website using React Three Fiber, Drei, and Three.js. Think Awwwards, FWA, CSS Design Awards quality.

THIS IS A PURE 3D PROJECT. THERE ARE NO 2D UI COMPONENTS.

====================================================================

PHASE 1: AUTONOMOUS 3D EXPERIENCE DESIGN

Design 6-10 immersive 3D sections that tell a visual story:

HERO EXPERIENCE (1 section):
- Cinematic 3D scene with floating geometry, particle effects, volumetric lighting
- Animated text overlays with scroll-triggered reveals
- Interactive elements: hover effects on 3D objects, cursor-following lights

CONTENT SECTIONS (3-5 sections):
- Each section has its own 3D scene inside a shared Canvas
- Scenes are placed at Y offsets inside ScrollControls
- HTML text overlays in Scroll html sections with glassmorphism cards
- Features, showcase, testimonials, stats -- all with 3D backgrounds

INTERACTIVE MOMENTS (1-2 sections):
- Scroll-driven camera movements
- 3D objects that react to mouse position
- Parallax depth effects between 3D and HTML layers

CTA + FOOTER (1-2 sections):
- Dramatic closing 3D scene
- Footer3D as the last HTML section

====================================================================

PHASE 2: 3D TECHNICAL ARCHITECTURE

FILE STRUCTURE:
src/
  components/3d/
    HeroScene3D.tsx - Hero 3D scene (returns fragment, NO Canvas)
    FeaturesScene3D.tsx - Features background scene
    ShowcaseScene3D.tsx - Showcase/portfolio scene
    TestimonialsScene3D.tsx - Social proof scene
    CtaScene3D.tsx - CTA dramatic scene
    BackgroundScene3D.tsx - Ambient background particles
    NavBar3D.tsx - Glassmorphism HTML nav (NOT 3D)
    Footer3D.tsx - Dark cinematic HTML footer (NOT 3D)
    LoadingScreen3D.tsx - HTML loading overlay with useProgress
  pages/
    HomePage.tsx - Main page with Canvas + ScrollControls
    AboutPage.tsx - About with its own Canvas + scenes
    ContactPage.tsx - Contact with 3D background
    [FeaturePages].tsx - Additional pages as needed
  lib/
    utils.ts - cn utility

COMPONENT ARCHITECTURE:

TYPE 1 -- SCENE COMPONENTS (HeroScene3D, FeaturesScene3D, etc.):
- Return React Fragment (<>...</>), NEVER Canvas or div
- Contain ONLY R3F elements: mesh, group, lights, Float, Sparkles, ContactShadows
- Use useFrame for animation loops
- Use useScroll to react to scroll position
- NEVER contain: Canvas, div, Html, ScrollControls, Scroll, EffectComposer, Suspense
- Page places these INSIDE its Canvas at Y offsets

TYPE 2 -- NAVBAR3D (pure HTML):
- Fixed glassmorphism nav bar with backdrop-blur
- Uses Link from react-router-dom
- CSS-only hamburger menu (3 spans -> X)
- NO Canvas, NO 3D, NO lucide-react

TYPE 3 -- FOOTER3D (pure HTML):
- Dark cinematic footer with grid columns
- Inline SVG for social icons
- NO Canvas, NO 3D, NO lucide-react

TYPE 4 -- LOADINGSCREEN3D (HTML overlay):
- Wraps children, fades out when useProgress reaches 100
- NO Canvas inside this component

TYPE 5 -- PAGES:
- Each page owns ONE Canvas with ScrollControls
- Lazy-loads scene components
- Scroll html sections contain text overlays with framer-motion
- EffectComposer INSIDE Canvas, AFTER ScrollControls
- Environment preset inside Canvas

PAGE STRUCTURE PATTERN:
const Page = () => (
  <LoadingScreen3D>
    <NavBar3D />
    <div className="fixed inset-0 w-full h-screen bg-black overflow-hidden">
      <Suspense fallback={<div className="w-full h-full bg-black" />}>
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.5]}>
          <color attach="background" args={['#050505']} />
          <ScrollControls pages={N} damping={0.1}>
            <Scroll>
              <HeroScene3D />
              <group position={[0, -10, 0]}><FeaturesScene3D /></group>
              <group position={[0, -20, 0]}><ShowcaseScene3D /></group>
            </Scroll>
            <Scroll html>
              <section className="h-screen w-screen flex items-center justify-center">
                <motion.div className="text-center pointer-events-auto">
                  <h1 className="text-6xl font-bold text-white">...</h1>
                </motion.div>
              </section>
              <!-- more sections -->
              <Footer3D />
            </Scroll>
          </ScrollControls>
          <Environment preset="city" />
          <EffectComposer>
            <Bloom intensity={1.5} luminanceThreshold={0.2} />
            <Vignette eskil={false} offset={0.1} darkness={0.8} />
          </EffectComposer>
        </Canvas>
      </Suspense>
    </div>
  </LoadingScreen3D>
);

====================================================================

PHASE 3: VISUAL DESIGN FOR 3D

3D VISUAL TECHNIQUES:
- Organic floating geometry with MeshDistortMaterial (speed=2, distort=0.3)
- Glass-like surfaces with meshPhysicalMaterial (clearcoat=1, roughness=0.1, metalness=0.8)
- Particle fields with Sparkles (count=60, scale=15, size=2, speed=0.3)
- Soft contact shadows with ContactShadows
- Volumetric fog with <fog attach="fog" args={['#000', 5, 20]} />
- Smooth floating with Float (speed=2, rotationIntensity=1)

INTERACTIVE PATTERNS:
- onPointerOver: cursor pointer, scale up with lerp in useFrame
- onPointerOut: cursor default, scale back
- Scroll-linked opacity and position changes via useScroll
- Mouse-following spot lights
- Click to navigate: onClick={() => navigate('/page')}

LIGHTING:
- ambientLight (intensity 0.2-0.4) for base
- spotLight with penumbra=1 for dramatic highlights
- pointLight for accent colors matching brand palette
- RectAreaLight for soft panel-style illumination

POSTPROCESSING:
- EffectComposer with Bloom (intensity 1-2, luminanceThreshold 0.2)
- Vignette (offset 0.1, darkness 0.7-0.9)
- Noise (opacity 0.03-0.05) for film grain
- ChromaticAberration for dramatic moments
- NEVER use disableNormalPass (use enableNormalPass={false} if needed)

====================================================================

PHASE 4: DEPENDENCIES

REQUIRED (package.json):
- react: ^18.3.1
- react-dom: ^18.3.1
- react-router-dom: ^7.1.1
- three: ^0.170.0
- @react-three/fiber: ^8.17.10
- @react-three/drei: ^9.117.3
- @react-three/postprocessing: ^2.16.3
- framer-motion: ^11.14.4
- gsap: ^3.12.5
- clsx: ^2.1.1
- tailwind-merge: ^2.5.5
- leva: ^0.9.35

BANNED (NEVER USE):
- lucide-react
- @/components/ui/Button, Card, Input, Badge (DO NOT EXIST)
- swiper
- stripe
- @radix-ui/*
- react-hot-toast
- sonner
- recharts

====================================================================

PHASE 5: MAKING IT UNIQUE AND INTERACTIVE

Every 3D website must feel like a JOURNEY:
1. First impression: dramatic hero with cinematic lighting and floating geometry
2. Scroll engagement: scenes transition as user scrolls, new elements appear
3. Discovery moments: interactive 3D objects respond to hover/click
4. Emotional connection: colors, motion, and depth create mood
5. Call to action: dramatic closing scene with clear CTA
6. Navigation: smooth transitions between pages

UNIQUENESS TECHNIQUES:
- Use the business type to choose geometry (organic blobs for wellness, sharp crystals for tech, flowing ribbons for fashion)
- Color-code 3D elements to match brand palette
- Create signature animations unique to this brand
- Use scroll position to morph/transform objects
- Interactive product showcases with 3D rotation

====================================================================

CRITICAL REQUIREMENTS:
1. Generate 8000+ words of ULTRA-DETAILED specifications
2. Specify EXACT 3D scene contents for every page
3. List exact R3F components, materials, and animations for each scene
4. Provide REAL content (headings, descriptions, CTA text)
5. Include color palette as HSL values
6. Specify lighting setup for each scene
7. Detail every interactive behavior
8. NO 2D patterns (no Header.tsx, Footer.tsx from layout, no Card, no Button from ui/)
9. NO lucide-react
10. Use web-safe fonts (Inter, Outfit, Space Grotesk) for HTML overlays

OUTPUT AS ONE CONTINUOUS STRING -- no line breaks in detailedContext.`;

    const response = await openai2.chat.completions.create({
      model: PLANNING_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an autonomous AI agent -- an elite 3D web experience architect specializing in React Three Fiber, Drei, and Three.js. You create immersive, cinematic, interactive 3D websites that win design awards. You never use 2D UI components. You design pure 3D experiences with Canvas, ScrollControls, scene components, and HTML overlays."
        },
        {
          role: "user",
          content: frontendPrompt
        }
      ],
      temperature: 0.8,
      max_tokens: 16000
    });

    let context = response.choices[0].message.content || blueprint.detailedContext;

    console.log('[Planning3D] Selecting 3D RAG components...');
    const ragSelection = await UI3DService.selectComponents(requirements);
    if (ragSelection.selectedChunks.length > 0) {
      context += "\n\n" + ragSelection.formattedForPrompt;
      console.log(`[Planning3D] Added ${ragSelection.selectedChunks.length} RAG chunks from ${ragSelection.queryCount} queries`);
    }

    return context;
  }

  private static generate3DSystemPrompt(nodeCount: number): string {
    return `You are a world-class 3D web experience architect specializing in React Three Fiber, Three.js, and Drei. You create CINEMATIC, IMMERSIVE, INTERACTIVE 3D websites that win Awwwards, FWA, and CSS Design Awards.

=== CORE MISSION ===

Create PRODUCTION-LEVEL, AWARD-WINNING 3D web experiences with:
- Cinematic 3D scenes with dramatic lighting and effects
- Scroll-driven storytelling with scene transitions
- Interactive 3D elements that respond to user input
- Professional HTML overlays with glassmorphism
- Smooth 60fps performance with optimized rendering

PROJECT COMPLEXITY: PRODUCTION-READY (ALWAYS)
ARCHITECTURE SCALE: ${nodeCount} nodes -- ONLY nodes that become actual files

=== 3D PROJECT ARCHITECTURE ===

3D FRONTEND PROJECT:
- Design MULTI-PAGE 3D architecture with React Router DOM
- MINIMUM 4-6 pages: Home + 2-4 feature pages + Contact
- Each page has its own Canvas + ScrollControls

EXACT NODES TO CREATE (no more, no less):
  ENTRY:     src/main.tsx, src/App.tsx
  LAYOUT:    src/components/layout/AppLayout.tsx
  3D UI:     src/components/3d/NavBar3D.tsx, src/components/3d/Footer3D.tsx, src/components/3d/LoadingScreen3D.tsx
  SCENES:    src/components/3d/HeroScene3D.tsx, src/components/3d/[Feature]Scene3D.tsx (3-5 scenes)
  3D SHARED: src/components/3d/BackgroundScene3D.tsx
  PAGES:     src/pages/HomePage.tsx, src/pages/[Feature]Page.tsx (2-4 pages), src/pages/ContactPage.tsx
  UTIL:      src/lib/utils.ts

DO NOT CREATE these waste nodes (they never become files):
- animation-manager, scroll-manager, state-manager
- performance-optimizer, seo-manager, toast-manager
- accessibility-manager, event-listener-handler
- responsive-handler, design-tokens, form-validation
- global-cursor, 3d-assets-loader

=== TECH STACK (MANDATORY) ===

Frontend: React, TypeScript, Three.js, @react-three/fiber, @react-three/drei, @react-three/postprocessing
Animation: framer-motion (HTML), useFrame (3D), gsap
Styling: Tailwind CSS (for HTML overlays only)
Routing: react-router-dom

BANNED:
- lucide-react (use inline SVG instead)
- @/components/ui/* (Button, Card, Input DO NOT EXIST)
- Header.tsx / Footer.tsx from components/layout (use NavBar3D / Footer3D from components/3d/)
- swiper, stripe, @radix-ui/*, sonner, react-hot-toast, recharts

=== FILE STRUCTURE ===

src/
  components/3d/
    HeroScene3D.tsx
    FeaturesScene3D.tsx
    ShowcaseScene3D.tsx
    TestimonialsScene3D.tsx
    CtaScene3D.tsx
    BackgroundScene3D.tsx
    NavBar3D.tsx (HTML nav)
    Footer3D.tsx (HTML footer)
    LoadingScreen3D.tsx (HTML overlay)
  pages/
    HomePage.tsx
    AboutPage.tsx
    ContactPage.tsx
    [Feature]Page.tsx
  lib/
    utils.ts

=== MATERIAL AND INTERACTION RULES ===

Materials:
- Intrinsic (LOWERCASE): meshPhysicalMaterial, meshStandardMaterial, meshBasicMaterial
- Drei (CAPITALIZED): MeshDistortMaterial, MeshWobbleMaterial
- NEVER use: MeshTransmissionMaterial, Text, Text3D, useGLTF, useTexture

Interactions:
- onPointerOver/onPointerOut for cursor changes and hover scaling
- useFrame with refs for smooth lerp animations
- useScroll for scroll-linked position/opacity changes
- onClick with useNavigate for page transitions

Scene components return <> fragments, NEVER <Canvas> or <div>

=== DESIGN SYSTEM for HTML overlays ===

Color Palette (HSL values):
- Choose 3-5 colors matching the business type
- Primary: brand color as HSL
- Background: near-black (#050505 to #0a0a0a) for 3D contrast
- Text: white/near-white for readability on dark 3D backgrounds
- Accent: vibrant highlight color for CTAs and interactive elements

Typography (Web-Safe for overlays):
- Headings: Inter or Space Grotesk (font-bold, tracking-tighter)
- Body: Inter (font-normal, text-white/80)
- Sizes: text-6xl md:text-8xl for hero, text-xl for body

Glassmorphism for cards/panels:
- bg-white/5 or bg-white/10
- backdrop-blur-xl
- border border-white/10
- rounded-2xl

=== detailedContext STRING FORMATTING ===

The "detailedContext" field MUST be a SINGLE, CONTINUOUS STRING on ONE LINE.
Write the ENTIRE 8000+ word guide as ONE continuous string.
NO actual line breaks. Use periods and commas to separate sections.
Remove ALL emojis.

=== OUTPUT FORMAT (PURE JSON) ===

{
  "projectName": "Descriptive Name",
  "description": "Brief description",
  "techStack": {
    "frontend": ["React", "TypeScript", "Three.js", "R3F", "Drei"],
    "backend": [],
    "database": [],
    "external": []
  },
  "features": ["feature1", "feature2"],
  "workflow": {
    "nodes": [{ "id": "unique-id", "type": "page|component", "label": "Short Name", "category": "Frontend" }],
    "edges": [{ "id": "e1", "source": "id1", "target": "id2", "label": "action", "type": "http" }]
  },
  "detailedContext": "ULTRA-DETAILED 3D IMPLEMENTATION GUIDE as one continuous string..."
}

CRITICAL RULES:
1. Create EXACTLY ${nodeCount} nodes
2. Pure JSON output, no markdown
3. detailedContext: 4000+ words minimum on ONE LINE (the expanded prompt already provides enrichment)
4. NO 2D patterns (no Header.tsx, Footer.tsx from layout/, no Card, Button, Input from ui/)
5. NO lucide-react
6. Scene components return fragments
7. Pages own the Canvas
8. ALL interactive behaviors specified
9. REAL content for all text (no lorem ipsum)
10. NO emojis`;
  }

  static async generateBlueprint(
    requirements: string,
    retryCount: number = 0,
    projectTypeFromFrontend?: 'frontend' | 'backend' | 'fullstack'
  ): Promise<PlanningResponse> {
    const MAX_RETRIES = 3;

    try {
      const projectType = 'frontend' as const;
      const nodeCount = 18;
      const complexity = 'complex' as const;

      console.log(`\n[Planning3D] PROJECT ANALYSIS:`);
      console.log(`  Type: 3D FRONTEND [Pure 3D Mode]`);
      console.log(`  Complexity: ${complexity.toUpperCase()} (PRODUCTION-LEVEL)`);
      console.log(`  Nodes: ${nodeCount}`);
      console.log(`  Generating immersive 3D blueprint (attempt ${retryCount + 1}/${MAX_RETRIES + 1})...`);

      const dynamicTheme = generateDynamicTheme(requirements);
      const themePrompt = formatThemeForPrompt(dynamicTheme);

      console.log(`  Dynamic Theme: ${dynamicTheme.palette.name}`);
      console.log(`  Animation Style: ${dynamicTheme.animation.name}`);

      const systemPrompt = this.generate3DSystemPrompt(nodeCount);
      const userPrompt = `Create a PURE 3D FRONTEND project blueprint for:

"${requirements}"

${themePrompt}

=== YOUR MISSION ===

Design an AWARD-WINNING, IMMERSIVE 3D web experience using React Three Fiber.
This is NOT a 2D website with 3D elements. This is a PURE 3D EXPERIENCE.

The user should feel like they are exploring a living, breathing digital world.
Every scroll, every hover, every click should create wonder and delight.

USE the design theme colors "${dynamicTheme.palette.name}" for 3D materials and HTML overlays.
Primary color for emissive materials, accent for interactive highlights.

=== REQUIRED PAGES (3-5 minimum) ===

- HomePage: Full cinematic 3D experience with 4-6 scene sections
- Feature/Product pages: 2-3 additional pages with unique 3D scenes
- About/Contact: Pages with ambient 3D backgrounds

=== 3D SCENE REQUIREMENTS ===

For EACH page, specify:
1. Scene components with exact R3F elements (geometries, materials, lights)
2. Animation patterns (useFrame loops, scroll-linked transforms)
3. Interactive behaviors (hover effects, click actions)
4. HTML overlay content (headings, descriptions, CTAs with exact text)
5. Postprocessing effects (Bloom, Vignette settings)
6. Lighting setup (ambient, spot, point with colors and intensities)

=== MAKING IT INTERACTIVE AND UNIQUE ===

1. Hero scene: dramatic entrance with animated geometry and particles
2. Scroll engagement: objects transform, appear, and react as user scrolls
3. Hover interactions: 3D objects scale, glow, or morph on hover
4. Click-to-explore: objects that can be clicked to reveal content or navigate
5. Parallax depth: HTML overlays move at different rates than 3D elements
6. Scene transitions: smooth morphing between sections during scroll
7. Cursor effects: spotlight or particle trail following mouse
8. Sound design cues: mention where subtle audio could enhance (optional)

=== BANNED IN 3D PROJECTS ===

NEVER include these in any file path, import, or specification:
- src/components/ui/ (Button.tsx, Card.tsx, Input.tsx, Badge.tsx)
- src/components/layout/Header.tsx or Footer.tsx
- lucide-react icons
- import { Button } from '@/components/ui/Button'
- import { Card } from '@/components/ui/Card'
- Any @radix-ui/* components

USE INSTEAD:
- Native HTML <button>, <a>, <div> for overlays
- NavBar3D from src/components/3d/NavBar3D.tsx
- Footer3D from src/components/3d/Footer3D.tsx
- Inline SVG for icons

=== DETAILEDCONTEXT REQUIREMENTS ===

Write 8000+ words covering:
1. Complete file structure with all 3D component paths
2. Color palette (HSL values) for both 3D materials and HTML overlays
3. Typography for HTML overlays (font families and sizes)
4. Scene-by-scene specifications for every page
5. R3F component details (geometries, materials, props)
6. Lighting setup for each scene
7. Animation specifications (useFrame patterns, scroll-linked)
8. Interactive behavior specifications
9. HTML overlay content (exact text for headings, descriptions, CTAs)
10. Postprocessing configuration
11. Dependencies list (three, @react-three/fiber, etc.)
12. Performance optimization (lazy loading, instancing, LOD)
13. Routing configuration (react-router-dom)
14. Production checklist (error boundaries, loading states)
15. Unique design elements specific to this business

=== FINAL VALIDATION ===

Before returning:
- Is detailedContext ONE continuous line with NO line breaks?
- Are there 8000+ words minimum?
- Are there NO references to lucide-react, @/components/ui/, Header.tsx, Footer.tsx?
- Is every scene fully specified with R3F elements?
- Is all text content REAL and SPECIFIC to this business?
- Are interactive behaviors detailed for every section?
- NO emojis anywhere?`;

      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
      const response = await openai.chat.completions.create({
        model: PLANNING_MODEL,
        messages: [
          {
            role: "user",
            content: fullPrompt
          }
        ]
      });
      const rawOutput = response.choices[0].message.content;
      console.log(rawOutput);
      if (!rawOutput) {
        throw new Error('No response from AI');
      }

      console.log('[Planning3D] Received response, parsing...');
      const blueprint = OutputParser.extractProjectBlueprint(rawOutput);

      if (!blueprint) {
        if (retryCount < MAX_RETRIES) {
          console.log(`[Planning3D] Parsing failed, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
          await new Promise(resolve => setTimeout(resolve, 1500));
          return this.generateBlueprint(requirements, retryCount + 1, projectTypeFromFrontend);
        }

        throw new Error('Failed to parse 3D blueprint after multiple attempts');
      }

      console.log('[Planning3D] Blueprint generated successfully');
      console.log(`[Planning3D] Nodes: ${blueprint.workflow.nodes.length} | Edges: ${blueprint.workflow.edges.length}`);

      blueprint.projectType = projectType;

      console.log('\n[Planning3D] Generating 3D frontend context with RAG...');
      const frontendContext = await this.generate3DFrontendContext(requirements, blueprint);
      blueprint.detailedContext = frontendContext;
      console.log(`[Planning3D] 3D context: ${frontendContext.length} chars`);

      return {
        success: true,
        data: { blueprint, rawOutput }
      };

    } catch (error: any) {
      console.error('[Planning3D] Error:', error.message);

      if (retryCount < MAX_RETRIES) {
        console.log(`[Planning3D] Error occurred, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return this.generateBlueprint(requirements, retryCount + 1, projectTypeFromFrontend);
      }

      return {
        success: false,
        error: `Failed after ${MAX_RETRIES + 1} attempts: ${error.message}`
      };
    }
  }

  static createDetailedPromptFromBlueprint(blueprint: ProjectBlueprint): string {
    return blueprint.detailedContext;
  }
}
