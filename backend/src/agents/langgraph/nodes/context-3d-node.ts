import { WebsiteState } from '../graph-state';
import { classifyIntents, resolveContext, formatDocsForPrompt } from '../../../services/context-3d.service';
import { notifyPhaseChange } from '../website-graph';

export async function context3DNode(state: WebsiteState): Promise<Partial<WebsiteState>> {
    console.log('\n[context-3d-node] Building per-request 3D documentation context...');

    notifyPhaseChange('context_3d');

    if (!state.enable3D) {
        console.log('[context-3d-node] 3D not enabled, skipping.');
        return { currentPhase: 'context_3d_skip', messages: ['3D context skipped -- not enabled'] };
    }

    const brief = state.detailedContext || state.expandedPrompt || state.userPrompt || '';

    if (!brief) {
        console.warn('[context-3d-node] No brief available for intent classification.');
        return { ragContext: '', currentPhase: 'context_3d_complete', messages: ['No brief for 3D context'] };
    }

    try {
        console.log('[context-3d-node] Step 1: Classifying intents from brief...');
        const intentTags = await classifyIntents(brief);

        console.log('[context-3d-node] Step 2: Resolving documentation from intents...');
        const resolved = await resolveContext(intentTags);

        console.log('[context-3d-node] Step 3: Formatting documentation for LLM prompt...');
        const ragContext = formatDocsForPrompt(resolved);

        console.log(`[context-3d-node] Context built: ${ragContext.length} chars from ${resolved.threejsDocs.length} Three.js docs + ${resolved.externalDocs.length} external docs`);

        return {
            ragContext,
            intentTags,
            currentPhase: 'context_3d_complete',
            messages: [
                `3D context: ${resolved.threejsDocs.length} Three.js docs + ${resolved.externalDocs.length} external docs (${intentTags.length} intents: ${intentTags.join(', ')})`,
            ],
        };
    } catch (err: any) {
        console.error('[context-3d-node] Failed to build context:', err.message);
        return {
            ragContext: '',
            intentTags: [],
            currentPhase: 'context_3d_complete',
            messages: [`3D context build failed: ${err.message}`],
        };
    }
}
