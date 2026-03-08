import { WebsiteState } from '../graph-state';
import { isVectorStoreReady, getVectorStoreAge, ingestDocumentation } from '../../../rag/rag-3d';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function crawl3DModulesNode(state: WebsiteState): Promise<Partial<WebsiteState>> {
    console.log('\n[crawl-3d-modules] Starting 3D documentation crawl check...');

    if (!state.enable3D) {
        console.log('[crawl-3d-modules] 3D not enabled, skipping.');
        return { currentPhase: 'crawl_3d_skip', messages: ['3D crawl skipped -- not enabled'] };
    }

    const storeReady = isVectorStoreReady();
    const storeAge = getVectorStoreAge();

    if (storeReady && storeAge < SEVEN_DAYS_MS) {
        const ageDays = Math.round(storeAge / (24 * 60 * 60 * 1000));
        console.log(`[crawl-3d-modules] Vector store is fresh (${ageDays} days old), skipping re-ingestion.`);
        return {
            currentPhase: 'crawl_3d_complete',
            messages: [`3D RAG store ready (${ageDays}d old), skipping re-ingestion`],
        };
    }

    console.log('[crawl-3d-modules] Vector store missing or stale, running full ingestion...');
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
            messages: [`3D ingestion failed (${err.message}), proceeding with existing store or LLM knowledge`],
        };
    }
}
