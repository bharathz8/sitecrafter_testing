// fix-docstore.ts
import * as fs from "fs";
import * as path from "path";

const docstorePath = path.join(process.cwd(), "hnsw_3d_docs", "docstore.json");
const raw = JSON.parse(fs.readFileSync(docstorePath, "utf-8"));

// Convert {0: {...}, 1: {...}} → [[0, {...}], [1, {...}]]
const converted = Object.entries(raw).map(([k, v]) => [k, v]);

fs.writeFileSync(docstorePath, JSON.stringify(converted));
console.log(`✅ Converted ${converted.length} docs to TypeScript format`);