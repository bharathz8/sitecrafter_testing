SiteCrafter - Complete Project Presentation Guide
For Your Presentation: This document explains every part of your website-builder project step-by-step, as if you're a fresher.

1. What Is This Project?
SiteCrafter is an AI-powered website generator that creates complete, production-ready websites from natural language prompts.

Example: User types "Create a cake selling website" → AI generates all React code (pages, components, styles) → User sees a live preview.

2. High-Level Architecture
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                 │
│  User types prompt → Shows progress → Displays live preview     │
└─────────────────────────────────────────────────────────────────┘
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND (Express + TypeScript)          │
│  Receives prompt → Runs LangGraph workflow → Returns code       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LANGGRAPH (AI Workflow Engine)              │
│  Step-by-step code generation with validation and repair loop   │
└─────────────────────────────────────────────────────────────────┘
3. Why LangGraph? (KEY Topic for Presentation)
What is LangGraph?
LangGraph is a workflow orchestration library built on top of LangChain. It allows you to create stateful, multi-step AI workflows where:

Each step (node) performs a specific task
State flows between nodes, accumulating results
Conditional routing allows different paths based on conditions
Loops enable retry/repair mechanisms
Why We Chose LangGraph Over Simple API Calls
Simple LLM Call	LangGraph Workflow
One prompt → One response	Multiple specialized prompts
No memory between calls	State persists across nodes
No error recovery	Validation + repair loops
Hard to debug	Each node is testable
Messy code	Clean, modular architecture
Our LangGraph Nodes (10 Nodes)
Create
Modify
Question
Errors Found
No Errors
Intent Router
Blueprint Node
Modification Analyzer
Chat Response Node
Structure Node
Core Node
Component Node
Page Node
Validation Node
Repair Node
Complete
Node Explanations:
Node	Purpose	Example Output
Intent Router	Determines what user wants (create/modify/question)	"This is a create request"
Blueprint	Creates project plan (pages, components, colors)	{ pages: ['Home', 'Products'], primaryColor: '#8B4513' }
Structure	Generates config files (package.json, vite.config)	
package.json
, 
tsconfig.json
Core	Creates utility files (utils, layouts, router)	
App.tsx
, Layout.tsx
Component	Generates reusable UI components	ProductCard.tsx, 
Navbar.tsx
Page	Creates full page files	HomePage.tsx, AboutPage.tsx
Validation	Checks for errors (missing imports, syntax issues)	[{ error: 'missing import' }]
Repair	Fixes errors found by validation	Fixed file content
Chat Response	Answers questions about the project	"The navbar is in components/Navbar.tsx"
Modification Analyzer	Plans changes for modification requests	{ filesToModify: ['Header.tsx'] }
4. Graph State - The Heart of LangGraph
File: 
backend/src/agents/langgraph/graph-state.ts

The state is like a shared memory that all nodes can read and write to:

typescript
// Key state properties:
{
    userPrompt: "Create a cake selling website",  // User's input
    blueprint: { ... },                           // Project plan
    files: Map<path, content>,                    // Generated files
    errors: [],                                   // Validation errors
    iterationCount: 0,                            // Repair attempts
    isComplete: false                             // Done flag
}
Why State Matters:

Blueprint node saves the plan → Component node reads it
Component node generates files → Page node uses those components
Validation finds errors → Repair node reads errors and fixes them
5. Frontend Architecture
Technology Stack
Technology	Purpose
React	UI library for building components
Vite	Fast build tool and dev server
TypeScript	Type safety
WebContainer	Runs Node.js in the browser (!)
Key Pages (in frontend/src/pages/)
Page	Purpose	Size
Home.tsx	Landing page	9KB
AgentBuilder.tsx	Main code generation interface	45KB
Builder.tsx	Legacy builder (simpler version)	21KB
Planning.tsx	Shows AI's planning process	12KB
Dashboard.tsx	User's project list	3KB
Login/Register	Authentication	~9KB each
ProjectHistory.tsx	Past projects	9KB
Key Components (in frontend/src/components/)
Component	Purpose
PreviewFrame.tsx	Shows live website preview
FileExplorer.tsx	Shows generated file tree
CodeEditor.tsx	Displays file code
Navbar.tsx	Navigation bar
StepsList.tsx	Shows generation progress
LoadingOverlay.tsx	Loading animations
Special: WebContainer
WebContainer is a Node.js runtime that runs in the browser. This means:

User doesn't need to install anything
Generated code runs immediately in the preview
npm packages install directly in the browser
6. Backend Architecture
Technology Stack
Technology	Purpose
Express.js	Web server framework
TypeScript	Type safety
LangChain	LLM integration
LangGraph	Workflow orchestration
MongoDB	Database for users/projects
Passport	Authentication
Key Files (in backend/src/)
File/Folder	Purpose
app.ts	Express setup, routes
agents/langgraph/	AI workflow logic
prompts.ts	LLM prompts
routes/	API endpoints
7. The Generation Flow (Step-by-Step)
1. User types: "Create a cake selling website"
            ↓
2. Frontend sends POST /chat with prompt
            ↓
3. Backend starts LangGraph workflow
            ↓
4. Intent Router: "This is a CREATE request"
            ↓
5. Blueprint Node: 
   - Calls LLM with specialized prompt
   - Returns: { pages: ['Home', 'Products', 'About'], 
                components: ['ProductCard', 'CakeGallery'],
                colors: { primary: '#8B4513' } }
            ↓
6. Structure Node:
   - Generates: package.json, vite.config.ts, tsconfig.json
            ↓
7. Core Node:
   - Generates: App.tsx, main.tsx, Layout.tsx, index.css
            ↓
8. Component Node:
   - Reads blueprint.components
   - Generates: ProductCard.tsx, CakeGallery.tsx, Navbar.tsx
   - Each file is streamed to frontend immediately
            ↓
9. Page Node:
   - Reads blueprint.pages
   - Uses components from Component Node
   - Generates: HomePage.tsx, ProductsPage.tsx, AboutPage.tsx
            ↓
10. Validation Node:
    - Checks all files for:
      - Missing imports
      - Undefined components
      - Syntax errors
    - If errors: Go to Repair Node
    - If clean: Mark complete
            ↓
11. Repair Node (if needed):
    - Takes errors + original files
    - Asks LLM to fix them
    - Returns fixed files
    - Goes back to Validation
            ↓
12. Complete:
    - All files sent to frontend
    - Frontend runs them in WebContainer
    - User sees live preview!
8. Key Packages Explained
Backend Packages
Package	What It Does	Why We Use It
@langchain/langgraph	Workflow orchestration	Core of our AI pipeline
@langchain/google-genai	Google Gemini integration	Our LLM provider
express	Web server	Handle HTTP requests
mongoose	MongoDB ODM	Database operations
passport	Authentication	Google OAuth login
zod	Schema validation	Validate API inputs
Frontend Packages
Package	What It Does	Why We Use It
react	UI library	Build components
vite	Build tool	Fast development
@webcontainer/api	Browser Node.js	Live preview
monaco-editor	Code editor	Show generated code
react-router-dom	Routing	Page navigation
9. Key Files to Know
Backend
backend/src/
├── agents/langgraph/
│   ├── graph-state.ts      ← State definition (what data flows)
│   ├── website-graph.ts    ← Graph construction (how nodes connect)
│   └── nodes/
│       ├── intent-router-node.ts  ← First node: what does user want?
│       ├── blueprint-node.ts      ← Plans the project
│       ├── component-node.ts      ← Generates components
│       ├── page-node.ts           ← Generates pages
│       ├── validation-node.ts     ← Checks for errors
│       └── repair-node.ts         ← Fixes errors
├── prompts.ts              ← All LLM prompts
└── app.ts                  ← Express server setup
Frontend
frontend/src/
├── pages/
│   ├── AgentBuilder.tsx    ← Main generation interface
│   ├── Builder.tsx         ← Legacy builder
│   └── Home.tsx            ← Landing page
├── components/
│   ├── PreviewFrame.tsx    ← WebContainer preview
│   ├── FileExplorer.tsx    ← File tree
│   └── CodeEditor.tsx      ← Code display
└── App.tsx                 ← Main app with routing
10. What Makes This Project Special
AI-Powered: Uses LLM to understand natural language
Multi-Step Workflow: Not just one API call, but a full pipeline
Self-Repairing: Validates and fixes its own code
Live Preview: WebContainer runs code instantly
Production-Ready: Generates complete, deployable websites
Modular Architecture: Easy to add new features
11. Sample Interview Questions
Q: Why did you choose LangGraph over simple LLM calls?

LangGraph provides stateful workflows where each step builds on previous ones. Simple LLM calls don't have memory between requests. Also, LangGraph allows validation loops to fix errors automatically.

Q: How does the validation-repair loop work?

After generating all files, the validation node checks for issues like missing imports. If found, the repair node sends errors + files to the LLM to fix. This loops until errors are zero or max retries reached.

Q: What is WebContainer?

WebContainer is a Node.js runtime that runs entirely in the browser using WebAssembly. It allows users to see live previews of generated websites without installing anything.

Q: How do you stream files to the frontend?

Each node calls notifyFileCreated() after generating a file. This triggers a callback that sends the file to the frontend via response streaming, so users see files appear in real-time.

Quick Reference Card
PROJECT: SiteCrafter - AI Website Generator
BACKEND STACK:
  Express + TypeScript + LangGraph + Gemini LLM + MongoDB
FRONTEND STACK:
  React + Vite + WebContainer + Monaco Editor
KEY FLOW:
  Prompt → Intent Router → Blueprint → Structure → Core → 
  Components → Pages → Validation ⟲ Repair → Complete
UNIQUE FEATURES:
  - Multi-step AI workflow with state
  - Self-repairing code generation
  - Live browser preview via WebContainer
  - Real-time file streaming
