import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
    ingestDocumentation,
    queryDocumentation,
    testPipeline,
    generateComponent,
} from "./rag-3d";

dotenv.config();

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// ── POST /ingest-3d ────────────────────────────────────────
app.post(
    "/ingest-3d",
    async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await ingestDocumentation();
            res.json({
                success: true,
                urlsProcessed: result.urlsProcessed,
                chunksStored: result.chunksStored,
            });
        } catch (err) {
            next(err);
        }
    }
);

// ── POST /query-3d ─────────────────────────────────────────
app.post(
    "/query-3d",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { query } = req.body;
            if (!query || typeof query !== "string" || query.trim().length === 0) {
                res.status(400).json({ success: false, error: "Body must include a non-empty 'query' string." });
                return;
            }
            const result = await queryDocumentation(query);
            res.json({
                success: true,
                query: result.query,
                retrievedChunks: result.retrievedChunks,
                context: result.context,
                sources: result.sources,
            });
        } catch (err) {
            next(err);
        }
    }
);

// ── GET /test-3d ───────────────────────────────────────────
app.get(
    "/test-3d",
    async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await testPipeline();
            res.json({
                success: true,
                chunksRetrieved: result.chunksRetrieved,
                status: result.chunksRetrieved > 0 ? "RAG pipeline working ✅" : "Run /ingest-3d first",
            });
        } catch (err) {
            next(err);
        }
    }
);

// ── POST /generate-3d ─────────────────────────────────────
app.post(
    "/generate-3d",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { prompt } = req.body;
            if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
                res.status(400).json({ success: false, error: "Body must include a non-empty 'prompt' string." });
                return;
            }
            const result = await generateComponent(prompt);
            res.json({
                success: true,
                prompt: result.prompt,
                component: result.component,
                sources: result.sources,
            });
        } catch (err) {
            next(err);
        }
    }
);

// ── Global error handler ───────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    console.error("[Server Error]", err.message);
    res.status(500).json({ success: false, error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
    console.log(`[rag-3d-backend] Server running on http://localhost:${PORT}`);
    console.log(`[rag-3d-backend] Endpoints:`);
    console.log(`  POST /ingest-3d    - Ingest 3D documentation`);
    console.log(`  POST /query-3d     - Query the knowledge base`);
    console.log(`  POST /generate-3d  - Generate a 3D React component`);
    console.log(`  GET  /test-3d      - Run automated test query`);
});