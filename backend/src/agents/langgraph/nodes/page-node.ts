/**
 * Page Node - Generates page components
 * Uses Mem0 for persistent context between LLM calls
 * ENHANCED: Production-level UI with full feature implementation
 */

import { WebsiteState, GeneratedFile, createRegistryEntry, generateFileContext } from '../graph-state';
import { invokeLLM, parseChirActions, extractExports, extractImports } from '../llm-utils';
import { storeFileMemory, getAllFileMemories, FileMemory } from '../memory-utils';
import { notifyFileCreated, notifyPhaseChange } from '../website-graph';
import { formatImagesForPrompt } from '../services/image.service';
import { getMemoryContext } from '../project-memory';

export async function pageNode(state: WebsiteState): Promise<Partial<WebsiteState>> {
  console.log('\n ═══════════════════════════════════════════');
  console.log(' NODE: PAGES');
  console.log(' ═══════════════════════════════════════════\n');

  // Notify phase change for streaming
  notifyPhaseChange('pages');

  const blueprint = state.blueprint;
  if (!blueprint) {
    throw new Error('No blueprint available');
  }

  const files = new Map<string, GeneratedFile>();
  const registry = new Map(state.fileRegistry);

  // Get FULL context from both registry AND Mem0
  const existingContext = generateFileContext(registry);
  const memoryContext = await getAllFileMemories(state.projectId);

  console.log(`    Memory context loaded: ${memoryContext.length} chars`);

  const is3D = state.enable3D === true;

  const systemPrompt = is3D
    ? `You are a SENIOR THREE.JS / REACT THREE FIBER ARCHITECT generating PRODUCTION-READY, ZERO-ERROR 3D page components.
You create IMMERSIVE, CINEMATIC, INTERACTIVE 3D web experiences that WIN AWARDS.
Think Bruno Simon, Midwam, Vault.xyz, Noomo Agency quality.

CRITICAL 3D CONSTRAINTS:
- NEVER import from @/components/ui/ (Button, Card, Input, Badge, SplitText, ClickSpark, TextPressure DO NOT EXIST)
- NEVER import from lucide-react
- NEVER use Tailwind UI component patterns -- this is a PURE 3D project
- Use native HTML <button>, <a>, <div> for any HTML overlays inside <Scroll html>
- All 3D scenes are placed inside <Canvas> with <ScrollControls> and <Scroll>
- Scene components are lazy-loaded and placed at Y offsets inside <Scroll>
- HTML overlays go in <Scroll html> as full-height sections
- Use framer-motion for HTML animations, NOT for 3D objects
- Import Three.js types and R3F hooks only
- Every page must have a default export
- ALL interactive HTML elements in <Scroll html> need pointer-events-auto
- Define cn inline if needed: const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

═══════════════════════════════════════════════════════════════════════════════
 FOOTER3D IS MANDATORY ON EVERY PAGE (NON-NEGOTIABLE)
═══════════════════════════════════════════════════════════════════════════════

- EVERY page MUST import Footer3D: import Footer3D from '@/components/3d/Footer3D';
- EVERY page MUST render <Footer3D /> as the LAST element inside <Scroll html>
- The footer section MUST be: <section className="w-screen"><Footer3D /></section>
- If you generate a page WITHOUT <Footer3D />, the page is INVALID and will be REJECTED
- Footer3D is placed AFTER all content sections, BEFORE closing </Scroll>

═══════════════════════════════════════════════════════════════════════════════
 NAVBAR3D IS MANDATORY ON EVERY PAGE (NON-NEGOTIABLE)
═══════════════════════════════════════════════════════════════════════════════

- EVERY page MUST import NavBar3D: import NavBar3D from '@/components/3d/NavBar3D';
- EVERY page MUST render <NavBar3D /> BEFORE the Canvas container div
- The NavBar is placed OUTSIDE the Canvas, as the first element after LoadingScreen3D opens
- Structure: <LoadingScreen3D> <NavBar3D /> <div className="fixed inset-0 ..."> <Canvas>...</Canvas> </div> </LoadingScreen3D>
- If you generate a page WITHOUT <NavBar3D />, the page is INVALID and will be REJECTED
- NavBar3D is a pure HTML glassmorphism nav bar with position:fixed, NOT a 3D component

═══════════════════════════════════════════════════════════════════════════════
 INTERACTIVE, DYNAMIC, AND UNIQUE WEBSITES (MANDATORY)
═══════════════════════════════════════════════════════════════════════════════

Every website MUST feel ALIVE and INTERACTIVE. Users should think "WOW".

INTERACTIVE ELEMENTS (use at least 5 per page):
- Hover effects on buttons: scale, glow, color shift, border animation
- Scroll-triggered animations: elements fade in, slide up, rotate as user scrolls
- Glassmorphism cards: backdrop-blur-xl, bg-white/5, border border-white/10
- Animated counters/stats that count up when scrolled into view
- Interactive buttons with ripple/pulse effects using CSS animations
- Parallax text layers that move at different speeds
- Gradient text: bg-clip-text text-transparent bg-gradient-to-r
- Floating elements with CSS animation: animate-float (keyframes translateY)
- Staggered reveal: each card/item delays slightly more than the previous

DYNAMIC PATTERNS:
- Use useState for toggles, active states, hover tracking
- Use useNavigate for working navigation buttons
- Create tabbed content, accordions, or reveal sections
- Add cursor-following effects with onMouseMove
- Implement scroll-based opacity/transform changes via framer-motion whileInView

UNIQUENESS RULES:
- NEVER repeat the same layout across pages
- Use VARIED section heights (h-screen, min-h-[80vh], min-h-[60vh], auto)
- Mix asymmetric grids, bento layouts, split-screen, overlapping elements
- Each page must have a DISTINCT visual personality while staying on-theme
- Use creative text sizing: hero text 8xl, section titles 5xl, body xl
- Alternate between centered and left-aligned content
- Add decorative elements: gradient orbs, grid overlays, noise textures, scan lines

═══════════════════════════════════════════════════════════════════════════════
 CRITICAL OUTPUT FORMAT - MANDATORY
═══════════════════════════════════════════════════════════════════════════════

You MUST wrap each file in <chirAction> tags. NEVER use markdown code blocks.
Format:

<chirAction type="file" filePath="src/pages/PageName.tsx">
// file content here
</chirAction>

Every page file MUST be wrapped in its own <chirAction> tag with the correct filePath.
NEVER use \`\`\`tsx or any markdown formatting. ONLY <chirAction> tags.
`
    : `You are a SENIOR FRONTEND ARCHITECT generating PRODUCTION-READY, ZERO-ERROR page components.

═══════════════════════════════════════════════════════════════════════════════
 ZERO ERROR TOLERANCE - MANDATORY DEFENSIVE CODING
═══════════════════════════════════════════════════════════════════════════════

EVERY page MUST follow these CRITICAL rules to prevent runtime errors:

**1. NEVER call .map() directly without null check:**
    BAD: {products.map(p => ...)}
    GOOD: {(products ?? []).map(p => ...)}

**2. ALWAYS use optional chaining:**
    BAD: {item.details.price}
    GOOD: {item?.details?.price ?? 'N/A'}

**3. ALWAYS provide defaults for props:**
    BAD: const HomePage = ({ items }) => ...
    GOOD: const HomePage = ({ items = [] }) => ...

**4. DEFINE cn() utility inline in EVERY file that uses conditional classes:**
   const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

**5. ALWAYS import useState if using state:**
   import React, { useState } from 'react';

═══════════════════════════════════════════════════════════════════════════════
 PRODUCTION-LEVEL PREMIUM UI - MANDATORY
═══════════════════════════════════════════════════════════════════════════════

**EVERY website MUST look like a $10,000 professional production site:**

1. **NO SQUARE BOXES ANYWHERE:**
   - ALL cards: rounded-xl or rounded-2xl (NEVER rounded or no rounding)
   - ALL buttons: rounded-lg or rounded-xl
   - ALL images/placeholders: rounded-xl or rounded-2xl with overflow-hidden
   - ALL modals: rounded-2xl
   - Example: className="rounded-2xl overflow-hidden shadow-lg"

2. **PREMIUM SHADOWS AND DEPTH:**
   - Cards: shadow-lg or shadow-xl
   - Hover effects: hover:shadow-2xl with transition
   - Floating elements: shadow-2xl

3. **PREMIUM ANIMATIONS (use framer-motion):**
   <motion.div
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.5, ease: "easeOut" }}
     whileHover={{ scale: 1.02, y: -4 }}
   >

4. **GRADIENT BACKGROUNDS (not flat colors):**
   - Heroes: bg-gradient-to-br from-[primary] via-[secondary] to-[accent]
   - Cards: subtle gradients or glass effects
   - Buttons: bg-gradient-to-r with hover shift

5. **CREATIVE UNIQUE LAYOUTS:**
   - Asymmetric grids, overlapping elements
   - Bento box layouts, split screens
   - Full-bleed images with text overlays
   - Floating cards with tilts

═══════════════════════════════════════════════════════════════════════════════
 WORKING BUTTONS - ALL BUTTONS MUST BE FUNCTIONAL
═══════════════════════════════════════════════════════════════════════════════

**EVERY button MUST have a working onClick handler:**

// For navigation buttons - use Link:
import { Link, useNavigate } from 'react-router-dom';
<Link to="/about">
  <Button>Learn More</Button>
</Link>

// Or useNavigate:
const navigate = useNavigate();
<Button onClick={() => navigate('/contact')}>Contact Us</Button>

// For action buttons - use useState:
const [isOpen, setIsOpen] = useState(false);
<Button onClick={() => setIsOpen(true)}>Open Modal</Button>

// For form buttons:
const [submitted, setSubmitted] = useState(false);
<Button onClick={() => setSubmitted(true)}>
  {submitted ? 'Submitted!' : 'Submit'}
</Button>

// For toggle buttons:
const [liked, setLiked] = useState(false);
<Button onClick={() => setLiked(!liked)}>
  {liked ? 'Unlike' : 'Like'}
</Button>

CRITICAL: Every button MUST do something. NO dead buttons allowed!

═══════════════════════════════════════════════════════════════════════════════
 IMAGES - USE GRADIENT PLACEHOLDERS (NO EXTERNAL URLS!)
═══════════════════════════════════════════════════════════════════════════════

**NEVER use external image URLs** - they cause CORS errors!

USE GRADIENT PLACEHOLDERS instead:

// Hero backgrounds:
  <section className="min-h-[80vh] bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900" >

// Product/Card images:
const gradients = [
    'from-indigo-500 to-purple-600',
    'from-rose-500 to-orange-500',
    'from-emerald-500 to-teal-500',
    'from-blue-500 to-cyan-500',
  ];
  <div className={
  \`h-48 bg-gradient-to-br \${gradients[index % gradients.length]}\`} />

// Avatar placeholders:
<div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
  <span className="text-white font-bold">{name?.charAt(0) ?? '?'}</span>
</div>

═══════════════════════════════════════════════════════════════════════════════
 VISUAL DESIGN RULES
═══════════════════════════════════════════════════════════════════════════════

**COLOR CONTRAST:**
- Dark backgrounds (slate-900): text-white, text-slate-100
- Light backgrounds (white): text-slate-900, text-gray-800
- NEVER use light text on light backgrounds!

**SECTION STRUCTURE:**
<section className="py-16 md:py-24 bg-white">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
    {/* Content */}
  </div>
</section>

**HERO SECTIONS:**
<section className="min-h-[80vh] flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
  <div className="container mx-auto px-4 max-w-7xl">
    <h1 className="text-4xl md:text-6xl font-bold text-white">Heading</h1>
    <p className="text-lg text-slate-300">Subheading</p>
  </div>
</section>

**CARD GRIDS (with defensive coding):**
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {(items ?? []).map((item, index) => (
    <Card key={item?.id ?? index}>
      {/* Gradient instead of image */}
      <div className={\`h-48 bg-gradient-to-br \${gradients[index % gradients.length]}\`} />
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900">{item?.title ?? 'Title'}</h3>
        <p className="text-slate-600">{item?.description ?? 'Description'}</p>
      </div>
    </Card>
  ))}
</div>

${is3D ? '' : `═══════════════════════════════════════════════════════════════════════════════
 REQUIRED IMPORTS FOR EVERY PAGE
═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowRight, Check, Star } from 'lucide-react';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

═══════════════════════════════════════════════════════════════════════════════
 PAGE CHECKLIST (Verify EVERY page has these)
═══════════════════════════════════════════════════════════════════════════════

[ ] React and useState imported
[ ] cn utility defined inline (if using conditional classes)
[ ] All props have default values
[ ] Arrays use (arr ?? []).map()
[ ] Objects use optional chaining (?.)
[ ] No external image URLs
[ ] Gradient placeholders for all images
[ ] Hero section with gradient background
[ ] Proper color contrast (text visible)
[ ] motion from framer-motion for animations
[ ] default export for the page

═══════════════════════════════════════════════════════════════════════════════
 SAMPLE PAGE PATTERN
═══════════════════════════════════════════════════════════════════════════════

CRITICAL OUTPUT FORMAT - Each file MUST use <chirAction> tags:

<chirAction type="file" filePath="src/pages/HomePage.tsx">
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowRight, Star } from 'lucide-react';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const gradients = [
  'from-indigo-500 to-purple-600',
  'from-rose-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-blue-500 to-cyan-500',
];`}

// Sample data with all properties defined
const products = [
  { id: 1, title: 'Product 1', description: 'Description 1', price: '$99' },
  { id: 2, title: 'Product 2', description: 'Description 2', price: '$149' },
  { id: 3, title: 'Product 3', description: 'Description 3', price: '$199' },
];

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section with gradient background */}
      <section className="min-h-[80vh] flex items-center bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Welcome to Our Site
          </motion.h1>
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl">
            A beautiful description with proper contrast.
          </p>
          <Button size="lg">
            Get Started <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-12">
            Our Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* DEFENSIVE CODING: use (arr ?? []).map() */}
            {(products ?? []).map((product, index) => (
              <motion.div
                key={product?.id ?? index}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                {/* Gradient placeholder instead of image */}
                <div className={\`h-48 bg-gradient-to-br \${gradients[index % gradients.length]}\`} />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900">{product?.title ?? 'Product'}</h3>
                  <p className="text-slate-600 mt-2">{product?.description ?? ''}</p>
                  <p className="text-lg font-bold text-indigo-600 mt-4">{product?.price ?? '$0'}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
</chirAction>

NEVER use markdown. ALWAYS use <chirAction> tags.

═══════════════════════════════════════════════════════════════════════════════
 CRITICAL OUTPUT FORMAT - MANDATORY
═══════════════════════════════════════════════════════════════════════════════

You MUST wrap each file in <chirAction> tags. NEVER use markdown code blocks.
Format:

<chirAction type="file" filePath="src/pages/PageName.tsx">
// file content here
</chirAction>

Every page file MUST be wrapped in its own <chirAction> tag with the correct filePath.
NEVER use \`\`\`tsx or any markdown formatting. ONLY <chirAction> tags.`;

  // Format available images for the prompt
  const imagesContext = formatImagesForPrompt(state.availableImages || []);

  // Get dynamic theme from state (generated in blueprint-node)
  const theme = state.dynamicTheme;
  const themeContext = theme ? `
═══════════════════════════════════════════════════════════════════════════════
 UNIQUE DESIGN THEME: "${theme.palette.name}" (MANDATORY - USE THESE EXACT COLORS)
═══════════════════════════════════════════════════════════════════════════════

COLOR PALETTE (USE THESE - NOT DEFAULTS):
- Primary: ${theme.palette.primary}
- Secondary: ${theme.palette.secondary}  
- Accent: ${theme.palette.accent}
- Background: ${theme.palette.background}
- Surface: ${theme.palette.surface}
- Style: ${theme.palette.style}

TYPOGRAPHY:
- Headings: "${theme.fonts.heading}" font-family
- Body: "${theme.fonts.body}" font-family

LAYOUT PATTERN: "${theme.layout.name}"
- Hero: ${theme.layout.hero}
- Sections: ${theme.layout.sections}
- Cards: ${theme.layout.cards}

ANIMATION STYLE: "${theme.animation.name}"
- Entrance: ${theme.animation.entrance} animations
- Hover: ${theme.animation.hover} effects  
- Scroll: ${theme.animation.scroll} animations
- Timing: ${theme.animation.timing}

2024-2025 TRENDS TO APPLY:
${theme.trends.map(t => `- ${t}`).join('\n')}

CRITICAL: Do NOT use default indigo/slate colors. Use the exact hex values above.
` : `
═══════════════════════════════════════════════════════════════════════════════
 DESIGN SYSTEM
═══════════════════════════════════════════════════════════════════════════════
- Primary: ${blueprint.designSystem.primaryColor}
- Secondary: ${blueprint.designSystem.secondaryColor}
- Accent: ${blueprint.designSystem.accentColor}
- Style: ${blueprint.designSystem.style}
`;

  const userPrompt = `Generate ALL page components for "${blueprint.projectName}":

${imagesContext}

${themeContext}

═══════════════════════════════════════════════════════════════════════════════
 MEMORY CONTEXT (Previously Generated Components)
═══════════════════════════════════════════════════════════════════════════════
${memoryContext}

═══════════════════════════════════════════════════════════════════════════════
 AVAILABLE COMPONENTS (IMPORT AND USE THESE)
═══════════════════════════════════════════════════════════════════════════════
${existingContext}

${is3D ? `IMPORT PATTERNS (3D PROJECT -- NO 2D UI COMPONENTS):
import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

DO NOT IMPORT: Button, Card, Input, Badge from @/components/ui/ -- THOSE FILES DO NOT EXIST
DO NOT IMPORT: lucide-react -- NOT INSTALLED` : `IMPORT PATTERNS:
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Star } from 'lucide-react';`}

═══════════════════════════════════════════════════════════════════════════════
 BLUEPRINT FEATURES TO IMPLEMENT
═══════════════════════════════════════════════════════════════════════════════
${blueprint.features.map(f => `✅ ${f.name}: ${f.description} [Priority: ${f.priority}]`).join('\n')}

ALL of these features MUST be visible and implemented in the pages!

═══════════════════════════════════════════════════════════════════════════════
 PAGES TO GENERATE
═══════════════════════════════════════════════════════════════════════════════
${blueprint.pages.map(page => `
═══ ${page.name} (src/pages/${page.name.replace(/\s+/g, '')}.tsx) ═══
Route: ${page.route}
Description: ${page.description}

REQUIRED SECTIONS (3-5 minimum):
${page.sections?.map((s, i) => `${i + 1}. ${s}`).join('\n') || '1. Hero Section\n2. Features Grid\n3. Content Section\n4. CTA Section'}

Uses components: ${is3D ? 'Canvas, ScrollControls, Scroll, Environment, EffectComposer, framer-motion' : page.components?.join(', ') || 'Button, Card, Badge'}

MUST INCLUDE:
- Responsive layout (mobile/tablet/desktop)
- High contrast text (readable on all backgrounds)
- Working images (use Unsplash URLs)
- Real content (no lorem ipsum)
- Export: export default ${page.name.replace(/\s+/g, '')};
`).join('\n')}

═══════════════════════════════════════════════════════════════════════════════
 CRITICAL REQUIREMENTS (ZERO TOLERANCE)
═══════════════════════════════════════════════════════════════════════════════
1. VISIBLE TEXT: All text must be readable. Dark bg = light text, Light bg = dark text
2. RESPONSIVE: Every element must work from 320px to 4K screens
3. WORKING IMAGES: Use provided Unsplash URLs or gradient fallbacks
4. REAL CONTENT: No placeholder text, create meaningful content for ${blueprint.projectName}
5. ALL FEATURES: Implement every feature from blueprint
6. PROPER IMPORTS: ${is3D ? 'Import 3D scenes from @/components/3d/ -- DO NOT import from @/components/ui/' : 'Import components from @/components/ui/ and @/components/features/'}
7. DEFAULT EXPORT: Each page must have export default PageName;
8. NO APPLAYOUT WRAPPER: Pages render inside AppLayout via Outlet

═══════════════════════════════════════════════════════════════════════════════
MOBILE-FIRST RESPONSIVE DESIGN (MANDATORY)
═══════════════════════════════════════════════════════════════════════════════
All pages MUST be mobile-first using these Tailwind breakpoints:
- BASE (320px+): Mobile - single column, stacked layouts
- sm (640px+): Large mobile
- md (768px+): Tablet - start 2-column
- lg (1024px+): Desktop - full layouts
- xl (1280px+): Large desktop

Example patterns to use:
- Grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Flex: flex-col md:flex-row
- Text sizes: text-3xl md:text-4xl lg:text-5xl xl:text-6xl
- Spacing: p-4 md:p-6 lg:p-8, gap-4 md:gap-6 lg:gap-8
- Container: container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl

${state.detailedContext ? `

${state.detailedContext.slice(0, 3000)}...
` : ''}

${build3DPageContext(state)}`;

  try {
    const response = await invokeLLM(systemPrompt, userPrompt, 0.7);
    const parsedFiles = parseChirActions(response);

    for (const { path, content } of parsedFiles) {
      await addFileWithMemory(files, registry, path, content, 'page', state.projectId);
    }

    console.log(`\n Page files generated: ${files.size}`);
    files.forEach((_, path) => console.log(`    ${path}`));

    return {
      files,
      fileRegistry: registry,
      currentPhase: 'page',
      messages: [`Pages created: ${files.size} files`]
    };

  } catch (error: any) {
    console.error(' Page generation failed:', error.message);
    throw error;
  }
}

async function addFileWithMemory(
  files: Map<string, GeneratedFile>,
  registry: Map<string, any>,
  path: string,
  content: string,
  phase: string,
  projectId: string
) {
  const exports = extractExports(content);
  const imports = extractImports(content);

  const file: GeneratedFile = { path, content, phase, exports, imports };
  files.set(path, file);
  registry.set(path, createRegistryEntry(file));

  // Stream file to frontend
  notifyFileCreated(file);

  // Store in Mem0
  await storeFileMemory(projectId, {
    path,
    exports,
    imports,
    type: 'page',
    phase,
    contentPreview: content.substring(0, 300)
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPLACEMENT for the build3DPageContext function in page-node.ts
// Copy this entire function to replace the existing one in page-node.ts
// ═══════════════════════════════════════════════════════════════════════════════

// Paste this REPLACEMENT function into page-node.ts, replacing the existing build3DPageContext

function build3DPageContext(state: any): string {
  if (!state.enable3D) return '';

  const memory = state.projectMemory;
  const instructions = memory?.threeDImportInstructions || '';
  const paths = memory?.threeDComponentPaths || [];
  const userPrompt = state.userPrompt || '';
  const blueprint = state.blueprint;
  const theme = state.dynamicTheme;

  // Get all generated scene components (not navbar/footer/loader)
  const uiOverlays = ['LoadingScreen3D', 'NavBar3D', 'Footer3D'];
  const scenePaths = paths.filter((p: string) =>
    !uiOverlays.some(ui => p.includes(ui))
  );

  // If no paths from memory, infer from blueprint
  if (scenePaths.length === 0) {
    const sections = blueprint?.pages?.flatMap((p: any) => p.sections || []) || [];
    const uniqueTypes = [...new Set(sections.map((s: any) => classifySection(String(s))))];
    for (const type of uniqueTypes.slice(0, 6)) {
      const name = `${capitalize(type as string)}Scene3D`;
      scenePaths.push(`src/components/3d/${name}.tsx`);
    }
    // Always have hero
    if (!scenePaths.some((p: string) => p.includes('Hero'))) {
      scenePaths.unshift('src/components/3d/HeroScene3D.tsx');
    }
  }

  const sceneImports = scenePaths.map((p: string) => {
    const name = p.split('/').pop()?.replace('.tsx', '') || '';
    const importPath = '@/' + p.replace(/^src\//, '').replace('.tsx', '');
    return `const ${name} = lazy(() => import('${importPath}'));`;
  }).join('\n');

  const sceneNames = scenePaths.map((p: string) => p.split('/').pop()?.replace('.tsx', '') || '');

  // Build scroll section list
  const scrollSections = sceneNames.map((name: string, i: number) => {
    if (i === 0) return `                <${name} />`;
    return `                <group position={[0, ${i * -10}, 0]}>\n                  <${name} />\n                </group>`;
  }).join('\n');

  const numPages = Math.max(sceneNames.length + 1, 4);

  // Color references from theme
  const primary = theme?.palette?.primary || '#f472b6';
  const secondary = theme?.palette?.secondary || '#818cf8';
  const accent = theme?.palette?.accent || '#22d3ee';
  const bg = theme?.palette?.background || '#050505';

  return `
═══════════════════════════════════════════════════════════════════════════════
 3D PAGE ARCHITECTURE — MAKE EACH PAGE STUNNING AND UNIQUE
═══════════════════════════════════════════════════════════════════════════════

BUSINESS: ${userPrompt}
THEME: ${theme?.palette?.name || 'Custom'} | Primary: ${primary} | Accent: ${accent}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY ARCHITECTURE RULES (violating = invalid page)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. EVERY page: <LoadingScreen3D> → <NavBar3D /> → <Canvas> wrapper → <Footer3D />
2. EVERY page owns ONE Canvas with ScrollControls
3. Scene components are fragments inside <Scroll>
4. HTML content goes in <Scroll html> sections
5. EffectComposer inside Canvas AFTER ScrollControls
6. EVERY button needs onClick (useNavigate or state toggle)
7. NO lucide-react | NO @/components/ui/* 
8. pointer-events-auto on ALL interactive HTML elements

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY IMPORTS (every page)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import React, { Suspense, lazy, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import LoadingScreen3D from '@/components/3d/LoadingScreen3D';
import NavBar3D from '@/components/3d/NavBar3D';
import Footer3D from '@/components/3d/Footer3D';
import { useNavigate } from 'react-router-dom';
const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(' ');

// LAZY-LOAD ALL SCENE COMPONENTS:
${sceneImports}

${instructions}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE TEMPLATE (exact structure required)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PageName = () => {
  const navigate = useNavigate();

  return (
    <LoadingScreen3D>
      <NavBar3D />
      
      <div className="fixed inset-0 w-full h-screen bg-[${bg}] overflow-hidden">
        <Suspense fallback={<div className="w-full h-full" style={{background:'${bg}'}} />}>
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.5]}>
            <color attach="background" args={['${bg}']} />
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
            
            <ScrollControls pages={${numPages}} damping={0.1}>
              <Scroll>
                {/* SCENE COMPONENTS AT Y OFFSETS */}
${scrollSections}
              </Scroll>
              
              <Scroll html>
                {/* ═══ SECTION 1: HERO ═══ */}
                <section className="h-screen w-screen flex items-center justify-center relative">
                  <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center px-4 max-w-5xl pointer-events-auto"
                  >
                    {/* GRADIENT HEADLINE */}
                    <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-none tracking-tighter">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-[${primary}] to-[${accent}]">
                        HERO HEADING
                      </span>
                    </h1>
                    
                    <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                      Compelling subtitle that speaks to the target audience with real copy.
                    </p>
                    
                    {/* CTA BUTTON — must have onClick */}
                    <div className="flex gap-4 justify-center flex-wrap">
                      <button
                        onClick={() => navigate('/next-page')}
                        className="group relative px-10 py-5 bg-[${primary}] rounded-xl text-white font-bold text-lg hover:scale-105 transition-all duration-500 hover:shadow-[0_0_40px_${primary}66] overflow-hidden"
                      >
                        <span className="relative z-10">Primary CTA</span>
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      
                      <button
                        onClick={() => navigate('/another-page')}
                        className="px-10 py-5 backdrop-blur-xl bg-white/5 border border-white/20 rounded-xl text-white font-bold text-lg hover:bg-white/10 hover:scale-105 transition-all duration-500"
                      >
                        Secondary CTA
                      </button>
                    </div>
                    
                    {/* SCROLL HINT */}
                    <div className="mt-16 flex flex-col items-center gap-2 opacity-40">
                      <span className="text-xs uppercase tracking-[0.3em] text-white">Scroll to explore</span>
                      <div className="w-px h-12 bg-gradient-to-b from-white to-transparent animate-bounce" />
                    </div>
                  </motion.div>
                </section>
                
                {/* ═══ SECTION 2: FEATURES (staggered reveal) ═══ */}
                <section className="h-screen w-screen flex items-center justify-center px-4">
                  <div className="max-w-6xl w-full pointer-events-auto">
                    <motion.h2
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      viewport={{ once: true }}
                      className="text-5xl md:text-6xl font-black text-white text-center mb-4 tracking-tight"
                    >
                      Section Heading
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="text-white/50 text-center text-lg mb-16"
                    >
                      Supporting description text
                    </motion.p>
                    
                    {/* GLASSMORPHISM FEATURE CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { title: 'Feature One', desc: 'Real description of this feature', stat: '10x', icon: '◈' },
                        { title: 'Feature Two', desc: 'Real description of this feature', stat: '99%', icon: '◉' },
                        { title: 'Feature Three', desc: 'Real description of this feature', stat: '24/7', icon: '◊' },
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 50 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: i * 0.15 }}
                          viewport={{ once: true }}
                          whileHover={{ scale: 1.03, y: -4 }}
                          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/8 hover:border-[${primary}]/30 transition-all duration-500 cursor-pointer group"
                        >
                          <div className="text-4xl mb-4 text-[${accent}]">{item.icon}</div>
                          <div className="text-4xl font-black text-[${primary}] mb-2">{item.stat}</div>
                          <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                          <p className="text-white/50 leading-relaxed">{item.desc}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>
                
                {/* ═══ ADD MORE SECTIONS based on blueprint content ═══ */}
                {/* Use h-screen w-screen for each section */}
                {/* EVERY section must have real content, not placeholders */}
                {/* Apply motion.div whileInView animations to ALL content */}
                {/* Use glassmorphism: backdrop-blur-xl bg-white/5 border border-white/10 */}
                
                {/* ═══ FINAL: FOOTER (MANDATORY - LAST ELEMENT) ═══ */}
                <section className="w-screen">
                  <Footer3D />
                </section>
              </Scroll>
            </ScrollControls>
            
            <Environment preset="city" />
            
            <EffectComposer>
              <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
              <Vignette eskil={false} offset={0.1} darkness={0.75} />
              <Noise opacity={0.04} />
            </EffectComposer>
          </Canvas>
        </Suspense>
      </div>
    </LoadingScreen3D>
  );
};

export default PageName;

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN SYSTEM FOR THIS PROJECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Colors:
  Background: bg-[${bg}] (also: background="${bg}" on Canvas color)
  Primary: text-[${primary}] / bg-[${primary}] / shadow-[${primary}]
  Secondary: text-[${secondary}] / bg-[${secondary}]
  Accent: text-[${accent}] (for highlights and CTAs)
  Glass: backdrop-blur-xl bg-white/5 border border-white/10
  Glass Hover: bg-white/10 border-white/20

Typography:
  Hero: text-6xl md:text-8xl font-black tracking-tighter
  Section title: text-4xl md:text-6xl font-black tracking-tight
  Body: text-lg text-white/60 leading-relaxed
  Caption: text-xs uppercase tracking-[0.3em] text-white/40
  Gradient text: bg-clip-text text-transparent bg-gradient-to-r from-white to-[${accent}]

Button styles:
  Primary: bg-[${primary}] rounded-xl hover:shadow-[0_0_40px_${primary}66] hover:scale-105
  Ghost: backdrop-blur-xl bg-white/5 border border-white/20 rounded-xl hover:bg-white/10
  Outline: border border-[${primary}] text-[${primary}] hover:bg-[${primary}]/10

Animation patterns:
  Card reveal: initial={{ opacity:0, y:50 }} whileInView={{ opacity:1, y:0 }}
  Stagger delay: transition={{ delay: index * 0.15 }}
  Viewport: viewport={{ once: true, margin: '-50px' }}
  Hover lift: whileHover={{ scale: 1.03, y: -4 }}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFICATION CHECKLIST (every page MUST pass before output)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] LoadingScreen3D wraps the entire return
[ ] NavBar3D is first element inside LoadingScreen3D (before Canvas)
[ ] Footer3D is LAST element inside <Scroll html>
[ ] Every button has onClick handler
[ ] pointer-events-auto on all interactive elements inside Scroll html
[ ] EffectComposer is inside Canvas
[ ] All text is real brand copy (no lorem ipsum, no placeholders)
[ ] motion.div with whileInView on every content section
[ ] Glassmorphism cards used for feature grids
[ ] Gradient text on hero headline
[ ] default export at bottom of file

${instructions ? `\n${instructions}` : ''}
`;
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
  if (lower.match(/stat|number|metric|counter|achievement/)) return 'stats';
  if (lower.match(/process|how|step|workflow/)) return 'process';
  return 'features';
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export { build3DPageContext };
