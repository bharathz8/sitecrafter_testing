import type { PlanningResponse, ProjectBlueprint } from '../types/planning.types';
// [DISABLED] Old RAG-based component selection -- replaced by per-request crawl in context-3d-node
// import { UI3DService } from './ui-3d.service';
import { DynamicDesignTheme, formatThemeForPrompt } from './dynamic-trends.service';
import OpenAI from "openai";

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
].filter(k => k && k.length > 0) as string[];

let keyIdx = Math.floor(Math.random() * Math.max(apiKeys.length, 1));

function getClient(): OpenAI {
  const key = apiKeys[keyIdx % Math.max(apiKeys.length, 1)] || process.env.gemini;
  return new OpenAI({
    apiKey: key as string,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  });
}

function rotateKey(): void {
  if (apiKeys.length > 0) {
    keyIdx = (keyIdx + 1) % apiKeys.length;
  }
}

const PLANNING_MODEL = "gemini-3-flash-preview";

export class Planning3DService {

  private static generate3DSystemPrompt(): string {
    return `You are a world-class 3D web experience architect specializing in React Three Fiber, Three.js, and Drei. You create CINEMATIC, IMMERSIVE, INTERACTIVE 3D websites that win Awards, FWA, and CSS Design Awards.

=== CORE MISSION ===
Create an inspiring, ultra-detailed UI/UX blueprint for a full 3D React website. The user must feel like they are exploring a living, breathing digital world.
Every pixel must feel alive. Every scroll, hover, and click must trigger a satisfying visual response. This is not a standard website — it is an experience.

=== OUTPUT FORMAT ===
Return ONLY a rich Markdown document describing the website's flow, sections, features, colors, and 3D interactions.
DO NOT output JSON. Focus entirely on the creative direction, narrative, and exact mechanics.

Your structure MUST visually mirror this example format:
Build a jaw-dropping, fully interactive 3D React website for "[Project Name]"
Stack: React 18 + Vite, Three.js, @react-three/fiber, @react-three/drei, Framer Motion, GSAP, Tailwind CSS

👤 USER STORIES & INTERACTIONS

🔲 LOADING SCREEN
User Story: "..."
- Visuals: ...
- Interaction: ...

🖱️ GLOBAL CURSOR
User Story: "..."
- Mechanics: ...

🌠 PERSISTENT BACKGROUND CANVAS
User Story: "..."
- 3D Setup: ...

🏠 SECTION 1 — HERO
User Story: "..."
- 3D Scene: ...
- UI Overlay: ...

✨ SECTION 2 — FEATURES
User Story: "..."
- Interaction Flow: ...

[ADD AS MANY SECTIONS AS NEEDED]

🎨 GLOBAL DESIGN TOKENS
- Primary: ...
- Background: ...
- Typography: ...

⚙️ PERFORMANCE RULES
- Frameworks ...

📱 RESPONSIVE BEHAVIOR
- Breakpoints ...

CRITICAL: Make your response highly specific to the exact business requested in the prompt. Expand on the exact 3D concepts, shaders, and materials. DO NOT output JSON.`;
  }

  static async generateBlueprint(
    requirements: string,
    retryCount: number = 0,
    projectTypeFromFrontend?: 'frontend' | 'backend' | 'fullstack',
    sharedTheme?: DynamicDesignTheme
  ): Promise<PlanningResponse> {
    const MAX_RETRIES = 3;

    try {
      console.log(`\n[Planning3D] PROJECT ANALYSIS:`);
      console.log(`  Type: 3D FRONTEND [Pure 3D Mode]`);
      
      if (sharedTheme) {
        console.log(`  Theme: ${sharedTheme.palette.name} (Shared)`);
      }
      
      console.log(`  Generating immersive 3D text blueprint (attempt ${retryCount + 1}/${MAX_RETRIES + 1})...`);

      const themeContext = sharedTheme ? `\n\nDESIGN SYSTEM CONTEXT:\n${formatThemeForPrompt(sharedTheme)}` : '';
      const systemPrompt = this.generate3DSystemPrompt();
      const userPrompt = `Create a PURE 3D FRONTEND project UI/UX plan for:

"${requirements}"
${themeContext}

Follow the layout pattern from the system instructions. Generate an inspiring, detailed document. DO NOT JSON.`;

      const client = getClient();
      const response = await client.chat.completions.create({
        model: PLANNING_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      });

      const rawOutput = response.choices[0]?.message?.content || "";
      if (!rawOutput) {
        throw new Error('No response from AI');
      }

      console.log('[Planning3D] Blueprint text generated successfully. Length:', rawOutput.length);

      let projectName = "AuroraForge 3D Project";
      const nameMatch = rawOutput.match(/for\s+"([^"]+)"/) || rawOutput.match(/for\s+'([^']+)'/) || rawOutput.match(/for\s+([^—]+)—/);
      if (nameMatch && nameMatch[1]) {
        projectName = nameMatch[1].trim();
      }

      // [DISABLED] Old RAG-based component selection -- replaced by per-request crawl in context-3d-node
      // console.log('\n[Planning3D] Passing newly generated Blueprint UX/UI Plan to UI3DService for RAG...');
      // const ragSelection = await UI3DService.selectComponents(rawOutput);

      const finalDetailedContext = rawOutput;
      // if (ragSelection.selectedChunks.length > 0) {
      //   finalDetailedContext += "\n\n" + ragSelection.formattedForPrompt;
      //   console.log(`[Planning3D] Added ${ragSelection.selectedChunks.length} RAG chunks from ${ragSelection.queryCount} queries`);
      // }

      const blueprint: ProjectBlueprint = {
        projectName: projectName,
        description: "A highly interactive 3D frontend experience.",
        techStack: {
          frontend: ["React", "Three.js", "@react-three/fiber", "@react-three/drei", "Tailwind CSS"],
          backend: [],
          database: [],
          external: []
        },
        features: ["3D Hero", "Interactive Models", "Scroll Animations", "Postprocessing Effects"],
        workflow: { nodes: [], edges: [] },
        detailedContext: finalDetailedContext,
        projectType: 'frontend',
      };

      return {
        success: true,
        data: { blueprint, rawOutput: finalDetailedContext }
      };

    } catch (error: any) {
      console.error('[Planning3D] Error:', error.message);
      rotateKey();

      if (retryCount < MAX_RETRIES) {
        console.log(`[Planning3D] Error occurred, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return this.generateBlueprint(requirements, retryCount + 1, projectTypeFromFrontend, sharedTheme);
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
