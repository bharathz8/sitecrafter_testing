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

function build3DPageContext(state: WebsiteState): string {
  if (!state.enable3D) return '';

  const memory = state.projectMemory;
  const instructions = memory?.threeDImportInstructions || '';
  const paths = memory?.threeDComponentPaths || [];

  const brainContext = memory ? getMemoryContext(memory) : '';

  const hasLoader = true;
  const hasNavBar = true;
  const hasFooter = true;

  const scenePaths = paths.filter(p =>
    !p.includes('LoadingScreen3D') && !p.includes('NavBar3D') && !p.includes('Footer3D')
  );

  if (scenePaths.length === 0) {
    const defaultScenes = ['HeroScene3D', 'FeaturesScene3D', 'ShowcaseScene3D', 'BackgroundScene3D'];
    for (const s of defaultScenes) {
      scenePaths.push(`src/components/3d/${s}.tsx`);
    }
  }

  const sceneImports = scenePaths.map(p => {
    const name = p.split('/').pop()?.replace('.tsx', '') || '';
    const importPath = '@/' + p.replace(/^src\//, '').replace('.tsx', '');
    return `const ${name} = lazy(() => import('${importPath}'));`;
  }).join('\n');

  const sceneNames = scenePaths.map(p => p.split('/').pop()?.replace('.tsx', '') || '');

  const directImports = [
    `import LoadingScreen3D from '@/components/3d/LoadingScreen3D';`,
    `import NavBar3D from '@/components/3d/NavBar3D';`,
    `import Footer3D from '@/components/3d/Footer3D';`,
  ].join('\n');

  const scrollScenes = sceneNames.map((name, i) => {
    if (i === 0) return `                <${name} />`;
    return `                <group position={[0, ${i * -10}, 0]}>\n                  <${name} />\n                </group>`;
  }).join('\n');

  const numPages = Math.max(sceneNames.length + 1, 4);

  return `

=== PURE 3D PAGE ARCHITECTURE ===

=== MANDATORY RULES (READ FIRST -- VIOLATION = INVALID PAGE) ===

1. EVERY page MUST import NavBar3D and render <NavBar3D /> OUTSIDE Canvas (before the fixed div)
2. EVERY page MUST import Footer3D and render <Footer3D /> INSIDE <Scroll html> as the ABSOLUTE LAST section before </Scroll> closes
3. EVERY page MUST import LoadingScreen3D and wrap the entire return in <LoadingScreen3D>
4. Page owns the SINGLE Canvas -- scenes do NOT have their own Canvas
5. Scene components are placed inside <Scroll> at Y offsets: 0, -10, -20, -30...
6. HTML text overlays go in <Scroll html> as full-height sections with motion.div
7. EffectComposer goes INSIDE Canvas, AFTER ScrollControls (not inside scenes)
8. NEVER import from lucide-react
9. NEVER import from @/components/ui/ (SplitText, ClickSpark, TextPressure, Button, Card DO NOT EXIST)
10. NEVER use disableNormalPass -- use enableNormalPass={false} if needed
11. pointer-events-auto on ALL interactive HTML elements inside Scroll html
12. Each HTML section: h-screen w-screen, centered content with motion.div animations

=== FOOTER3D IS NON-NEGOTIABLE ===

You MUST include this EXACT code as the LAST element inside <Scroll html>:

  <section className="w-screen">
    <Footer3D />
  </section>

If <Footer3D /> is missing from ANY page, the page is INVALID and will be REJECTED.
Check EVERY page you generate: does it end with <Footer3D />? If not, ADD IT.

=== REQUIRED IMPORTS ===

import React, { Suspense, lazy, useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
${directImports}
import { useNavigate } from 'react-router-dom';

${sceneImports}

${instructions}

=== INTERACTIVITY REQUIREMENTS (minimum 5 per page) ===

Every page MUST have interactive, dynamic elements that ENGAGE the user:

1. HOVER EFFECTS: Every button/card must respond to hover with scale, glow, or color shift
   className="... hover:scale-105 hover:shadow-[0_0_30px_rgba(accent,0.3)] transition-all duration-500"

2. SCROLL ANIMATIONS: Use framer-motion whileInView for every section:
   <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>

3. STAGGERED REVEALS: Cards/items appear one after another:
   {items.map((item, i) => (
     <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15, duration: 0.6 }} viewport={{ once: true }}>
   ))}

4. GLASSMORPHISM CARDS: backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl

5. GRADIENT TEXT: bg-clip-text text-transparent bg-gradient-to-r from-[primary] via-[secondary] to-[accent]

6. ANIMATED COUNTERS: Use useState + useEffect to count up numbers on scroll

7. CURSOR EFFECTS: pointer-events-auto, hover:cursor-pointer, interactive button styles

8. DECORATIVE ELEMENTS: Gradient orbs (absolute, rounded-full, blur-[120px], opacity-20)

=== PAGE STRUCTURE (follow this EXACTLY) ===

const Page = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);

  return (
    ${hasLoader ? '<LoadingScreen3D>' : ''}
      ${hasNavBar ? '<NavBar3D />' : ''}

      <div className="fixed inset-0 w-full h-screen bg-black overflow-hidden">
        <Suspense fallback={<div className="w-full h-full bg-black" />}>
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.5]}>
            <color attach="background" args={['#050505']} />
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />

            <ScrollControls pages={${numPages}} damping={0.1}>
              <Scroll>
${scrollScenes}
              </Scroll>

              <Scroll html>
                {/* HERO SECTION */}
                <section className="h-screen w-screen flex items-center justify-center">
                  <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} viewport={{ once: true }} className="text-center px-4 pointer-events-auto">
                    <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tighter">HERO TITLE</h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">Hero subtitle text</p>
                    <button onClick={() => navigate('/next')} className="group relative px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white font-bold hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                      <span>Get Started</span>
                    </button>
                  </motion.div>
                </section>

                {/* FEATURE SECTIONS with glassmorphism cards and staggered animations */}
                <section className="h-screen w-screen flex items-center justify-center px-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl pointer-events-auto">
                    {[1,2,3].map((_, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15, duration: 0.6 }} viewport={{ once: true }}
                        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] transition-all duration-500 cursor-pointer"
                      >
                        <h3 className="text-2xl font-bold text-white mb-3">Feature Title</h3>
                        <p className="text-white/60">Description text</p>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* MORE SECTIONS -- at least 2 more with DIFFERENT layouts */}

                {/* === FOOTER (MANDATORY -- MUST BE THE LAST ELEMENT) === */}
                <section className="w-screen">
                  <Footer3D />
                </section>
              </Scroll>
            </ScrollControls>

            <Environment preset="city" />

            <EffectComposer>
              <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
              <Vignette eskil={false} offset={0.1} darkness={0.8} />
              <Noise opacity={0.04} />
            </EffectComposer>
          </Canvas>
        </Suspense>
      </div>
    </LoadingScreen3D>
  );
};

=== FINAL VERIFICATION CHECKLIST (check EVERY page before submitting) ===

[ ] Does the page import Footer3D from '@/components/3d/Footer3D'?
[ ] Does the page render <Footer3D /> as the LAST section inside <Scroll html>?
[ ] Does the page import and render <NavBar3D />?
[ ] Does the page import and wrap with <LoadingScreen3D>?
[ ] Does the page have at least 5 interactive elements (hover, scroll animation, etc.)?
[ ] Does the page use motion.div with whileInView for section animations?
[ ] Does the page use glassmorphism cards (backdrop-blur, bg-white/5, border-white/10)?
[ ] Does the page have gradient text or decorative gradient elements?
[ ] Does every button have a working onClick handler?
[ ] Does the page export default PageName?

If ANY checkbox is NO, FIX IT before outputting the page.

${brainContext ? `PROJECT BRAIN CONTEXT:\n${brainContext}` : ''}
`;
}
