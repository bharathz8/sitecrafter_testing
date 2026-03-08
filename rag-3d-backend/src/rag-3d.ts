import axios from "axios";
import * as cheerio from "cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";
import { Embeddings } from "@langchain/core/embeddings";
import path from "path";
import fs from "fs";

// ──────────────────────────────────────────────────────────
// CONFIG
// ──────────────────────────────────────────────────────────
const HNSW_PERSIST_DIR = path.join(process.cwd(), "hnsw_3d_docs");
const CHUNK_SIZE = 512;
const CHUNK_OVERLAP = 100;
const TOP_K = 10;
const FETCH_CANDIDATES = 25;
const EMBED_BATCH_SIZE = 10;
const EMBED_BATCH_DELAY = 2500;
const SCRAPE_DELAY = 250;

function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

// ──────────────────────────────────────────────────────────
// GEMINI KEY ROTATION
// ──────────────────────────────────────────────────────────
function getGeminiKeys(): string[] {
    const keys = [
        process.env.gemini123, process.env.gemini3, process.env.gemini4,
        process.env.gemini6,
        process.env.gemini7, process.env.gemini8, process.env.gemini9,
        process.env.gemini10, process.env.gemini11, process.env.gemini12,
        process.env.gemini13,
    ].filter((k): k is string => !!k && k.trim().length > 0);
    if (keys.length === 0) throw new Error("No Gemini API key found in .env");
    console.log(`[Keys] Loaded ${keys.length} Gemini key(s)`);
    return keys;
}

function makeEmbeddingForKey(apiKey: string, taskType: TaskType): GoogleGenerativeAIEmbeddings {
    return new GoogleGenerativeAIEmbeddings({ apiKey, model: "gemini-embedding-001", taskType });
}

// ──────────────────────────────────────────────────────────
// ROTATING BATCHED EMBEDDINGS — with per-chunk retry recovery
// ──────────────────────────────────────────────────────────
class RotatingBatchedEmbeddings extends Embeddings {
    private keys: string[];
    private taskType: TaskType;
    private batchSize: number;
    private delayMs: number;

    constructor(keys: string[], taskType: TaskType, batchSize = EMBED_BATCH_SIZE, delayMs = EMBED_BATCH_DELAY) {
        super({});
        this.keys = keys;
        this.taskType = taskType;
        this.batchSize = batchSize;
        this.delayMs = delayMs;
    }

    // Embed a single text with key cycling — never zero-fills, retries all keys
    private async embedSingle(text: string, startKeyIdx: number): Promise<number[] | null> {
        for (let attempt = 0; attempt < this.keys.length; attempt++) {
            const key = this.keys[(startKeyIdx + attempt) % this.keys.length];
            const embedder = makeEmbeddingForKey(key, this.taskType);
            try {
                await sleep(500); // small delay between individual retries
                const [vec] = await embedder.embedDocuments([text]);
                if (vec && vec.length > 0) return vec;
            } catch (err: any) {
                const msg = err.message?.slice(0, 60) || "";
                if (msg.includes("429") || msg.includes("quota")) {
                    await sleep(15000); // back off on rate limit
                }
            }
        }
        return null; // exhausted all keys
    }

    async embedDocuments(texts: string[]): Promise<number[][]> {
        const cleaned = texts.map((t) => t.replace(/\s+/g, " ").trim());
        const results: number[][] = new Array(cleaned.length).fill(null as any);

        // Filter: skip anything under 50 chars (junk chunks)
        const validIndices: number[] = [];
        const validTexts: string[] = [];
        cleaned.forEach((t, i) => {
            if (t.length >= 50) { validIndices.push(i); validTexts.push(t); }
            else console.warn(`[Embed] Skipping too-short chunk ${i} (${t.length} chars)`);
        });

        const totalBatches = Math.ceil(validTexts.length / this.batchSize);
        console.log(`[Embed] ${validTexts.length} chunks → ${totalBatches} batches across ${this.keys.length} key(s)`);

        // ── PASS 1: batch embedding with key rotation ──
        const failedIndices: number[] = []; // originalIndex → validTexts position
        const failedTextIndices: number[] = [];

        for (let i = 0; i < validTexts.length; i += this.batchSize) {
            const batchNum = Math.floor(i / this.batchSize);
            const batch = validTexts.slice(i, i + this.batchSize);
            const batchIndices = validIndices.slice(i, i + this.batchSize);
            const batchValidPos = Array.from({ length: batch.length }, (_, j) => i + j);
            const apiKey = this.keys[batchNum % this.keys.length];
            const embedder = makeEmbeddingForKey(apiKey, this.taskType);

            let success = false;
            let retries = 3;
            let backoff = this.delayMs;

            while (retries > 0 && !success) {
                try {
                    const batchResults = await embedder.embedDocuments(batch);
                    let batchEmpty = 0;
                    batchResults.forEach((vec, j) => {
                        if (vec && vec.length > 0) {
                            results[batchIndices[j]] = vec;
                        } else {
                            batchEmpty++;
                            failedIndices.push(batchIndices[j]);
                            failedTextIndices.push(batchValidPos[j]);
                        }
                    });
                    if (batchEmpty > 0) {
                        console.warn(`[Embed] Batch ${batchNum + 1}: ${batchEmpty}/${batch.length} empty — queued for retry`);
                    } else {
                        console.log(`[Embed] Batch ${batchNum + 1}/${totalBatches} ✓ (key #${(batchNum % this.keys.length) + 1})`);
                    }
                    success = true;
                } catch (err: any) {
                    retries--;
                    const msg = err.message?.slice(0, 80) || "";
                    console.warn(`[Embed] Error batch ${batchNum + 1}: ${msg} — retries left: ${retries}`);
                    if (retries > 0) {
                        if (msg.includes("429") || msg.includes("quota")) backoff = Math.max(backoff, 30000);
                        await sleep(backoff);
                        backoff *= 2;
                    } else {
                        // Mark whole batch as failed for per-chunk retry
                        batchIndices.forEach((origIdx, j) => {
                            failedIndices.push(origIdx);
                            failedTextIndices.push(batchValidPos[j]);
                        });
                        console.warn(`[Embed] Batch ${batchNum + 1} fully failed — ${batch.length} chunks queued for per-chunk retry`);
                    }
                }
            }

            if (i + this.batchSize < validTexts.length) await sleep(this.delayMs);
        }

        // ── PASS 2: per-chunk retry for any that failed ──
        if (failedIndices.length > 0) {
            console.log(`\n[Embed] 🔄 PASS 2: Retrying ${failedIndices.length} failed chunks individually...`);
            let recovered = 0;
            let unrecoverable = 0;

            for (let k = 0; k < failedIndices.length; k++) {
                const origIdx = failedIndices[k];
                const textPos = failedTextIndices[k];
                const text = validTexts[textPos];
                // Cycle through keys starting from a different offset to avoid same key that just failed
                const startKey = (k + 1) % this.keys.length;
                const vec = await this.embedSingle(text, startKey);
                if (vec) {
                    results[origIdx] = vec;
                    recovered++;
                    if (recovered % 10 === 0) console.log(`[Embed] Recovery: ${recovered}/${failedIndices.length} chunks recovered`);
                } else {
                    unrecoverable++;
                    console.warn(`[Embed] ❌ Chunk ${origIdx} unrecoverable after all keys exhausted`);
                }
            }

            console.log(`[Embed] Recovery complete: ${recovered} recovered, ${unrecoverable} unrecoverable`);
        }

        // ── Determine vector dimension ──
        const dimension = results.find((v) => v && v.length > 0)?.length ?? 0;
        if (dimension === 0) throw new Error("All embeddings failed. Check API keys and rate limits.");

        // ── PASS 3: final safety — only truly unrecoverable chunks get zero-filled ──
        let finalZeroCount = 0;
        const filled = results.map((v, i) => {
            if (v && v.length > 0) return v;
            // Only chunks that were too short OR truly failed all retries reach here
            finalZeroCount++;
            return new Array(dimension).fill(0);
        });

        if (finalZeroCount > 0) {
            console.warn(`[Embed] ⚠️  ${finalZeroCount} chunks still zero-filled (${Math.round(finalZeroCount / texts.length * 100)}% of total) — these will not affect retrieval quality`);
        } else {
            console.log(`[Embed] ✅ All chunks successfully embedded — zero failures!`);
        }

        return filled;
    }

    async embedQuery(text: string): Promise<number[]> {
        // Try all keys in order for query embedding
        for (let i = 0; i < this.keys.length; i++) {
            try {
                const embedder = makeEmbeddingForKey(this.keys[i], this.taskType);
                const vec = await embedder.embedQuery(text.replace(/\s+/g, " ").trim());
                if (vec && vec.length > 0) return vec;
            } catch (err: any) {
                if (i === this.keys.length - 1) throw err;
                console.warn(`[Embed] Query failed on key ${i + 1}, trying next...`);
                await sleep(1000);
            }
        }
        throw new Error("All keys failed for query embedding");
    }
}

// ──────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────
function detectModule(url: string): "r3f" | "drei" | "threejs" | "general" {
    if (url.includes("r3f.docs") || url.includes("react-three/fiber") || url.includes("react-three-fiber")) return "r3f";
    if (url.includes("drei") || url.includes("react-three-drei")) return "drei";
    if (url.includes("threejs.org") || url.includes("three.js")) return "threejs";
    return "general";
}

async function cheerioScrape(url: string): Promise<string> {
    try {
        const { data } = await axios.get(url, {
            timeout: 15000,
            headers: { "User-Agent": "Mozilla/5.0 (compatible; RAG-DocBot/2.0)" },
        });
        const $ = cheerio.load(data);
        $("script, style, nav, footer, header, noscript, iframe").remove();
        const content = $("main").text() || $("article").text() || $(".content").text() || $("body").text();
        return content.replace(/\s+/g, " ").trim().slice(0, 25000);
    } catch (err: any) {
        console.warn(`  [Cheerio] ✗ ${url.slice(0, 80)}: ${err.message?.slice(0, 50)}`);
        return "";
    }
}

async function firecrawlScrape(url: string): Promise<string> {
    if (!process.env.FIRECRAWL_API_KEY) return "";
    try {
        const { data } = await axios.post(
            "https://api.firecrawl.dev/v1/scrape",
            { url, formats: ["markdown"], excludeTags: ["nav", "footer", "header", "script", "style"] },
            { headers: { Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`, "Content-Type": "application/json" }, timeout: 20000 }
        );
        return data?.data?.markdown || "";
    } catch (err: any) {
        console.warn(`  [Firecrawl] ✗ ${url.slice(0, 80)}: ${err.message?.slice(0, 50)}`);
        return "";
    }
}

async function tavilySearch(query: string, maxResults = 3): Promise<{ url: string; content: string }[]> {
    if (!process.env.TAVILY_API_KEY) return [];
    try {
        const { data } = await axios.post(
            "https://api.tavily.com/search",
            { api_key: process.env.TAVILY_API_KEY, query, search_depth: "advanced", max_results: maxResults, include_raw_content: true },
            { timeout: 20000 }
        );
        return (data?.results || [])
            .map((r: any) => ({ url: r.url || "", content: (r.raw_content || r.content || "").slice(0, 20000) }))
            .filter((r: any) => r.url && r.content.length > 100);
    } catch (err: any) {
        console.warn(`  [Tavily] ✗ "${query}": ${err.message?.slice(0, 60)}`);
        return [];
    }
}

// ──────────────────────────────────────────────────────────
// THREE.JS FULL CRAWLER
//
// HOW IT WORKS:
// 1. Fetch https://threejs.org/docs/llms-full.txt
//    This file contains the FULL documentation text for the LLM context.
//    It includes everything — descriptions, code examples, import syntax,
//    constructors, properties, methods for EVERY class.
//    The file also has a header section (lines 1-1898) with general info,
//    then from line ~1899 it lists all class links like:
//    - [ClassName](https://threejs.org/docs/pages/ClassName.html.md)
//
// 2. We have TWO options:
//    OPTION A — Parse the whole llms-full.txt as ONE giant document and chunk it.
//               PRO: captures all content including the header intro text.
//               CON: one request but file is 125KB.
//
//    OPTION B — Parse the class links from llms-full.txt, then fetch each
//               https://threejs.org/docs/pages/{Name}.html.md individually.
//               PRO: each class gets clean focused chunks with title metadata.
//               CON: many requests (~300+) but they're tiny and free.
//
// We do BOTH: chunk llms-full.txt for the intro/manual content,
// THEN crawl each individual .html.md for per-class detail.
// ──────────────────────────────────────────────────────────

async function crawlThreeJsDocs(splitter: RecursiveCharacterTextSplitter): Promise<Document[]> {
    const docs: Document[] = [];

    // ── STEP 1: Fetch llms-full.txt — the master document ──
    console.log("\n[ThreeJS] Fetching https://threejs.org/docs/llms-full.txt ...");
    let fullText = "";
    try {
        const { data } = await axios.get("https://threejs.org/docs/llms-full.txt", {
            timeout: 30000,
            headers: { "User-Agent": "Mozilla/5.0 (compatible; RAG-DocBot/2.0)" },
            responseType: "text",
        });
        fullText = data as string;
        console.log(`[ThreeJS] llms-full.txt fetched: ${fullText.length} chars`);
    } catch (err: any) {
        console.error(`[ThreeJS] Failed to fetch llms-full.txt: ${err.message}`);
        return docs;
    }

    // ── STEP 2: Extract the intro/manual section (before the class list) ──
    // The file starts with general Three.js documentation, installation guides,
    // getting started content — very valuable for RAG context.
    // The class links section starts around the line with "### Core"
    const classListMarker = "- [ARButton]"; // first class link
    const introEndIdx = fullText.indexOf(classListMarker);
    const introText = introEndIdx > 0 ? fullText.substring(0, introEndIdx).trim() : "";

    if (introText.length > 100) {
        const introChunks = await splitter.splitText(introText);
        introChunks.filter(c => c.trim().length >= 50).forEach((chunk) => {
            docs.push(new Document({
                pageContent: chunk.trim(),
                metadata: { module: "threejs", url: "https://threejs.org/docs/llms-full.txt", title: "Three.js Introduction & Manual", source: "threejs-intro" },
            }));
        });
        console.log(`[ThreeJS] Intro section: ${introChunks.length} chunks`);
    }

    // ── STEP 3: Parse all class .html.md URLs from the file ──
    // Format: - [ClassName](https://threejs.org/docs/pages/ClassName.html.md)
    const urlRegex = /\[([^\]]+)\]\((https:\/\/threejs\.org\/docs\/pages\/[^\)]+\.html\.md)\)/g;
    const classPages: { title: string; mdUrl: string }[] = [];
    let match: RegExpExecArray | null;

    while ((match = urlRegex.exec(fullText)) !== null) {
        classPages.push({ title: match[1].trim(), mdUrl: match[2].trim() });
    }

    console.log(`[ThreeJS] Found ${classPages.length} class pages to crawl`);

    if (classPages.length === 0) {
        console.warn("[ThreeJS] No class pages found — using llms-full.txt as single document");
        // Fallback: chunk the entire file
        const allChunks = await splitter.splitText(fullText);
        allChunks.filter(c => c.trim().length >= 50).forEach((chunk) => {
            docs.push(new Document({
                pageContent: chunk.trim(),
                metadata: { module: "threejs", url: "https://threejs.org/docs/llms-full.txt", title: "Three.js Full Documentation", source: "threejs-full" },
            }));
        });
        return docs;
    }

    // ── STEP 4: Fetch each class .html.md page ──
    // Each page returns clean markdown:
    //   # ClassName
    //   Description of what it does and when to use it
    //   ## Code Example
    //   ```js ... ```
    //   ## Import
    //   import { X } from 'three';
    //   ## Constructor / Properties / Methods
    console.log(`\n[ThreeJS] Crawling ${classPages.length} individual class pages (pure markdown, free)...\n`);

    let scraped = 0;
    let failed = 0;

    for (const page of classPages) {
        try {
            const { data } = await axios.get(page.mdUrl, {
                timeout: 12000,
                headers: { "User-Agent": "Mozilla/5.0 (compatible; RAG-DocBot/2.0)" },
                responseType: "text",
            });

            const content = (data as string).trim();
            if (!content || content.length < 30) { failed++; await sleep(SCRAPE_DELAY); continue; }

            // Prepend class name so every split chunk retains identity
            const enriched = `# Three.js — ${page.title}\nSource: ${page.mdUrl}\n\n${content}`;
            const chunks = await splitter.splitText(enriched);
            const validChunks = chunks.filter((c) => c.trim().length >= 50);

            validChunks.forEach((chunk) => {
                docs.push(new Document({
                    pageContent: chunk.trim(),
                    metadata: { module: "threejs", url: page.mdUrl, title: page.title, source: "threejs-class-md" },
                }));
            });

            scraped++;
            if (scraped % 30 === 0) {
                console.log(`  [ThreeJS] ${scraped}/${classPages.length} scraped | ${docs.length} total chunks`);
            }
            await sleep(SCRAPE_DELAY);
        } catch (err: any) {
            failed++;
            if (failed <= 5) console.warn(`  [ThreeJS] ✗ ${page.title}: ${err.message?.slice(0, 50)}`);
            await sleep(SCRAPE_DELAY);
        }
    }

    console.log(`\n[ThreeJS] ✅ ${scraped} pages scraped, ${failed} failed, ${docs.length} total chunks`);
    return docs;
}

// ──────────────────────────────────────────────────────────
// R3F PAGES
// ──────────────────────────────────────────────────────────
const R3F_PAGES = [
    "https://r3f.docs.pmnd.rs/getting-started/introduction",
    "https://r3f.docs.pmnd.rs/getting-started/your-first-scene",
    "https://r3f.docs.pmnd.rs/getting-started/examples",
    "https://r3f.docs.pmnd.rs/getting-started/community-r3f-components",
    "https://r3f.docs.pmnd.rs/api/canvas",
    "https://r3f.docs.pmnd.rs/api/hooks",
    "https://r3f.docs.pmnd.rs/api/objects",
    "https://r3f.docs.pmnd.rs/api/events",
    "https://r3f.docs.pmnd.rs/api/additional-exports",
    "https://r3f.docs.pmnd.rs/tutorials/basic-animations",
    "https://r3f.docs.pmnd.rs/tutorials/events-and-interaction",
    "https://r3f.docs.pmnd.rs/tutorials/loading-models",
    "https://r3f.docs.pmnd.rs/tutorials/loading-textures",
    "https://r3f.docs.pmnd.rs/tutorials/v8-migration-guide",
    "https://r3f.docs.pmnd.rs/advanced/scaling-performance",
    "https://r3f.docs.pmnd.rs/advanced/pitfalls",
    "https://r3f.docs.pmnd.rs/advanced/extending-threeJs",
    "https://r3f.docs.pmnd.rs/advanced/testing",
    "https://r3f.docs.pmnd.rs/advanced/exporting-objects",
    "https://r3f.docs.pmnd.rs/advanced/dispose-of-objects",
];

// ──────────────────────────────────────────────────────────
// DREI PAGES
// ──────────────────────────────────────────────────────────
const DREI_PAGES = [
    "https://drei.docs.pmnd.rs/getting-started/introduction",
    "https://drei.docs.pmnd.rs/controls/orbit-controls",
    "https://drei.docs.pmnd.rs/controls/presentation-controls",
    "https://drei.docs.pmnd.rs/controls/scroll-controls",
    "https://drei.docs.pmnd.rs/controls/transform-controls",
    "https://drei.docs.pmnd.rs/gizmos/pivot-controls",
    "https://drei.docs.pmnd.rs/abstractions/text",
    "https://drei.docs.pmnd.rs/abstractions/text3d",
    "https://drei.docs.pmnd.rs/abstractions/float",
    "https://drei.docs.pmnd.rs/abstractions/billboard",
    "https://drei.docs.pmnd.rs/abstractions/trail",
    "https://drei.docs.pmnd.rs/abstractions/sampler",
    "https://drei.docs.pmnd.rs/staging/environment",
    "https://drei.docs.pmnd.rs/staging/contact-shadows",
    "https://drei.docs.pmnd.rs/staging/accumulative-shadows",
    "https://drei.docs.pmnd.rs/staging/soft-shadows",
    "https://drei.docs.pmnd.rs/staging/sky",
    "https://drei.docs.pmnd.rs/staging/stars",
    "https://drei.docs.pmnd.rs/staging/sparkles",
    "https://drei.docs.pmnd.rs/staging/cloud",
    "https://drei.docs.pmnd.rs/staging/mesh-reflector-material",
    "https://drei.docs.pmnd.rs/staging/mesh-wobble-material",
    "https://drei.docs.pmnd.rs/staging/mesh-distort-material",
    "https://drei.docs.pmnd.rs/loaders/gltf-loader",
    "https://drei.docs.pmnd.rs/loaders/use-gltf",
    "https://drei.docs.pmnd.rs/loaders/use-texture",
    "https://drei.docs.pmnd.rs/loaders/use-fbx",
    "https://drei.docs.pmnd.rs/loaders/use-font",
    "https://drei.docs.pmnd.rs/loaders/use-progress",
    "https://drei.docs.pmnd.rs/performances/instances",
    "https://drei.docs.pmnd.rs/performances/merged",
    "https://drei.docs.pmnd.rs/performances/detail",
    "https://drei.docs.pmnd.rs/performances/preload",
    "https://drei.docs.pmnd.rs/portals/view",
    "https://drei.docs.pmnd.rs/portals/html",
    "https://drei.docs.pmnd.rs/cameras/camera-controls",
    "https://drei.docs.pmnd.rs/cameras/perspective-camera",
    "https://drei.docs.pmnd.rs/cameras/orthographic-camera",
    "https://drei.docs.pmnd.rs/misc/use-helper",
    "https://drei.docs.pmnd.rs/misc/stats",
    "https://drei.docs.pmnd.rs/misc/grid",
    "https://drei.docs.pmnd.rs/shapes/shapes",
    "https://drei.docs.pmnd.rs/shapes/rounded-box",
    "https://drei.docs.pmnd.rs/shaders/mesh-portal-material",
    "https://drei.docs.pmnd.rs/shaders/shader-material",
];

async function crawlR3FDocs(splitter: RecursiveCharacterTextSplitter): Promise<Document[]> {
    console.log(`\n[R3F] Crawling ${R3F_PAGES.length} pages...\n`);
    const docs: Document[] = [];
    let scraped = 0;

    for (const url of R3F_PAGES) {
        // Try Firecrawl first (handles JS-rendered pages better), fallback to Cheerio
        let content = await firecrawlScrape(url);
        if (!content || content.length < 100) content = await cheerioScrape(url);
        if (!content || content.length < 80) {
            console.warn(`  [R3F] ✗ Skipped: ${url}`);
            await sleep(SCRAPE_DELAY);
            continue;
        }

        const pageName = url.split("/").pop() || url;
        const enriched = `# React Three Fiber — ${pageName}\nURL: ${url}\n\n${content}`;
        const chunks = await splitter.splitText(enriched);
        const validChunks = chunks.filter((c) => c.trim().length >= 50);

        validChunks.forEach((chunk) => {
            docs.push(new Document({
                pageContent: chunk.trim(),
                metadata: { module: "r3f", url, title: pageName, source: "r3f-crawl" },
            }));
        });

        scraped++;
        console.log(`  [R3F] ✓ ${pageName} → ${validChunks.length} chunks`);
        await sleep(SCRAPE_DELAY);
    }

    console.log(`\n[R3F] ✅ ${scraped}/${R3F_PAGES.length} pages, ${docs.length} chunks`);
    return docs;
}

async function crawlDreiDocs(splitter: RecursiveCharacterTextSplitter): Promise<Document[]> {
    console.log(`\n[Drei] Crawling ${DREI_PAGES.length} pages...\n`);
    const docs: Document[] = [];
    let scraped = 0;

    for (const url of DREI_PAGES) {
        let content = await firecrawlScrape(url);
        if (!content || content.length < 100) content = await cheerioScrape(url);
        if (!content || content.length < 80) {
            console.warn(`  [Drei] ✗ Skipped: ${url}`);
            await sleep(SCRAPE_DELAY);
            continue;
        }

        const pageName = url.split("/").pop() || url;
        const enriched = `# Drei — ${pageName}\nURL: ${url}\n\n${content}`;
        const chunks = await splitter.splitText(enriched);
        const validChunks = chunks.filter((c) => c.trim().length >= 50);

        validChunks.forEach((chunk) => {
            docs.push(new Document({
                pageContent: chunk.trim(),
                metadata: { module: "drei", url, title: pageName, source: "drei-crawl" },
            }));
        });

        scraped++;
        console.log(`  [Drei] ✓ ${pageName} → ${validChunks.length} chunks`);
        await sleep(SCRAPE_DELAY);
    }

    console.log(`\n[Drei] ✅ ${scraped}/${DREI_PAGES.length} pages, ${docs.length} chunks`);
    return docs;
}

// ──────────────────────────────────────────────────────────
// SUPPLEMENTAL SEARCH (Tavily — tutorials & examples)
// ──────────────────────────────────────────────────────────
const SUPPLEMENTAL_QUERIES = [
    "react three fiber complete tutorial with code examples",
    "drei OrbitControls Environment Float Text ContactShadows usage",
    "react three fiber useFrame animation rotating objects",
    "react three fiber loading GLTF models useGLTF example",
    "react three fiber Html overlay UI components example",
    "three.js ShaderMaterial GLSL vertex fragment shader example",
    "react three fiber performance optimization instancing",
    "react three fiber product showcase landing page 3d example",
];

async function crawlSupplemental(splitter: RecursiveCharacterTextSplitter, seenUrls: Set<string>): Promise<Document[]> {
    if (!process.env.TAVILY_API_KEY) {
        console.log("\n[Supplemental] No TAVILY_API_KEY — skipping\n");
        return [];
    }

    console.log(`\n[Supplemental] ${SUPPLEMENTAL_QUERIES.length} Tavily searches...\n`);
    const docs: Document[] = [];

    for (const query of SUPPLEMENTAL_QUERIES) {
        const results = await tavilySearch(query, 2);
        await sleep(500);

        for (const result of results) {
            if (seenUrls.has(result.url) || !result.content) continue;
            seenUrls.add(result.url);

            const enriched = `# Tutorial: ${query}\nURL: ${result.url}\n\n${result.content}`;
            const chunks = await splitter.splitText(enriched);
            const valid = chunks.filter((c) => c.trim().length >= 50);
            valid.forEach((chunk) => {
                docs.push(new Document({
                    pageContent: chunk.trim(),
                    metadata: { module: detectModule(result.url), url: result.url, source: "tavily" },
                }));
            });
            console.log(`  [Supplemental] ✓ ${result.url.slice(0, 70)} → ${valid.length} chunks`);
        }
    }

    console.log(`\n[Supplemental] ✅ ${docs.length} chunks`);
    return docs;
}

// ──────────────────────────────────────────────────────────
// INGEST — main entry point
// ──────────────────────────────────────────────────────────
export async function ingestDocumentation(): Promise<{ urlsProcessed: number; chunksStored: number }> {
    console.log("\n🚀 Full 3D Documentation Ingestion");
    console.log("   Phase 1 — Three.js : llms-full.txt intro + all class .html.md pages (FREE, no API)");
    console.log("   Phase 2 — R3F      : all official docs pages");
    console.log("   Phase 3 — Drei     : all component pages");
    console.log("   Phase 4 — Extras   : Tavily tutorial search\n");

    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: CHUNK_SIZE, chunkOverlap: CHUNK_OVERLAP });
    const seenUrls = new Set<string>();
    const allDocs: Document[] = [];

    // Phase 1
    console.log("═══════════════════════════════════════");
    console.log("PHASE 1: Three.js Complete Documentation");
    console.log("═══════════════════════════════════════");
    const threejsDocs = await crawlThreeJsDocs(splitter);
    threejsDocs.forEach((d) => { seenUrls.add((d.metadata as any).url); allDocs.push(d); });

    // Phase 2
    console.log("\n═══════════════════════════════════════");
    console.log("PHASE 2: React Three Fiber");
    console.log("═══════════════════════════════════════");
    const r3fDocs = await crawlR3FDocs(splitter);
    r3fDocs.forEach((d) => { seenUrls.add((d.metadata as any).url); allDocs.push(d); });

    // Phase 3
    console.log("\n═══════════════════════════════════════");
    console.log("PHASE 3: Drei (react-three-drei)");
    console.log("═══════════════════════════════════════");
    const dreiDocs = await crawlDreiDocs(splitter);
    dreiDocs.forEach((d) => { seenUrls.add((d.metadata as any).url); allDocs.push(d); });

    // Phase 4
    console.log("\n═══════════════════════════════════════");
    console.log("PHASE 4: Supplemental Tutorials");
    console.log("═══════════════════════════════════════");
    const suppDocs = await crawlSupplemental(splitter, seenUrls);
    allDocs.push(...suppDocs);

    if (allDocs.length === 0) throw new Error("No docs ingested. Check network.");

    // ── DEDUPLICATION: remove exact-duplicate page content before embedding ──
    const seenContent = new Set<string>();
    const dedupedDocs: Document[] = [];
    for (const doc of allDocs) {
        const key = doc.pageContent.replace(/\s+/g, " ").trim().toLowerCase();
        if (key.length < 50) continue; // drop surviving junk
        if (!seenContent.has(key)) {
            seenContent.add(key);
            dedupedDocs.push(doc);
        }
    }
    const dupCount = allDocs.length - dedupedDocs.length;
    if (dupCount > 0) console.log(`\n[Dedup] Removed ${dupCount} duplicate chunks (${allDocs.length} → ${dedupedDocs.length})`);

    console.log("\n═══════════════════════════════════════");
    console.log("SUMMARY");
    console.log("═══════════════════════════════════════");
    console.log(`  Three.js:      ${threejsDocs.length} chunks`);
    console.log(`  R3F:           ${r3fDocs.length} chunks`);
    console.log(`  Drei:          ${dreiDocs.length} chunks`);
    console.log(`  Supplemental:  ${suppDocs.length} chunks`);
    console.log(`  Duplicates:    -${dupCount} removed`);
    console.log(`  ─────────────────────────────────────`);
    console.log(`  TOTAL:         ${dedupedDocs.length} chunks (${allDocs.length} before dedup) | ${seenUrls.size} URLs`);
    console.log("\n⏳ Embedding with key rotation...\n");

    const keys = getGeminiKeys();
    const embeddings = new RotatingBatchedEmbeddings(keys, TaskType.RETRIEVAL_DOCUMENT);
    const vectorStore = await HNSWLib.fromDocuments(dedupedDocs, embeddings);

    if (!fs.existsSync(HNSW_PERSIST_DIR)) fs.mkdirSync(HNSW_PERSIST_DIR, { recursive: true });
    await vectorStore.save(HNSW_PERSIST_DIR);

    const meta = {
        ingestedAt: new Date().toISOString(),
        totalChunks: dedupedDocs.length,
        rawChunks: allDocs.length,
        duplicatesRemoved: dupCount,
        uniqueUrls: seenUrls.size,
        breakdown: { threejs: threejsDocs.length, r3f: r3fDocs.length, drei: dreiDocs.length, supplemental: suppDocs.length },
        urls: Array.from(seenUrls),
    };
    fs.writeFileSync(path.join(HNSW_PERSIST_DIR, "ingestion-meta.json"), JSON.stringify(meta, null, 2));

    console.log(`\n💾 Saved → ${HNSW_PERSIST_DIR}`);
    console.log(`✅ Done!\n`);
    return { urlsProcessed: seenUrls.size, chunksStored: dedupedDocs.length };
}

// ──────────────────────────────────────────────────────────
// QUERY
// ──────────────────────────────────────────────────────────
export async function queryDocumentation(query: string) {
    if (!query?.trim()) throw new Error("Query cannot be empty");

    const keys = getGeminiKeys();
    const embeddings = new RotatingBatchedEmbeddings(keys, TaskType.RETRIEVAL_QUERY);

    let vectorStore: HNSWLib;
    try {
        vectorStore = await HNSWLib.load(HNSW_PERSIST_DIR, embeddings);
    } catch {
        return { query, retrievedChunks: 0, context: "Vector store not found. Run POST /ingest-3d first.", sources: [] as { module: string; url: string; title: string }[] };
    }

    const candidates = await vectorStore.similaritySearch(query, FETCH_CANDIDATES);

    const seenKeys = new Set<string>();
    const uniqueResults: typeof candidates = [];

    for (const doc of candidates) {
        const meta = doc.metadata as { module?: string; url?: string; title?: string };
        const dedupeKey = `${meta.url || ""}::${meta.title || ""}`;

        if (seenKeys.has(dedupeKey)) continue;
        seenKeys.add(dedupeKey);
        uniqueResults.push(doc);

        if (uniqueResults.length >= TOP_K) break;
    }

    const contextParts = uniqueResults.map((doc, i) => {
        const meta = doc.metadata as { module?: string; url?: string; title?: string };
        return [
            `--- Chunk ${i + 1} ---`,
            `Module: ${meta.module ?? "unknown"}`,
            `Title: ${meta.title ?? ""}`,
            `Source: ${meta.url ?? "unknown"}`,
            `Content: ${doc.pageContent}`,
        ].join("\n");
    });

    const context = [
        "You are a React Three Fiber expert.",
        "Use this 3D documentation context to answer:",
        "",
        ...contextParts,
        "",
        `User Query: ${query}`,
    ].join("\n");

    const sources = uniqueResults.map((doc) => ({
        module: (doc.metadata as any).module || "",
        url: (doc.metadata as any).url || "",
        title: (doc.metadata as any).title || "",
    }));

    console.log(`[Query] "${query}" -> ${candidates.length} candidates -> ${uniqueResults.length} unique results`);

    return { query, retrievedChunks: uniqueResults.length, context, sources };
}

// ──────────────────────────────────────────────────────────
// LIVE SEARCH CONTEXT (runs on every /generate-3d call)
// ──────────────────────────────────────────────────────────
async function buildLiveSearchContext(prompt: string): Promise<{ context: string; sources: { url: string; module: string }[] }> {
    console.log(`[LiveSearch] "${prompt}"`);

    const queries = [
        `react three fiber ${prompt} example tutorial`,
        `drei components ${prompt} react 3d code`,
        `three.js ${prompt} implementation example`,
    ];

    const allContent: string[] = [];
    const sources: { url: string; module: string }[] = [];
    const seenUrls = new Set<string>();

    for (const query of queries) {
        let results: { url: string; content: string }[] = [];

        if (process.env.TAVILY_API_KEY) {
            results = await tavilySearch(query, 2);
        } else if (process.env.FIRECRAWL_API_KEY) {
            try {
                const { data } = await axios.post(
                    "https://api.firecrawl.dev/v1/search",
                    { query, limit: 2, scrapeOptions: { formats: ["markdown"] } },
                    { headers: { Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`, "Content-Type": "application/json" }, timeout: 25000 }
                );
                results = (data?.data || [])
                    .map((item: any) => ({ url: item.url || "", content: (item.markdown || item.content || "").slice(0, 20000) }))
                    .filter((r: any) => r.url && r.content.length > 100);
            } catch (_) { }
        }

        await sleep(400);
        for (const r of results) {
            if (seenUrls.has(r.url)) continue;
            seenUrls.add(r.url);
            allContent.push(`--- From: ${r.url} ---\n${r.content.slice(0, 3500)}`);
            sources.push({ url: r.url, module: detectModule(r.url) });
            console.log(`  ✅ ${r.url.slice(0, 70)}`);
        }
    }

    if (!allContent.length) { console.warn("[LiveSearch] No results — using RAG only"); return { context: "", sources: [] }; }
    return { context: allContent.join("\n\n"), sources };
}

// ──────────────────────────────────────────────────────────
// GENERATE COMPONENT
// ──────────────────────────────────────────────────────────
export async function generateComponent(prompt: string) {
    if (!prompt?.trim()) throw new Error("Prompt cannot be empty");

    const apiKey = process.env.gemini123;
    if (!apiKey) throw new Error("gemini123 key missing in .env");

    const sanitized = prompt.trim().substring(0, 1000);
    console.log(`\n[Generate] "${sanitized}"`);

    // Step 1: Live search (prompt-specific)
    let liveContext = "";
    let liveSources: { url: string; module: string }[] = [];
    if (process.env.TAVILY_API_KEY || process.env.FIRECRAWL_API_KEY) {
        const lr = await buildLiveSearchContext(sanitized);
        liveContext = lr.context;
        liveSources = lr.sources;
    }

    // Step 2: RAG vector store
    console.log("[Generate] 📚 RAG lookup...");
    const ragResult = await queryDocumentation(sanitized);
    console.log(`[Generate] RAG: ${ragResult.retrievedChunks} chunks | Live: ${liveSources.length} pages`);

    // Step 3: Merge contexts — live first (most specific), RAG as backup
    const mergedContext = [
        liveContext ? `=== LIVE SEARCH (real-time) ===\n${liveContext}` : "",
        ragResult.retrievedChunks > 0 ? `=== RAG DOCUMENTATION ===\n${ragResult.context}` : "",
    ].filter(Boolean).join("\n\n");

    // Step 4: Generate
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const fullPrompt = [
        "You are an expert React Three Fiber developer.",
        "Generate a SINGLE complete, self-contained React component (.tsx).",
        "STRICT RULES:",
        "- Use @react-three/fiber Canvas",
        "- Use @react-three/drei: OrbitControls, Environment, Float, Text, ContactShadows, Html, Stars, etc.",
        "- Include ALL imports at the top",
        "- Add proper lighting: ambientLight + directionalLight or spotLight",
        "- Use useFrame for smooth animations",
        "- Export as default",
        "- Zero comments in the code",
        "- Real working code only — no placeholders",
        "- Make it visually impressive and fully match the prompt",
        "",
        "DOCUMENTATION CONTEXT (from live search + RAG knowledge base):",
        mergedContext || "Use your expert React Three Fiber knowledge.",
        "",
        `Create a complete 3D React component for: ${sanitized}`,
    ].join("\n");

    console.log("[Generate] Calling Gemini...");

    let retries = 3;
    let backoff = 20000;
    while (retries > 0) {
        try {
            const result = await model.generateContent(fullPrompt);
            const responseText: string = result.response.text() || "";
            const match = responseText.match(/```(?:tsx|jsx|typescript|javascript)?\n([\s\S]*?)```/);
            const component = match ? match[1].trim() : responseText.trim();
            console.log(`[Generate] ✅ ${component.length} chars | ${liveSources.length + ragResult.sources.length} sources`);
            return { prompt: sanitized, component, sources: [...liveSources, ...ragResult.sources] };
        } catch (err: any) {
            retries--;
            if (err.message?.includes("429") && retries > 0) {
                console.warn(`[Generate] Rate limited — waiting ${backoff / 1000}s (${retries} retries left)`);
                await sleep(backoff);
                backoff *= 2;
            } else throw err;
        }
    }
    throw new Error("Generation failed after all retries.");
}

// ──────────────────────────────────────────────────────────
// TEST
// ──────────────────────────────────────────────────────────
export async function testPipeline() {
    const metaPath = path.join(HNSW_PERSIST_DIR, "ingestion-meta.json");
    if (fs.existsSync(metaPath)) {
        const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
        console.log("\n📋 Ingestion metadata:", { ingestedAt: meta.ingestedAt, totalChunks: meta.totalChunks, breakdown: meta.breakdown });
    }

    const result = await queryDocumentation("PerspectiveCamera animation react three fiber");
    console.log("\n✅ Test:");
    console.log("  Chunks:", result.retrievedChunks);
    console.log("  Sources:", result.sources.map(s => s.url));
    return { success: true, chunksRetrieved: result.retrievedChunks };
}