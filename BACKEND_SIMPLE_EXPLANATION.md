# Backend - Simple Explanation

This is the brain of SiteCrafter - an **AI-powered website generator**.

---

## What It Does

User says: *"Create a portfolio website"*  
Backend generates: **40+ files** (React components, pages, styles, routing)

---

## Why LangGraph?

Building a website needs **multiple AI steps**:

```
1. Plan the website (Blueprint)
2. Create base files (index.html, App.tsx)
3. Generate components (Header, Footer, Cards)
4. Generate pages (Home, About, Contact)
5. Validate & fix errors
```

**LangGraph chains these steps** - if step 5 finds errors, it loops back to fix them.

---

## Why Mem0?

AI forgets between calls. When generating Page 5:
- ❌ Without Mem0: AI doesn't know Component 1 exists → broken imports
- ✅ With Mem0: AI remembers all files → consistent code

---

## API Routes Explained

### Core Routes

| Route | What It Does |
|-------|--------------|
| `GET /` | Health check - "Server is running" |
| `POST /planning` | Creates project blueprint (plan before coding) |
| `POST /generate` | Generates full website, streams files in real-time |

### Project Management

| Route | What It Does |
|-------|--------------|
| `GET /api/projects` | List all user's projects |
| `GET /api/projects/:id` | Get one project with all files |
| `POST /api/save-project` | Save generated project to database |
| `DELETE /api/projects/:id` | Delete a project |

### Intelligent Chat

| Route | What It Does |
|-------|--------------|
| `POST /api/projects/:id/chat` | Smart chat - detects question vs modification |
| `POST /api/projects/:id/modify` | Apply changes to existing project |

**Example:**
- *"Where is the header?"* → Answers question (no file changes)
- *"Add a contact page"* → Creates page + updates App.tsx + updates Navbar

### Error Fixing

| Route | What It Does |
|-------|--------------|
| `POST /api/fix-error` | AI fixes code errors automatically |

### Authentication

| Route | What It Does |
|-------|--------------|
| `POST /auth/register` | Create new account |
| `POST /auth/login` | Login with email/password |
| `GET /auth/google` | Login with Google |

---

## LangGraph Flow

```
User Prompt
    ↓
┌─────────────────┐
│ Intent Router   │ → question? → Answer & END
└────────┬────────┘
         ↓ create
┌─────────────────┐
│ Blueprint Node  │ → Plans pages, components, design
└────────┬────────┘
         ↓
┌─────────────────┐
│ Core Node       │ → Creates index.html, App.tsx, main.tsx
└────────┬────────┘
         ↓
┌─────────────────┐
│ Component Node  │ → Creates Header, Footer, Cards, etc.
└────────┬────────┘
         ↓
┌─────────────────┐
│ Page Node       │ → Creates HomePage, AboutPage, etc.
└────────┬────────┘
         ↓
┌─────────────────┐
│ Validation Node │ → Checks for errors
└────────┬────────┘
    ┌────┴────┐
    ↓         ↓
 Errors?    No Errors
    ↓         ↓
 Repair      END
    ↓
 (loops back to validation)
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Main server, all API routes |
| `src/agents/langgraph/website-graph.ts` | LangGraph flow definition |
| `src/agents/langgraph/nodes/*.ts` | Individual AI steps (blueprint, component, page) |
| `src/agents/langgraph/memory-utils.ts` | Mem0 integration |
| `src/services/modification.service.ts` | Smart file modification |
| `src/models/project.ts` | MongoDB project schema |

---

## Tech Stack

- **Express.js** - HTTP server
- **MongoDB** - Database for projects & users
- **LangGraph** - AI orchestration
- **Mem0** - Memory across AI calls
- **Google Gemini** - LLM for code generation
- **Passport.js** - Authentication

---

## Environment Variables

```env
gemini2=your_gemini_api_key
gemini3=your_gemini_api_key
mem0=your_mem0_api_key
MONGODB_URI=mongodb://localhost:27017/sitecrafter
```

---

## Summary

> Backend uses **LangGraph** to run a multi-step AI pipeline that generates React websites. Each step is a "node" that can loop back for error handling. **Mem0** provides memory so the AI generates consistent code across all files.
