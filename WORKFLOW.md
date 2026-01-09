# SiteCrafter LangGraph Workflow - Step-by-Step Guide

## Complete Flow: From Prompt to Generated Website

This document explains the entire code generation workflow, including every file involved and what each does.

---

## High-Level Flow Diagram

```
USER PROMPT
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (AgentBuilder.tsx)                   │
│  1. User enters prompt                                           │
│  2. Sends POST to /chat/langgraph/stream                        │
│  3. Receives SSE stream of files                                 │
│  4. Mounts files to WebContainer                                 │
│  5. Starts dev server for preview                                │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (index.ts)                            │
│  1. Receives prompt + projectType                                │
│  2. Creates SSE connection                                       │
│  3. Calls generateWebsite() from LangGraph                       │
│  4. Streams files back as they're generated                      │
│  5. Saves project to MongoDB                                     │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│              LANGGRAPH WEBSITE GENERATOR                         │
│  website-graph.ts orchestrates 7 nodes:                          │
│                                                                   │
│  Blueprint → Structure → Core → Components → Pages → Validation  │
│                                                    │              │
│                                                    ├─► END        │
│                                                    │              │
│                                              [errors?]            │
│                                                    │              │
│                                                    ▼              │
│                                                 Repair ───────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: User Enters Prompt

**File**: `frontend/src/pages/AgentBuilder.tsx`

When user types a prompt like "Create an e-commerce website for jewelry":

```typescript
// User clicks "Generate" button
const handleSubmit = async (prompt: string) => {
    setIsStreaming(true);
    addMessage({ role: 'user', content: prompt });
    
    // Start SSE connection to backend
    const response = await fetch(`${BACKEND_URL}/chat/langgraph/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            prompt, 
            projectType: 'frontend',
            sessionId: getSessionId()
        })
    });
    
    // Process streaming response
    const reader = response.body.getReader();
    // ... handle streaming files
};
```

---

## Step 2: Backend Receives Request

**File**: `backend/src/index.ts`

The `/chat/langgraph/stream` endpoint handles the request:

```typescript
app.post("/chat/langgraph/stream", async (req: Request, res: Response) => {
    const { prompt, projectType = 'frontend', sessionId, userId } = req.body;
    
    // Set SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Create project in MongoDB
    const project = new Project({
        userId,
        sessionId,
        name: 'Generating...',
        prompt,
        files: [],
        status: 'generating'
    });
    await project.save();
    
    // Execute LangGraph with streaming callbacks
    const result = await generateWebsite(
        prompt,
        projectType,
        // onFileGenerated callback - streams each file
        (file: GeneratedFile) => {
            res.write(`data: ${JSON.stringify({ 
                type: 'file', 
                file: { path: file.path, content: file.content }
            })}\n\n`);
        },
        // onPhaseChange callback - streams phase updates
        (phase: string) => {
            res.write(`data: ${JSON.stringify({ type: 'phase', phase })}\n\n`);
        }
    );
    
    // Update project in MongoDB
    project.files = Array.from(result.files.values()).map(f => ({
        path: f.path,
        content: f.content
    }));
    project.status = 'complete';
    await project.save();
    
    res.write(`data: ${JSON.stringify({ type: 'complete', projectId: project._id })}\n\n`);
    res.end();
});
```

---

## Step 3: LangGraph Initialization

**File**: `backend/src/agents/langgraph/website-graph.ts`

The `generateWebsite()` function initializes and runs the graph:

```typescript
export async function generateWebsite(
    userPrompt: string,
    projectType: 'frontend' | 'backend' | 'fullstack' = 'frontend',
    onFileGenerated?: (file: GeneratedFile) => void,
    onPhaseChange?: (phase: string) => void
): Promise<{ files: Map<string, GeneratedFile>; errors: any[]; messages: string[] }> {
    
    // Set up global callbacks for streaming
    setFileCallback(onFileGenerated || null);
    setPhaseCallback(onPhaseChange || null);
    
    // Initialize state
    const initialState = {
        userPrompt,
        projectType,
        blueprint: null,
        files: new Map(),
        fileRegistry: new Map(),
        errors: [],
        iterationCount: 0,
        currentPhase: 'init',
        isComplete: false,
        messages: []
    };
    
    // Run the compiled graph
    const result = await websiteGraph.invoke(initialState);
    
    return {
        files: result.files,
        errors: result.errors,
        messages: result.messages
    };
}
```

---

## Step 4: Graph Structure

**File**: `backend/src/agents/langgraph/website-graph.ts`

The graph is built with nodes and edges:

```typescript
function buildGraph() {
    const workflow = new StateGraph(WebsiteStateAnnotation)
        // Add all nodes
        .addNode('blueprint_step', blueprintNode)
        .addNode('structure_step', structureNode)
        .addNode('core_step', coreNode)
        .addNode('components_step', componentNode)
        .addNode('pages_step', pageNode)
        .addNode('validation_step', validationNode)
        .addNode('repair_step', repairNode)
        
        // Linear flow
        .addEdge('__start__', 'blueprint_step')
        .addEdge('blueprint_step', 'structure_step')
        .addEdge('structure_step', 'core_step')
        .addEdge('core_step', 'components_step')
        .addEdge('components_step', 'pages_step')
        .addEdge('pages_step', 'validation_step')
        
        // Conditional edge from validation
        .addConditionalEdges('validation_step', (state) => {
            if (state.errors.length === 0) return 'end';
            if (state.iterationCount >= 3) return 'end';
            return 'repair_step';
        }, {
            'repair_step': 'repair_step',
            'end': END
        })
        
        // Repair loops back to validation
        .addEdge('repair_step', 'validation_step');
    
    return workflow.compile();
}
```

---

## Step 5: Blueprint Node Execution

**File**: `backend/src/agents/langgraph/nodes/blueprint-node.ts`

First node generates the project blueprint using PlanningService:

```typescript
export async function blueprintNode(state: WebsiteState): Promise<Partial<WebsiteState>> {
    notifyPhaseChange('blueprint');
    console.log('📋 BLUEPRINT NODE: Generating project blueprint...');
    
    // Use PlanningService for intelligent planning
    const planningResponse = await PlanningService.generateBlueprint(
        state.userPrompt,
        0,  // retryCount
        state.projectType
    );
    
    // Extract pages, components, design system from context
    const pages = extractPagesFromContext(planningResponse.detailedContext, features);
    const components = extractComponentsFromContext(planningResponse.detailedContext);
    const designSystem = extractDesignSystem(planningResponse.detailedContext);
    
    const blueprint: ProjectBlueprint = {
        projectName: planningResponse.blueprint.projectName,
        description: planningResponse.blueprint.description,
        features: planningResponse.blueprint.features,
        pages,
        components,
        designSystem,
        dependencies: { ...STANDARD_DEPENDENCIES }
    };
    
    return {
        blueprint,
        detailedContext: planningResponse.detailedContext,
        currentPhase: 'blueprint',
        messages: [`Blueprint generated: ${blueprint.projectName}`]
    };
}
```

**What PlanningService Does** (`backend/src/services/planning-fixed.service.ts`):

1. Analyzes project requirements
2. Calls Gemini to generate feature ideas
3. Plans page structure and routes
4. Identifies required components
5. Creates design system (colors, fonts)
6. Returns 8000+ word detailed context

---

## Step 6: Structure Node

**File**: `backend/src/agents/langgraph/nodes/structure-node.ts`

Generates project configuration files:

```typescript
export async function structureNode(state: WebsiteState): Promise<Partial<WebsiteState>> {
    notifyPhaseChange('structure');
    
    const files = new Map<string, GeneratedFile>();
    const fileRegistry = new Map<string, FileRegistryEntry>();
    
    // Generate package.json
    const packageJson = generatePackageJson(state.blueprint!);
    files.set('package.json', {
        path: 'package.json',
        content: packageJson,
        phase: 'structure',
        exports: [],
        imports: []
    });
    notifyFileCreated(files.get('package.json')!);
    
    // Generate vite.config.ts
    files.set('vite.config.ts', { ... });
    
    // Generate tailwind.config.js
    files.set('tailwind.config.js', { ... });
    
    // Generate tsconfig.json, postcss.config.js, index.html
    // ...
    
    return { files, fileRegistry, currentPhase: 'structure' };
}
```

**Files Generated**:
- `package.json`
- `vite.config.ts`
- `tailwind.config.js`
- `postcss.config.js`
- `tsconfig.json`
- `index.html`

---

## Step 7: Core Node

**File**: `backend/src/agents/langgraph/nodes/core-node.ts`

Generates essential React entry files:

```typescript
export async function coreNode(state: WebsiteState): Promise<Partial<WebsiteState>> {
    notifyPhaseChange('core');
    
    const files = new Map<string, GeneratedFile>();
    
    // Generate src/main.tsx (entry point)
    const mainTsx = generateMainTsx(state.blueprint!);
    files.set('src/main.tsx', {
        path: 'src/main.tsx',
        content: mainTsx,
        phase: 'core',
        exports: [],
        imports: ['React', 'ReactDOM', 'App']
    });
    notifyFileCreated(files.get('src/main.tsx')!);
    
    // Generate src/App.tsx (root component with router)
    const appTsx = await generateAppTsx(state.blueprint!);
    files.set('src/App.tsx', { ... });
    
    // Generate src/index.css (TailwindCSS + custom styles)
    const indexCss = generateIndexCss(state.blueprint!.designSystem);
    files.set('src/index.css', { ... });
    
    // Generate src/lib/utils.ts (cn helper)
    files.set('src/lib/utils.ts', { ... });
    
    return { files, currentPhase: 'core' };
}
```

**Files Generated**:
- `src/main.tsx`
- `src/App.tsx`
- `src/index.css`
- `src/lib/utils.ts`

---

## Step 8: Component Node

**File**: `backend/src/agents/langgraph/nodes/component-node.ts`

Generates all UI and feature components using LLM:

```typescript
export async function componentNode(state: WebsiteState): Promise<Partial<WebsiteState>> {
    notifyPhaseChange('components');
    
    const files = new Map<string, GeneratedFile>();
    const components = state.blueprint!.components;
    
    // Batch generate components by type
    const uiComponents = components.filter(c => c.type === 'ui');
    const layoutComponents = components.filter(c => c.type === 'layout');
    const featureComponents = components.filter(c => c.type === 'feature');
    
    // Generate UI components (Button, Card, Badge, etc.)
    for (const component of uiComponents) {
        const content = await generateComponentWithLLM(component, state);
        const path = `src/components/ui/${component.name}.tsx`;
        files.set(path, {
            path,
            content,
            phase: 'components',
            exports: [component.name],
            imports: extractImports(content)
        });
        notifyFileCreated(files.get(path)!);
    }
    
    // Generate Layout components (Header, Footer, AppLayout)
    for (const component of layoutComponents) { ... }
    
    // Generate Feature components (Hero, ProductCard, etc.)
    for (const component of featureComponents) { ... }
    
    return { files, currentPhase: 'components' };
}
```

**Files Generated** (example):
- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Badge.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/features/Hero.tsx`
- `src/components/features/ProductCard.tsx`

---

## Step 9: Page Node

**File**: `backend/src/agents/langgraph/nodes/page-node.ts`

Generates page components that use the created components:

```typescript
export async function pageNode(state: WebsiteState): Promise<Partial<WebsiteState>> {
    notifyPhaseChange('pages');
    
    const files = new Map<string, GeneratedFile>();
    const pages = state.blueprint!.pages;
    
    // Generate file registry context for LLM
    const fileContext = generateFileContext(state.fileRegistry);
    
    for (const page of pages) {
        const prompt = `
            Generate a React page component for: ${page.name}
            Route: ${page.route}
            Description: ${page.description}
            Sections: ${page.sections.join(', ')}
            
            AVAILABLE COMPONENTS (you MUST use these):
            ${fileContext}
            
            Use the existing components from the imports above.
        `;
        
        const content = await generateWithLLM(prompt);
        const path = `src/pages/${page.name}.tsx`;
        files.set(path, {
            path,
            content,
            phase: 'pages',
            exports: [page.name],
            imports: extractImports(content)
        });
        notifyFileCreated(files.get(path)!);
    }
    
    return { files, currentPhase: 'pages' };
}
```

**Files Generated** (example):
- `src/pages/HomePage.tsx`
- `src/pages/AboutPage.tsx`
- `src/pages/ProductsPage.tsx`
- `src/pages/ContactPage.tsx`
- `src/pages/NotFoundPage.tsx`

---

## Step 10: Validation Node

**File**: `backend/src/agents/langgraph/nodes/validation-node.ts`

Validates all generated files for errors:

```typescript
export async function validationNode(state: WebsiteState): Promise<Partial<WebsiteState>> {
    notifyPhaseChange('validation');
    
    const errors: ValidationError[] = [];
    
    for (const [path, file] of state.files) {
        // Check for missing imports
        const missingImports = findMissingImports(file, state.fileRegistry);
        errors.push(...missingImports);
        
        // Check for syntax errors
        const syntaxErrors = checkSyntax(file.content);
        errors.push(...syntaxErrors);
        
        // Check for missing exports
        const exportErrors = validateExports(file, state.fileRegistry);
        errors.push(...exportErrors);
    }
    
    console.log(`Validation found ${errors.length} errors`);
    
    return {
        errors,
        iterationCount: 1,  // Increment for repair tracking
        currentPhase: 'validation'
    };
}
```

**Error Types Detected**:
- `missing_import`: Import statement references non-existent file
- `missing_export`: File tries to import symbol not exported
- `syntax`: JavaScript/TypeScript syntax errors
- `router_duplicate`: Duplicate route paths
- `missing_package`: npm package not in dependencies

---

## Step 11: Repair Node (Conditional)

**File**: `backend/src/agents/langgraph/nodes/repair-node.ts`

Only executes if validation found errors:

```typescript
export async function repairNode(state: WebsiteState): Promise<Partial<WebsiteState>> {
    notifyPhaseChange('repair');
    
    const files = new Map<string, GeneratedFile>();
    
    // Group errors by file
    const errorsByFile = groupBy(state.errors, 'file');
    
    for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
        const originalFile = state.files.get(filePath);
        if (!originalFile) continue;
        
        const prompt = `
            Fix these errors in ${filePath}:
            ${fileErrors.map(e => `- ${e.message}`).join('\n')}
            
            Original code:
            ${originalFile.content}
            
            Return ONLY the fixed code.
        `;
        
        const fixedContent = await generateWithLLM(prompt);
        
        files.set(filePath, {
            ...originalFile,
            content: fixedContent,
            phase: 'repair'
        });
        notifyFileCreated(files.get(filePath)!);
    }
    
    return { files, currentPhase: 'repair' };
}
```

After repair, goes back to validation (max 3 iterations).

---

## Step 12: Files Streamed to Frontend

**File**: `frontend/src/pages/AgentBuilder.tsx`

Frontend receives streamed files via SSE:

```typescript
// Reading SSE stream
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
        if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'file') {
                // Add file to state
                setFiles(prev => [...prev, data.file]);
            } else if (data.type === 'phase') {
                // Update phase display
                setPhase(data.phase);
            } else if (data.type === 'complete') {
                // Save project ID
                setProjectId(data.projectId);
            }
        }
    }
}
```

---

## Step 13: WebContainer Mounting

**File**: `frontend/src/hooks/useWebContainer.tsx`

Files are mounted to WebContainer for live preview:

```typescript
const mountFiles = useCallback(async (files: FileSystemTree) => {
    const instance = await boot();
    
    // Wait for pre-warming if needed
    if (preWarmPromise && !isPreWarmedFlag) {
        await preWarmPromise;
    }
    
    // Inject error reporter into index.html
    if (files['index.html']) {
        const errorReporter = getErrorReporterScript();
        files['index.html'].file.contents = 
            files['index.html'].file.contents.replace('</head>', `${errorReporter}</head>`);
    }
    
    // Mount all files
    await instance.mount(files);
    appendOutput('✅ Files mounted');
}, [boot, appendOutput]);
```

---

## Step 14: Dev Server Start

**File**: `frontend/src/hooks/useWebContainer.tsx`

Starts Vite dev server inside WebContainer:

```typescript
const startDevServer = useCallback(async () => {
    const instance = await boot();
    
    // Install dependencies
    const installProcess = await instance.spawn('npm', [
        'install', '--prefer-offline', '--no-audit', '--no-fund'
    ]);
    await installProcess.exit;
    
    // Start Vite dev server
    const devProcess = await instance.spawn('npm', ['run', 'dev']);
    
    // Capture output
    devProcess.output.pipeTo(new WritableStream({
        write(data) {
            appendOutput(data);
        }
    }));
    
    // Server ready event sets preview URL
    instance.on('server-ready', (port, url) => {
        setPreviewUrl(url);
        setIsRunning(true);
    });
}, [boot, appendOutput]);
```

---

## Step 15: Auto Error Fixing (Runtime)

**File**: `frontend/src/pages/AgentBuilder.tsx`

Monitors terminal for errors and fixes them:

```typescript
// Watch terminal output for errors
useEffect(() => {
    if (!isRunning || isFixing) return;
    
    const errorInfo = parseError(terminalOutput);
    if (!errorInfo?.file) return;
    
    // Check cooldown
    const now = Date.now();
    const lastFix = lastFixTimeRef.current.get(errorInfo.file) || 0;
    if (now - lastFix < 10000) return;  // 10s cooldown
    
    // Trigger fix
    lastFixTimeRef.current.set(errorInfo.file, now);
    fixCodeError(errorInfo.file, errorInfo.error);
}, [terminalOutput, isRunning, isFixing]);

// Fix code using LLM
const fixCodeError = async (errorFile: string, errorMessage: string) => {
    setIsFixing(true);
    
    const fileContent = files.find(f => f.path === errorFile)?.content;
    
    const response = await axios.post(`${BACKEND_URL}/api/fix-error`, {
        file: errorFile,
        error: errorMessage,
        content: fileContent
    });
    
    // Update file in WebContainer
    await updateFile(errorFile, response.data.fixedContent);
    
    // Save to MongoDB
    if (projectId) {
        await axios.patch(`${BACKEND_URL}/api/projects/${projectId}/files`, {
            files: [{ path: errorFile, content: response.data.fixedContent }]
        });
    }
    
    setIsFixing(false);
};
```

---

## Step 16: Project Modification

**File**: `backend/src/services/modification.service.ts`

When user requests changes after generation:

```typescript
class ModificationService {
    async modifyProject(
        projectId: string,
        modificationRequest: string,
        currentFiles: IProjectFile[]
    ): Promise<{ modifiedFiles: IProjectFile[] }> {
        
        // Analyze which files need modification
        const affectedFiles = await this.identifyAffectedFiles(
            modificationRequest, 
            currentFiles
        );
        
        // Generate modifications for each file
        const modifiedFiles = [];
        for (const file of affectedFiles) {
            const prompt = `
                Modify ${file.path} according to:
                "${modificationRequest}"
                
                Current content:
                ${file.content}
                
                Return the modified file.
            `;
            
            const modifiedContent = await this.llm.generate(prompt);
            modifiedFiles.push({
                path: file.path,
                content: modifiedContent
            });
        }
        
        return { modifiedFiles };
    }
}
```

Frontend calls this via:
```typescript
// AgentBuilder.tsx
const handleModification = async (instruction: string) => {
    const response = await axios.post(
        `${BACKEND_URL}/api/projects/${projectId}/modify`,
        { instruction, currentFiles: files }
    );
    
    // Update files in state and WebContainer
    for (const file of response.data.modifiedFiles) {
        await updateFile(file.path, file.content);
    }
};
```

---

## Complete File Reference

### Backend Files

| File | Purpose |
|------|---------|
| `index.ts` | Express server, API endpoints, SSE streaming |
| `agents/langgraph/website-graph.ts` | LangGraph orchestration |
| `agents/langgraph/graph-state.ts` | State types and annotations |
| `agents/langgraph/nodes/blueprint-node.ts` | Project planning |
| `agents/langgraph/nodes/structure-node.ts` | Config file generation |
| `agents/langgraph/nodes/core-node.ts` | Entry files (main.tsx, App.tsx) |
| `agents/langgraph/nodes/component-node.ts` | UI/feature components |
| `agents/langgraph/nodes/page-node.ts` | Page components |
| `agents/langgraph/nodes/validation-node.ts` | Error detection |
| `agents/langgraph/nodes/repair-node.ts` | Error fixing |
| `services/planning-fixed.service.ts` | Intelligent planning with Gemini |
| `services/modification.service.ts` | Post-generation modifications |
| `models/project.ts` | MongoDB project schema |

### Frontend Files

| File | Purpose |
|------|---------|
| `pages/AgentBuilder.tsx` | Main generation UI, streaming, error fixing |
| `hooks/useWebContainer.tsx` | WebContainer singleton, pre-warming |
| `components/preview/PreviewPanel.tsx` | File tree, code editor, iframe preview |
| `components/preview/FileTree.tsx` | Recursive file tree display |
| `utils/errorReporter.ts` | Runtime error capture script |

---

## Summary

1. **User enters prompt** → AgentBuilder sends to backend
2. **Backend creates SSE stream** → Starts LangGraph execution
3. **Blueprint Node** → Uses PlanningService to create project plan
4. **Structure Node** → Generates package.json, configs
5. **Core Node** → Generates main.tsx, App.tsx, index.css
6. **Component Node** → LLM generates UI/feature components
7. **Page Node** → LLM generates page components using existing components
8. **Validation Node** → Checks for errors
9. **Repair Node** → Fixes errors if found (loops back to validation)
10. **Files stream to frontend** → SSE delivers each file
11. **WebContainer mounts files** → npm install + vite dev
12. **Preview displays** → Live website in iframe
13. **Auto error fixing** → Monitors terminal, fixes errors automatically
14. **MongoDB saves** → Project persisted for later access
15. **Modifications** → User can request changes, LLM modifies files
