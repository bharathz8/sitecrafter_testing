import { WebsiteState } from '../graph-state';
import { isVectorStoreReady, getVectorStoreAge, ingestDocumentation } from '../../../rag/rag-3d';

// ─── Change this to control re-ingestion frequency ───────────────────────────
// Set to Infinity to NEVER re-ingest automatically (recommended once you have
// a good hnsw_3d_docs store). To force a fresh crawl, delete the
// hnsw_3d_docs/ folder and restart — the node will rebuild it once, then stop.
const REINGEST_AFTER_MS = Infinity; // was: 7 * 24 * 60 * 60 * 1000 (7 days)
// ─────────────────────────────────────────────────────────────────────────────

export async function crawl3DModulesNode(state: WebsiteState): Promise<Partial<WebsiteState>> {
    console.log('\n[crawl-3d-modules] Checking 3D documentation store...');

    if (!state.enable3D) {
        console.log('[crawl-3d-modules] 3D not enabled, skipping.');
        return { currentPhase: 'crawl_3d_skip', messages: ['3D crawl skipped -- not enabled'] };
    }

    const storeReady = isVectorStoreReady();
    const storeAge = getVectorStoreAge();

    if (storeReady && storeAge < REINGEST_AFTER_MS) {
        const ageDays = isFinite(storeAge)
            ? `${Math.round(storeAge / (24 * 60 * 60 * 1000))}d old`
            : 'age unknown';
        console.log(`[crawl-3d-modules] Vector store is ready (${ageDays}), skipping re-ingestion.`);
        console.log(`[crawl-3d-modules] To force a fresh crawl: delete hnsw_3d_docs/ and restart.`);
        return {
            currentPhase: 'crawl_3d_complete',
            messages: [`3D RAG store ready (${ageDays}), using existing store`],
        };
    }

    if (!storeReady) {
        console.log('[crawl-3d-modules] Vector store missing — running first-time ingestion...');
    } else {
        console.log('[crawl-3d-modules] Store older than threshold — re-ingesting...');
    }

    try {
        const result = await ingestDocumentation();
        console.log(`[crawl-3d-modules] Ingestion complete: ${result.chunksStored} chunks from ${result.urlsProcessed} URLs`);
        return {
            currentPhase: 'crawl_3d_complete',
            messages: [`3D docs ingested: ${result.chunksStored} chunks from ${result.urlsProcessed} URLs`],
        };
    } catch (err: any) {
        console.error('[crawl-3d-modules] Ingestion failed:', err.message);
        return {
            currentPhase: 'crawl_3d_complete',
            messages: [`3D ingestion failed (${err.message}), proceeding with existing store`],
        };
    }
}