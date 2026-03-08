import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

const QUERIES = [
    "Float animation floating objects drei",
    "Environment preset warm lighting ContactShadows",
    "PresentationControls product showcase rotation",
    "Sparkles Stars particles scene",
    "Bloom postprocessing glow effect",
];

async function testRAG() {
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: "AIzaSyCjDjmTfUHjMuJThsomNYLOPmFO_NcD5go",
        model: "gemini-embedding-001",
        taskType: TaskType.RETRIEVAL_QUERY,
    });

    console.log("Loading vector store...");
    const store = await HNSWLib.load("./hnsw_3d_docs", embeddings);
    console.log("✅ Loaded\n");

    for (const query of QUERIES) {
        console.log(`\n${"=".repeat(60)}`);
        console.log(`Query: "${query}"`);
        console.log("=".repeat(60));

        const results = await store.similaritySearchWithScore(query, 8);

        // Deduplicate by URL
        const seen = new Set<string>();
        const unique = results.filter(([doc]) => {
            const url = doc.metadata.url;
            if (seen.has(url)) return false;
            seen.add(url);
            return true;
        }).slice(0, 5);

        unique.forEach(([doc, score], i) => {
            const isZero = score === 0;
            const flag = isZero ? "❌ ZERO" : "✅";
            console.log(`\n  [${i + 1}] ${flag} Score: ${score.toFixed(4)}`);
            console.log(`       Module : ${doc.metadata.module}`);
            console.log(`       URL    : ${doc.metadata.url}`);
            console.log(`       Preview: ${doc.pageContent.slice(0, 100)}...`);
        });
    }

    console.log("\n✅ RAG test complete");
}

testRAG().catch(console.error);