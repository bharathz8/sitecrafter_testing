# SiteCrafter - AI-Powered Website Builder

## Project Overview

**SiteCrafter** is an advanced AI-powered website generation platform that transforms natural language descriptions into fully functional, production-ready React web applications. Built with a sophisticated LangGraph-based multi-agent architecture, it leverages Google's Gemini AI and StackBlitz WebContainers for instant in-browser previews.

### Key Highlights

- **LangGraph Multi-Agent Architecture**: 7 specialized nodes working in a directed acyclic graph (DAG)
- **Real-time Code Generation**: Streaming file generation with instant WebContainer previews
- **Automatic Error Fixing**: AI-powered continuous error detection and resolution
- **Project Persistence**: MongoDB-backed project storage with user authentication
- **Cross-Origin WebContainer Support**: Credentialless mode for seamless cross-tab previews

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Backend Architecture](#backend-architecture)
   - [LangGraph Agent System](#langgraph-agent-system)
   - [Graph State Management](#graph-state-management)
   - [Node Descriptions](#node-descriptions)
   - [Services Layer](#services-layer)
   - [API Endpoints](#api-endpoints)
   - [Database Models](#database-models)
4. [Frontend Architecture](#frontend-architecture)
   - [Pages and Components](#pages-and-components)
   - [WebContainer Integration](#webcontainer-integration)
   - [Auto Error Fixing System](#auto-error-fixing-system)
5. [Key Features](#key-features)
6. [Implementation Details](#implementation-details)
7. [Configuration and Setup](#configuration-and-setup)
8. [Project Structure](#project-structure)
9. [Future Enhancements](#future-enhancements)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SITECRAFTER ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                           FRONTEND (React + TypeScript)               │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────────┐    │   │
│  │  │ AgentBuilder │  │ PreviewPanel │  │  WebContainerProvider     │    │   │
│  │  │   Page       │  │  Component   │  │  (Singleton Hook)         │    │   │
│  │  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────────┘    │   │
│  │         │                 │                       │                    │   │
│  │         │    File Streaming (SSE)                │                    │   │
│  │         ▼                 ▼                       ▼                    │   │
│  │  ┌────────────────────────────────────────────────────────────────┐   │   │
│  │  │              WEBCONTAINER API (In-Browser Node.js)              │   │   │
│  │  │  • Pre-warming: 16 packages installed on app load               │   │   │
│  │  │  • Hot Module Replacement (HMR)                                  │   │   │
│  │  │  • Vite Dev Server running inside browser                        │   │   │
│  │  │  • Credentialless COEP mode for cross-tab previews              │   │   │
│  │  └────────────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    │ HTTP/SSE                                │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     BACKEND (Node.js + Express)                       │   │
│  │                                                                        │   │
│  │  ┌────────────────────────────────────────────────────────────────┐   │   │
│  │  │                 LANGGRAPH WEBSITE GENERATOR                      │   │   │
│  │  │                                                                  │   │   │
│  │  │   ┌──────────┐    ┌───────────┐    ┌──────────┐                │   │   │
│  │  │   │Blueprint │───►│ Structure │───►│   Core   │                │   │   │
│  │  │   │  Node    │    │   Node    │    │   Node   │                │   │   │
│  │  │   └──────────┘    └───────────┘    └────┬─────┘                │   │   │
│  │  │                                         │                       │   │   │
│  │  │   ┌──────────┐    ┌───────────┐    ┌───▼──────┐                │   │   │
│  │  │   │  Repair  │◄───│Validation │◄───│Components│                │   │   │
│  │  │   │   Node   │    │   Node    │    │   Node   │                │   │   │
│  │  │   └────┬─────┘    └─────┬─────┘    └──────────┘                │   │   │
│  │  │        │                │                                       │   │   │
│  │  │        │  (Loop if errors, max 3 iterations)                   │   │   │
│  │  │        └────────────────┘                                       │   │   │
│  │  │                         │                                       │   │   │
│  │  │                    ┌────▼────┐                                  │   │   │
│  │  │                    │  Pages  │                                  │   │   │
│  │  │                    │  Node   │                                  │   │   │
│  │  │                    └─────────┘                                  │   │   │
│  │  └────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │   │
│  │  │  SERVICES: PlanningService | Mem0Service | ModificationService  │  │   │
│  │  └─────────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     DATABASE (MongoDB Atlas)                          │   │
│  │  • Projects Collection (files, blueprint, status)                     │   │
│  │  • Users Collection (authentication, OAuth)                           │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express.js | 4.x | Web framework |
| TypeScript | 5.7.2 | Type-safe JavaScript |
| LangChain | Latest | LLM orchestration framework |
| LangGraph | Latest | Multi-agent graph framework |
| MongoDB | 6.x | Document database |
| Mongoose | 8.x | MongoDB ODM |
| OpenAI SDK | 4.x | Gemini API integration |
| Passport.js | 0.7.x | Authentication middleware |
| Express-Session | 1.18.x | Session management |

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI library |
| TypeScript | 5.x | Type safety |
| Vite | 6.0.3 | Build tool and dev server |
| TailwindCSS | 3.4.17 | Utility-first CSS |
| React Router | 7.x | Client-side routing |
| WebContainer API | Latest | In-browser Node.js |
| Monaco Editor | Latest | Code editing |
| Framer Motion | 11.x | Animations |
| Lucide React | Latest | Icons |
| Axios | 1.7.x | HTTP client |

### AI/LLM Technologies

| Technology | Purpose |
|------------|---------|
| Google Gemini 2.5 Flash | Primary LLM for code generation |
| LangGraph StateGraph | Multi-agent orchestration |
| Structured Output (Zod) | JSON schema validation |

---

## Backend Architecture

The backend follows a modular architecture with clear separation of concerns:

```
backend/src/
├── agents/
│   └── langgraph/           # LangGraph multi-agent system
│       ├── graph-state.ts   # State annotations and types
│       ├── website-graph.ts # Main graph orchestration
│       ├── llm-utils.ts     # LLM helper functions
│       ├── memory-utils.ts  # Mem0 memory integration
│       ├── nodes/           # Individual agent nodes
│       │   ├── blueprint-node.ts
│       │   ├── structure-node.ts
│       │   ├── core-node.ts
│       │   ├── component-node.ts
│       │   ├── page-node.ts
│       │   ├── validation-node.ts
│       │   └── repair-node.ts
│       └── services/        # Graph-specific services
├── models/                   # MongoDB schemas
│   ├── project.ts
│   └── user.ts
├── services/                 # Business logic services
│   ├── planning-fixed.service.ts
│   ├── modification.service.ts
│   ├── mem0.service.ts
│   └── ui.service.ts
├── prompts/                  # LLM prompt templates
├── routes/                   # Express routes
├── middleware/               # Express middleware
└── index.ts                  # Main application entry
```

### LangGraph Agent System

The heart of SiteCrafter is a **LangGraph-based multi-agent system** that orchestrates website generation through 7 specialized nodes connected in a directed graph.

#### What is LangGraph?

LangGraph is an extension of LangChain that enables building **stateful, multi-step AI workflows** as directed graphs. Key concepts:

1. **StateGraph**: Defines the workflow structure with nodes and edges
2. **Annotations**: Define how state merges between nodes (reducers)
3. **Conditional Edges**: Enable branching logic (like repair loops)
4. **Checkpointing**: State persistence between steps

#### Graph Flow

```
START → Blueprint → Structure → Core → Components → Pages → Validation
                                                              │
                                                              ├─ [No Errors] → END
                                                              │
                                                              └─ [Errors Found] → Repair → Validation (loop max 3x)
```

### Graph State Management

**File**: `backend/src/agents/langgraph/graph-state.ts`

The graph state is the central data structure that flows through all nodes. It uses LangGraph's Annotation system with custom reducers:

```typescript
// Key State Types

interface ProjectBlueprint {
    projectName: string;
    description: string;
    features: FeatureSpec[];      // High/medium/low priority features
    pages: PageSpec[];            // Route, sections, components
    components: ComponentSpec[];  // UI/feature/layout components
    designSystem: DesignSystem;   // Colors, fonts, style
    dependencies: Record<string, string>;
}

interface GeneratedFile {
    path: string;      // e.g., "src/components/ui/Button.tsx"
    content: string;   // Full file content
    phase: string;     // Which node generated it
    exports: string[]; // Exported symbols
    imports: string[]; // Required imports
}

interface ValidationError {
    type: 'missing_import' | 'missing_export' | 'syntax' | 'type_error' | 'router_duplicate' | 'unused_component' | 'missing_package';
    file: string;
    message: string;
    severity: 'error' | 'warning';
    suggestedFix?: string;
}
```

**State Annotations with Reducers**:

```typescript
// Files accumulate - new files merge with existing
files: Annotation<Map<string, GeneratedFile>>({
    reducer: (existing, newFiles) => {
        const merged = new Map(existing);
        newFiles.forEach((file, path) => merged.set(path, file));
        return merged;
    },
    default: () => new Map()
})

// Errors replace completely each validation cycle
errors: Annotation<ValidationError[]>({
    reducer: (_, newVal) => newVal,
    default: () => []
})

// Iteration count increments
iterationCount: Annotation<number>({
    reducer: (existing, increment) => existing + increment,
    default: () => 0
})
```

### Node Descriptions

Each node is a specialized agent responsible for a specific generation phase:

#### 1. Blueprint Node (`blueprint-node.ts`)

**Purpose**: Generates the complete project blueprint using PlanningService

**Input**: User prompt, project type
**Output**: ProjectBlueprint with pages, components, design system

**Key Functions**:
- `blueprintNode()`: Main node function
- `extractPagesFromContext()`: Parses page specifications
- `extractComponentsFromContext()`: Identifies required components
- `extractDesignSystem()`: Extracts color schemes, fonts, styles

**Standard Dependencies Managed**:
```typescript
const STANDARD_DEPENDENCIES = {
    'react': '^18.3.1',
    'react-dom': '^18.3.1',
    'react-router-dom': '^7.1.1',
    'framer-motion': '^11.14.4',
    'lucide-react': '^0.460.0',
    'clsx': '^2.1.1',
    'tailwind-merge': '^2.5.5',
    'class-variance-authority': '^0.7.1',
    'axios': '^1.7.9',
    'zustand': '^5.0.2',
    'date-fns': '^4.1.0'
};
```

#### 2. Structure Node (`structure-node.ts`)

**Purpose**: Generates project configuration files

**Files Generated**:
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - TailwindCSS configuration
- `postcss.config.js` - PostCSS plugins
- `tsconfig.json` - TypeScript configuration
- `index.html` - HTML entry point

#### 3. Core Node (`core-node.ts`)

**Purpose**: Generates essential core files

**Files Generated**:
- `src/main.tsx` - React entry point
- `src/App.tsx` - Root component with router
- `src/index.css` - Global styles with Tailwind directives
- `src/lib/utils.ts` - Utility functions (cn helper)

#### 4. Component Node (`component-node.ts`)

**Purpose**: Generates reusable UI and feature components

**Component Categories**:
1. **UI Components**: Button, Card, Badge, Container, Input
2. **Layout Components**: Header, Footer, AppLayout
3. **Feature Components**: Hero, ProductCard, StatCard, CTASection

**Generation Strategy**:
- Uses batch generation for efficiency
- Maintains consistent styling with design system
- Ensures proper TypeScript types and props

#### 5. Page Node (`page-node.ts`)

**Purpose**: Generates page components based on blueprint

**Common Pages**:
- HomePage, AboutPage, ContactPage
- ProductsPage, ServicesPage, PricingPage
- BlogPage, PortfolioPage, LoginPage
- DashboardPage, ProfilePage, NotFoundPage

**Features**:
- References existing components from registry
- Implements proper routing paths
- Includes responsive layouts

#### 6. Validation Node (`validation-node.ts`)

**Purpose**: Validates generated code for common errors

**Validation Checks**:
- Missing imports detection
- Export verification
- Syntax error detection
- Router duplicate detection
- Unused component warnings
- Missing package detection

**Conditional Edge Logic**:
```typescript
.addConditionalEdges('validation_step', (state: WebsiteState) => {
    if (state.errors.length === 0) return 'end';
    if (state.iterationCount >= 3) return 'end';
    return 'repair_step';
})
```

#### 7. Repair Node (`repair-node.ts`)

**Purpose**: Fixes validation errors using LLM

**Repair Strategy**:
1. Groups errors by file
2. Uses LLM to generate fixes
3. Updates files in state
4. Increments iteration count
5. Returns to validation node

### Services Layer

#### PlanningService (`planning-fixed.service.ts`)

The largest service (1425 lines) responsible for intelligent project planning.

**Key Methods**:

```typescript
class PlanningService {
    // Generates detailed frontend context (8000+ words)
    async generateFrontendContext(requirements: string, blueprint: ProjectBlueprint): Promise<string>
    
    // Analyzes project complexity
    analyzeProject(requirements: string): ProjectAnalysis
    
    // Generates system prompts for different project types
    generateSystemPrompt(analysis: ProjectAnalysis): string
    
    // Main blueprint generation with retry logic
    async generateBlueprint(
        requirements: string,
        retryCount: number = 0,
        projectTypeFromFrontend?: 'frontend' | 'backend' | 'fullstack'
    ): Promise<PlanningResponse>
}
```

**Planning Phases**:
1. Project analysis and type detection
2. Feature ideation using Gemini
3. Page structure planning
4. Component identification
5. Design system generation
6. Dependency resolution

#### Modification Service (`modification.service.ts`)

Handles post-generation modifications to projects.

**Features**:
- Accepts modification requests in natural language
- Identifies affected files
- Uses LLM to generate changes
- Validates modifications

#### Mem0 Service (`mem0.service.ts`)

Integrates with Mem0 for project memory tracking.

**Features**:
- Stores project context persistently
- Enables cross-session memory
- Supports user preferences learning

### API Endpoints

**Main Server Entry**: `backend/src/index.ts` (1456 lines)

#### Core Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/template` | POST | Returns base React template with projectType routing |
| `/planning` | POST | Generates project blueprint using PlanningService |
| `/chat` | POST | General chat with Gemini for code modifications |
| `/chat/langgraph` | POST | **Main endpoint** - LangGraph website generation with streaming |
| `/chat/agentic` | POST | Alternative agentic pipeline |

#### Project Management Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/projects` | POST | Create new project |
| `/api/projects` | GET | List user projects |
| `/api/projects/:id` | GET | Get project by ID |
| `/api/projects/:id/files` | PATCH | Update project files |
| `/api/projects/:id` | DELETE | Delete project |
| `/api/projects/:id/modify` | POST | Modify project with AI |
| `/api/projects/import` | POST | Import project from ZIP |

#### Authentication Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/google` | GET | Google OAuth login |
| `/auth/google/callback` | GET | OAuth callback |
| `/auth/logout` | GET | Logout user |
| `/auth/me` | GET | Get current user |

#### LangGraph Streaming Endpoint

The `/chat/langgraph` endpoint supports **Server-Sent Events (SSE)** for real-time streaming:

```typescript
app.post("/chat/langgraph", async (req: Request, res: Response) => {
    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Execute LangGraph with streaming callbacks
    const result = await generateWebsite(
        prompt,
        projectType,
        (file) => {
            // Stream each file as it's generated
            res.write(`data: ${JSON.stringify({ type: 'file', file })}\n\n`);
        },
        (phase) => {
            // Stream phase updates
            res.write(`data: ${JSON.stringify({ type: 'phase', phase })}\n\n`);
        }
    );
});
```

### Database Models

#### Project Model (`models/project.ts`)

```typescript
interface IProject {
    userId?: string;           // User ID (optional for anonymous)
    sessionId?: string;        // Session-based tracking
    name: string;              // Project name from blueprint
    prompt: string;            // Original user prompt
    files: IProjectFile[];     // Array of generated files
    blueprint?: object;        // Project blueprint
    status: 'generating' | 'complete' | 'error';
    fileCount: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface IProjectFile {
    path: string;    // e.g., "src/components/ui/Button.tsx"
    content: string; // File contents
}
```

**Indexes**:
- `createdAt: -1` - Recent projects first
- `userId, createdAt: -1` - User's projects sorted by date
- `sessionId, createdAt: -1` - Session projects

#### User Model (`models/user.ts`)

```typescript
interface IUser {
    googleId?: string;      // Google OAuth ID
    email: string;
    name: string;
    avatar?: string;
    createdAt?: Date;
}
```

---

## Frontend Architecture

```
frontend/src/
├── components/
│   ├── agent/               # Agent builder components
│   │   ├── AgentStatus.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── FileCard.tsx
│   │   └── UserInput.tsx
│   ├── preview/             # Preview components
│   │   ├── PreviewPanel.tsx
│   │   ├── FileTree.tsx
│   │   └── TerminalOutput.tsx
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   └── Card.tsx
│   ├── planning/            # Planning phase components
│   └── context/             # React contexts
│       └── AuthContext.tsx
├── hooks/
│   └── useWebContainer.tsx  # Singleton WebContainer hook
├── pages/
│   ├── AgentBuilder.tsx     # Main AI builder page
│   ├── Home.tsx             # Landing page
│   ├── ProjectHistory.tsx   # Project list
│   ├── ProjectUpload.tsx    # ZIP import
│   ├── Login.tsx            # Authentication
│   └── WebContainerConnect.tsx
├── utils/
│   └── errorReporter.ts     # Runtime error detection
└── App.tsx                  # Root with routing
```

### Pages and Components

#### AgentBuilder Page (`pages/AgentBuilder.tsx`)

The main page (965 lines) handling all website generation functionality.

**Features**:
1. **Chat Interface**: Send prompts to generate websites
2. **File Streaming**: Real-time file display as they're generated
3. **WebContainer Preview**: Live preview in iframe
4. **File Editor**: Monaco editor for code modifications
5. **Auto Error Fixing**: Continuous error detection and correction
6. **Project Persistence**: Auto-save to MongoDB

**Key State Variables**:
```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [files, setFiles] = useState<FileData[]>([]);
const [isStreaming, setIsStreaming] = useState(false);
const [phase, setPhase] = useState<string>('');
const [projectId, setProjectId] = useState<string | null>(null);
```

**Core Functions**:
- `handleSubmit()`: Sends prompt to `/chat/langgraph/stream`
- `loadProject()`: Loads project from MongoDB by ID
- `handleFileChange()`: Updates file content and syncs to WebContainer
- `fixCodeError()`: AI-powered error fixing
- `parseError()`: Extracts error info from terminal output

#### PreviewPanel Component (`components/preview/PreviewPanel.tsx`)

Three-tab interface for project interaction:

1. **Files Tab**: TreeView file explorer
2. **Code Tab**: Monaco editor with syntax highlighting
3. **Preview Tab**: WebContainer iframe or terminal output

**Features**:
- File tree with folder/file icons
- Unsaved changes indicator
- Copy code button
- External link for preview URL

#### FileTree Component (`components/preview/FileTree.tsx`)

Recursive tree component for file navigation:
- Folder expansion/collapse
- File type icons
- Click to open in editor

### WebContainer Integration

**File**: `frontend/src/hooks/useWebContainer.tsx`

This is a **React Context + Hook** pattern that manages a **singleton WebContainer instance**.

#### Key Concepts

1. **Singleton Pattern**: Only one WebContainer boots per browser tab
2. **Pre-warming**: Installs 16 base packages on app load for instant previews
3. **Credentialless COEP**: Enables cross-tab preview access

#### Provider Interface

```typescript
interface WebContainerContextType {
    isBooting: boolean;
    isInstalling: boolean;
    isRunning: boolean;
    previewUrl: string | null;
    error: string | null;
    terminalOutput: string[];
    isPreWarmed: boolean;
    isPreWarming: boolean;
    mountFiles: (files: FileSystemTree) => Promise<void>;
    startDevServer: () => Promise<void>;
    updateFile: (path: string, content: string) => Promise<void>;
    reset: () => void;
}
```

#### Pre-warming Strategy

```typescript
// Base packages pre-installed for speed
const BASE_PACKAGE_JSON = {
    dependencies: {
        'react': '^18.3.1',
        'react-dom': '^18.3.1',
        'react-router-dom': '^7.1.1',
        'framer-motion': '^11.14.4',
        'lucide-react': '^0.460.0',
        'clsx': '^2.1.1',
        'tailwind-merge': '^2.5.5',
        'class-variance-authority': '^0.7.1',
        'axios': '^1.7.9',
        'zustand': '^5.0.2',
        'date-fns': '^4.1.0',
    },
    devDependencies: {
        '@vitejs/plugin-react': '^4.3.4',
        'vite': '^6.0.3',
        'typescript': '^5.7.2',
        'tailwindcss': '^3.4.17',
        'postcss': '^8.4.49',
        'autoprefixer': '^10.4.20',
    },
};
```

#### Boot with Credentialless Mode

```typescript
const instance = await WebContainer.boot({
    coep: 'credentialless'  // Enables cross-tab previews
});
```

This uses the less restrictive `Cross-Origin-Embedder-Policy: credentialless` header instead of `require-corp`, allowing the WebContainer preview to work in new browser tabs without the "Connect to Project" screen.

### Auto Error Fixing System

**Location**: `AgentBuilder.tsx`, lines 317-620

A sophisticated system that continuously monitors terminal output and fixes errors automatically.

#### Error Detection Flow

```
Terminal Output → parseError() → Detect Error Type → fixCodeError() → Update Files → Re-validate
```

#### parseError Function

Detects multiple error types:

1. **Vite Plugin Errors**: `[plugin:vite:react-babel]`
2. **Import Resolution Errors**: `Failed to resolve import`
3. **TypeScript Errors**: `TS2304`, `TS2307`, etc.
4. **Syntax Errors**: `SyntaxError`, `Unexpected token`
5. **Module Not Found**: `Cannot find module`

```typescript
const parseError = useCallback((output: string[]): { file: string; error: string } | null => {
    // Strip ANSI escape codes
    const text = rawText.replace(/\x1B\[[0-9;]*[mGKHF]/g, '').replace(/\[\d+m/g, '');
    
    // Skip success messages
    if (text.includes('hmr update') && !text.includes('[plugin:vite')) {
        return null;
    }
    
    // Detect Vite plugin errors
    if (text.includes('[plugin:vite:')) {
        const fileMatch = text.match(/File:\s*(?:\/home\/[^\/]+\/)?(src\/[^\s:]+\.tsx?)(?::(\d+))?/);
        if (fileMatch) {
            return {
                file: fileMatch[1],
                error: `Vite Error in ${fileMatch[1]}\n\nFull error:\n${text.slice(-1000)}`
            };
        }
    }
    // ... more patterns
}, []);
```

#### Cooldown Mechanism

Prevents fixing the same file repeatedly:

```typescript
const lastFixTimeRef = useRef<Map<string, number>>(new Map());
const FIX_COOLDOWN_MS = 10000; // 10 seconds per file

// Check cooldown before fixing
const now = Date.now();
const lastFixTime = lastFixTimeRef.current.get(errorInfo.file) || 0;
if (now - lastFixTime < FIX_COOLDOWN_MS) {
    return; // Skip - still in cooldown
}
```

#### Fix Loop with MongoDB Persistence

After fixing, files are saved to the database:

```typescript
// After successful fix
if (projectId) {
    await axios.patch(`${BACKEND_URL}/api/projects/${projectId}/files`, {
        files: [{ path: errorFile, content: newContent }]
    });
}
```

---

## Key Features

### 1. Natural Language to Code

Users describe their website in plain English:
> "Create an e-commerce website for selling handmade jewelry with a homepage, product gallery, about page, and contact form"

The system generates 40+ production-ready files.

### 2. Real-time Streaming

Files appear as they're generated via Server-Sent Events (SSE):
- Phase updates: "Generating components..."
- File notifications: "Created src/components/ui/Button.tsx"
- Instant preview updates via HMR

### 3. In-Browser Preview

WebContainer runs a full Node.js environment:
- Vite dev server with HMR
- TailwindCSS JIT compilation
- TypeScript compilation
- Real-time error display

### 4. Automatic Error Recovery

The most sophisticated feature:
1. Monitors Vite terminal output
2. Detects errors using regex patterns
3. Sends error + file content to LLM
4. Applies fix automatically
5. Repeats until 0 errors or max attempts

### 5. Project Management

- **Save**: Auto-save generated projects to MongoDB
- **Load**: Reload projects by ID
- **Import**: Upload ZIP files of existing projects
- **Export**: Download projects as ZIP
- **Modify**: Use AI to make changes

### 6. Authentication

- Google OAuth 2.0 integration
- Session-based anonymous usage
- User-linked project history

---

## Implementation Details

### Cross-Origin Configuration (COOP/COEP)

WebContainer requires specific HTTP headers for SharedArrayBuffer:

**Frontend Vite Config**:
```typescript
export default defineConfig({
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "credentialless",
      "Cross-Origin-Opener-Policy": "same-origin"
    }
  }
});
```

**Backend Express Middleware**:
```typescript
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
});
```

### Error Reporter Script Injection

Runtime errors in the preview are captured via an injected script:

```typescript
// Injected into index.html <head>
window.onerror = function(msg, url, line, col, error) {
    window.parent.postMessage({
        type: 'RUNTIME_ERROR',
        error: { message: msg, file: url, line, column: col }
    }, '*');
};
```

### File System Format Conversion

Converts flat file list to WebContainer FileSystemTree:

```typescript
function toWebContainerFS(files: { path: string; content: string }[]): FileSystemTree {
    const tree: FileSystemTree = {};
    
    for (const file of files) {
        const parts = file.path.replace(/^\//, '').split('/');
        let current: any = tree;
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (i === parts.length - 1) {
                // It's a file
                current[part] = { file: { contents: file.content } };
            } else {
                // It's a directory
                if (!current[part]) {
                    current[part] = { directory: {} };
                }
                current = current[part].directory;
            }
        }
    }
    
    return tree;
}
```

---

## Configuration and Setup

### Environment Variables

**Backend (.env)**:
```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SESSION_SECRET=...

# Gemini AI APIs (multiple for rate limit distribution)
gemini=...
gemini2=...
gemini3=...

# OpenRouter (alternative LLM provider)
OPENROUTER_API_KEY=...

# App
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**:
```env
VITE_BACKEND_URL=http://localhost:3000
```

### Running the Application

**Backend**:
```bash
cd backend
npm install
npm run dev
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
website-builder/
├── backend/
│   ├── src/
│   │   ├── agents/
│   │   │   └── langgraph/
│   │   │       ├── nodes/
│   │   │       │   ├── blueprint-node.ts
│   │   │       │   ├── structure-node.ts
│   │   │       │   ├── core-node.ts
│   │   │       │   ├── component-node.ts
│   │   │       │   ├── page-node.ts
│   │   │       │   ├── validation-node.ts
│   │   │       │   └── repair-node.ts
│   │   │       ├── services/
│   │   │       ├── graph-state.ts
│   │   │       ├── website-graph.ts
│   │   │       ├── llm-utils.ts
│   │   │       └── memory-utils.ts
│   │   ├── services/
│   │   │   ├── planning-fixed.service.ts
│   │   │   ├── modification.service.ts
│   │   │   ├── mem0.service.ts
│   │   │   └── ui.service.ts
│   │   ├── models/
│   │   │   ├── project.ts
│   │   │   └── user.ts
│   │   ├── prompts/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── index.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── agent/
│   │   │   ├── preview/
│   │   │   ├── ui/
│   │   │   └── context/
│   │   ├── hooks/
│   │   │   └── useWebContainer.tsx
│   │   ├── pages/
│   │   │   ├── AgentBuilder.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── ProjectHistory.tsx
│   │   │   └── ...
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

---

## Future Enhancements

1. **Backend Generation**: Extend LangGraph to generate Node.js/Express backends
2. **Full-Stack Templates**: Combined frontend + backend + database
3. **Deployment Integration**: One-click deploy to Vercel/Netlify
4. **Collaborative Editing**: Real-time multiplayer code editing
5. **Plugin System**: Custom generators for specific frameworks
6. **AI Memory**: Long-term user preference learning with Mem0
7. **Version Control**: Git-like versioning for generated projects
8. **Component Library**: Pre-built component marketplace

---

## Summary

SiteCrafter represents a sophisticated integration of:

- **LangGraph Multi-Agent Architecture**: 7 specialized nodes orchestrated in a DAG
- **Streaming Code Generation**: Real-time file delivery via SSE
- **In-Browser Execution**: WebContainer for instant previews
- **Intelligent Error Recovery**: Continuous AI-powered debugging
- **Modern Tech Stack**: React, TypeScript, TailwindCSS, Vite
- **Scalable Persistence**: MongoDB Atlas for project storage

This architecture enables the transformation of natural language descriptions into production-ready websites in minutes, with automatic error correction and instant preview capabilities.

---

## License

Private - Not for public distribution.

## Authors

Built with ❤️ using LangGraph and Google Gemini.
