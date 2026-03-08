# rag-3d-backend

RAG (Retrieval-Augmented Generation) pipeline backend for 3D web development documentation.  
Scrapes, chunks, embeds, and queries documentation from **React Three Fiber**, **Drei**, and **Three.js**.

---

## Setup

```bash
npm install
```

Copy the environment template and add your API key:

```bash
cp .env.example .env
```

Required in `.env`:

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for embeddings |
| `FIRECRAWL_API_KEY` | No | Firecrawl API key (falls back to Cheerio scraping) |

Start the server:

```bash
npm run dev
```

Server runs on **http://localhost:3002**.

---

## Endpoints

### 1. POST /ingest-3d

Scrapes all hardcoded 3D documentation URLs, chunks text, generates embeddings, and stores them in ChromaDB.

```bash
curl -X POST http://localhost:3002/ingest-3d
```

### 2. POST /query-3d

Queries the vector database and returns retrieved documentation context.

```bash
curl -X POST http://localhost:3002/query-3d \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"R3F OrbitControls example\"}"
```

### 3. GET /test-3d

Runs an automated test query against the pipeline.

```bash
curl http://localhost:3002/test-3d
```

---

## Architecture

```
POST /ingest-3d
  -> Scrape URLs (Firecrawl or Cheerio)
  -> RecursiveCharacterTextSplitter (512 / 100 overlap)
  -> Google Gemini Embeddings
  -> ChromaDB (threejs_rag_knowledge)

POST /query-3d
  -> Embed query via Gemini
  -> Similarity search (top 5)
  -> Build LLM-ready context prompt
  -> Return chunks + sources
```

---

## Tech Stack

- Node.js + Express + TypeScript
- LangChain (text splitting, vector store integration)
- Google Gemini Embeddings
- ChromaDB (local persistent vector database)
- Cheerio / Firecrawl (web scraping)
