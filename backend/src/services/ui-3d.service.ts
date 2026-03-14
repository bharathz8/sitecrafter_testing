import OpenAI from "openai";
import { chatCompletionWithRetry } from "../utils/openaiRetry";
import { queryDocumentation, isVectorStoreReady } from "../rag/rag-3d";
import crypto from "crypto";

const apiKeys = [
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
].filter(key => key && key.length > 0) as string[];

let currentKeyIndex = 0;

function getClient(): OpenAI {
    const apiKey = apiKeys[currentKeyIndex] || process.env.gemini3;
    return new OpenAI({
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        apiKey: apiKey as string,
    });
}

function rotateApiKey(): void {
    if (apiKeys.length > 1) {
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        console.log(`[UI3D] Rotated to key ${currentKeyIndex + 1}/${apiKeys.length}`);
    }
}

const UI3D_MODEL = "gemini-2.5-flash-lite";

interface RAGChunk {
    content: string;
    module: string;
    url: string;
    hash: string;
}

export interface UI3DSelectionResult {
    selectedChunks: RAGChunk[];
    formattedForPrompt: string;
    queryCount: number;
}

const selectionCache: Map<string, UI3DSelectionResult> = new Map();

export class UI3DService {

    static async selectComponents(requirements: string): Promise<UI3DSelectionResult> {
        const cacheKey = requirements.trim().slice(0, 200);
        if (selectionCache.has(cacheKey)) {
            console.log("[UI3D] Using cached 3D component selection");
            return selectionCache.get(cacheKey)!;
        }

        if (!isVectorStoreReady()) {
            console.warn("[UI3D] Vector store not ready, returning empty result");
            return { selectedChunks: [], formattedForPrompt: "", queryCount: 0 };
        }

        const queries = await this.generateSmartQueries(requirements);
        console.log(`[UI3D] Generated ${queries.length} smart RAG queries`);

        const allChunks: RAGChunk[] = [];
        const seenHashes = new Set<string>();

        const addChunk = (content: string, mod: string, url: string) => {
            if (content.trim().length < 50) return;
            const hash = crypto
                .createHash("md5")
                .update(content.trim().toLowerCase().replace(/\s+/g, " "))
                .digest("hex");
            if (!seenHashes.has(hash)) {
                seenHashes.add(hash);
                allChunks.push({ content: content.trim(), module: mod, url, hash });
            }
        };

        for (const query of queries) {
            try {
                const result = await queryDocumentation(query);
                if (result.retrievedChunks > 0 && result.context) {
                    const chunkParts = result.context.split("--- Chunk");
                    for (const part of chunkParts) {
                        const moduleMatch = part.match(/Module:\s*(\S+)/);
                        const urlMatch = part.match(/Source:\s*(\S+)/);
                        addChunk(part, moduleMatch?.[1] || query, urlMatch?.[1] || "");
                    }
                }
                console.log(`  [UI3D] "${query}": ${result.retrievedChunks} chunks`);
            } catch (err: any) {
                console.warn(`  [UI3D] Query failed for "${query}": ${err.message?.slice(0, 60)}`);
            }
        }

        const defaultQueries = [
            "React Three Fiber Canvas setup ScrollControls",
            "Drei Float Sparkles ContactShadows Stars",
            "MeshDistortMaterial MeshWobbleMaterial drei meshPhysicalMaterial",
            "useFrame animation loop useScroll scroll-linked drei",
            "EffectComposer Bloom Vignette postprocessing",
        ];

        for (const query of defaultQueries) {
            try {
                const result = await queryDocumentation(query);
                if (result.retrievedChunks > 0 && result.context) {
                    const chunkParts = result.context.split("--- Chunk");
                    for (const part of chunkParts) {
                        const moduleMatch = part.match(/Module:\s*(\S+)/);
                        const urlMatch = part.match(/Source:\s*(\S+)/);
                        addChunk(part, moduleMatch?.[1] || query, urlMatch?.[1] || "");
                    }
                }
            } catch {
                // silent fallback
            }
        }

        console.log(`[UI3D] Total unique chunks collected: ${allChunks.length}`);

        const rankedChunks = this.rankChunks(allChunks, requirements);
        const topChunks = rankedChunks.slice(0, 30);

        const formattedForPrompt = this.formatChunksForPrompt(topChunks);

        console.log(`[UI3D] Formatted ${topChunks.length} chunks for prompt (${formattedForPrompt.length} chars)`);

        const result: UI3DSelectionResult = {
            selectedChunks: topChunks,
            formattedForPrompt,
            queryCount: queries.length + defaultQueries.length,
        };

        selectionCache.set(cacheKey, result);
        return result;
    }

    private static async generateSmartQueries(requirements: string): Promise<string[]> {
        const maxRetries = 2;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                rotateApiKey();
                const prompt = `You are a Three.js/React Three Fiber technical query generator.
Given this website idea: "${requirements.slice(0, 400)}"

Generate exactly 5 RAG search queries to find the most relevant R3F documentation chunks for building this as an immersive 3D website.

Target these areas:
1. Specific Drei helpers needed (Float, Sparkles, Stars, ContactShadows, etc.)
2. Three.js materials for the visual style (MeshDistortMaterial, meshPhysicalMaterial, etc.)
3. Animation patterns (useFrame, spring animations, scroll-linked motion)
4. Postprocessing effects (Bloom, Vignette, Noise)
5. Interactive 3D patterns (hover effects, click handlers, cursor changes)

Return ONLY a JSON array of 5 strings. No markdown, no explanation.
Example: ["react three fiber Float animation", "drei Sparkles particles effect", ...]`;

                const client = getClient();
                const response: any = await chatCompletionWithRetry(client, {
                    model: UI3D_MODEL,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7,
                });

                let content = response.choices[0]?.message?.content || "[]";
                content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

                const parsed = JSON.parse(content);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.slice(0, 5).map((q: any) => String(q));
                }
            } catch (err: any) {
                console.warn(`[UI3D] Smart query generation attempt ${attempt} failed: ${err.message?.slice(0, 60)}`);
                rotateApiKey();
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return [
            `react three fiber ${requirements.split(" ").slice(0, 4).join(" ")} 3D`,
            "drei helpers Float Sparkles ContactShadows Stars",
            "MeshDistortMaterial MeshWobbleMaterial meshPhysicalMaterial clearcoat",
            "useFrame animation scroll drei useScroll ScrollControls",
            "EffectComposer Bloom Vignette postprocessing react",
        ];
    }

    private static rankChunks(chunks: RAGChunk[], requirements: string): RAGChunk[] {
        const reqWords = requirements.toLowerCase().split(/\s+/);
        const highValueTerms = [
            "useframe", "usescroll", "float", "sparkles", "contactshadows",
            "meshdistortmaterial", "meshwobblematerial", "meshphysicalmaterial",
            "effectcomposer", "bloom", "vignette", "canvas", "scrollcontrols",
            "scroll", "environment", "drei", "fiber", "postprocessing",
            "animation", "interactive", "hover", "pointer", "geometry",
            "material", "light", "camera", "scene", "mesh", "group",
            "suspense", "lazy", "performance", "instancing",
        ];

        return chunks
            .map(chunk => {
                const contentLower = chunk.content.toLowerCase();
                let score = 0;

                for (const word of reqWords) {
                    if (contentLower.includes(word)) score += 2;
                }

                for (const term of highValueTerms) {
                    if (contentLower.includes(term)) score += 3;
                }

                if (contentLower.includes("example") || contentLower.includes("usage")) score += 5;
                if (contentLower.includes("import")) score += 4;
                if (contentLower.includes("props") || contentLower.includes("interface")) score += 3;

                if (chunk.content.length > 200 && chunk.content.length < 3000) score += 2;

                return { chunk, score };
            })
            .sort((a, b) => b.score - a.score)
            .map(item => item.chunk);
    }

    private static formatChunksForPrompt(chunks: RAGChunk[]): string {
        if (chunks.length === 0) return "";

        const formatted = chunks
            .map((chunk, i) => {
                return [
                    `--- 3D Reference ${i + 1} [${chunk.module}] ---`,
                    chunk.content.slice(0, 1500),
                    "",
                ].join("\n");
            })
            .join("\n");

        return `\n\n=== 3D COMPONENT DOCUMENTATION (${chunks.length} references from RAG) ===\n\nUse ONLY components, props, and patterns documented below. Do NOT hallucinate components or props that are not listed here.\n\n${formatted}`;
    }
}
