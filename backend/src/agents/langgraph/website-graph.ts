import { StateGraph, END } from '@langchain/langgraph';
import { WebsiteStateAnnotation, WebsiteState, GeneratedFile } from './graph-state';
import { blueprintNode } from './nodes/blueprint-node';
import { structureNode } from './nodes/structure-node';
import { coreNode } from './nodes/core-node';
import { componentNode } from './nodes/component-node';
import { pageNode } from './nodes/page-node';
import { validationNode } from './nodes/validation-node';
import { repairNode } from './nodes/repair-node';
import { intentRouterNode } from './nodes/intent-router-node';
import { chatResponseNode } from './nodes/chat-response-node';
import { modificationAnalyzerNode } from './nodes/modification-analyzer-node';
import { crawl3DModulesNode } from './nodes/crawl-3d-modules-node';
import { identify3DModulesNode } from './nodes/identify-3d-modules-node';
import { rag3DContextNode } from './nodes/rag-3d-context-node';
import { generate3DComponentNode } from './nodes/generate-3d-component-node';
import { tscValidationNode } from './nodes/tsc-validation-node';

let globalFileCallback: ((file: GeneratedFile) => void) | null = null;
let globalPhaseCallback: ((phase: string) => void) | null = null;

export function setFileCallback(cb: ((file: GeneratedFile) => void) | null) {
    globalFileCallback = cb;
}

export function setPhaseCallback(cb: ((phase: string) => void) | null) {
    globalPhaseCallback = cb;
}

export function notifyFileCreated(file: GeneratedFile) {
    if (globalFileCallback) {
        globalFileCallback(file);
    }
}

export function notifyPhaseChange(phase: string) {
    if (globalPhaseCallback) {
        globalPhaseCallback(phase);
    }
}

function buildGraph() {
    const workflow = new StateGraph(WebsiteStateAnnotation)
        .addNode('intent_router', intentRouterNode)
        .addNode('chat_response', chatResponseNode)
        .addNode('modification_analyzer', modificationAnalyzerNode)

        .addNode('blueprint_step', blueprintNode)

        .addNode('crawl_3d', crawl3DModulesNode)
        .addNode('identify_3d', identify3DModulesNode)
        .addNode('rag_3d_context', rag3DContextNode)

        .addNode('structure_step', structureNode)
        .addNode('core_step', coreNode)
        .addNode('components_step', componentNode)
        .addNode('generate_3d_components', generate3DComponentNode)
        .addNode('pages_step', pageNode)
        .addNode('tsc_validation', tscValidationNode)

        .addEdge('__start__', 'intent_router')

        .addConditionalEdges('intent_router', (state: WebsiteState) => {
            console.log(`\n Routing based on intent: ${state.requestIntent}`);

            switch (state.requestIntent) {
                case 'question':
                case 'explain':
                    console.log('   -> Routing to chat_response');
                    return 'chat_response';

                case 'modify':
                    console.log('   -> Routing to modification_analyzer');
                    return 'modification_analyzer';

                case 'create':
                default:
                    console.log('   -> Routing to blueprint_step (full creation)');
                    return 'blueprint_step';
            }
        }, {
            'chat_response': 'chat_response',
            'modification_analyzer': 'modification_analyzer',
            'blueprint_step': 'blueprint_step'
        })

        .addEdge('chat_response', END)
        .addEdge('modification_analyzer', END)

        .addConditionalEdges('blueprint_step', (state: WebsiteState) => {
            if (state.enable3D) {
                console.log('   -> 3D enabled, routing to crawl_3d');
                return 'crawl_3d';
            }
            console.log('   -> Standard pipeline, routing to structure_step');
            return 'structure_step';
        }, {
            'crawl_3d': 'crawl_3d',
            'structure_step': 'structure_step'
        })

        .addEdge('crawl_3d', 'identify_3d')
        .addEdge('identify_3d', 'rag_3d_context')
        .addEdge('rag_3d_context', 'structure_step')

        .addEdge('structure_step', 'core_step')

        .addConditionalEdges('core_step', (state: WebsiteState) => {
            if (state.enable3D) {
                console.log('   -> 3D enabled, skipping 2D components, routing to generate_3d_components');
                return 'generate_3d_components';
            }
            console.log('   -> Standard pipeline, routing to components_step');
            return 'components_step';
        }, {
            'generate_3d_components': 'generate_3d_components',
            'components_step': 'components_step'
        })

        .addEdge('components_step', 'pages_step')

        .addEdge('generate_3d_components', 'pages_step')
        .addEdge('pages_step', 'tsc_validation')
        .addEdge('tsc_validation', END);

    return workflow.compile();
}

export const websiteGraph = buildGraph();

export async function generateWebsite(
    userPrompt: string,
    projectType: 'frontend' | 'backend' | 'fullstack' = 'frontend',
    onFileGenerated?: (file: GeneratedFile) => void,
    onPhaseChange?: (phase: string) => void,
    enable3D: boolean = false
): Promise<{ files: Map<string, GeneratedFile>; errors: any[]; messages: string[] }> {
    console.log('\n ===============================================');
    console.log(' STARTING LANGGRAPH WEBSITE GENERATOR');
    console.log(` 3D Mode: ${enable3D ? 'ENABLED' : 'disabled'}`);
    console.log(' ===============================================\n');

    const startTime = Date.now();

    setFileCallback(onFileGenerated || null);
    setPhaseCallback(onPhaseChange || null);

    try {
        const initialState = {
            userPrompt,
            projectType,
            enable3D,
            blueprint: null,
            files: new Map(),
            fileRegistry: new Map(),
            errors: [],
            iterationCount: 0,
            currentPhase: 'init',
            isComplete: false,
            messages: [],
            threeDModules: [],
            ragContext: '',
            projectMemory: null,
        };

        const result = await websiteGraph.invoke(initialState);

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log('\n===============================================');
        console.log(' GENERATION COMPLETE');
        console.log('===============================================');
        console.log(`   Duration: ${duration}s`);
        console.log(`   Files: ${result.files.size}`);
        console.log(`   Errors: ${result.errors.length}`);
        console.log(`   3D: ${enable3D ? 'yes' : 'no'}`);
        console.log('===============================================\n');

        return {
            files: result.files,
            errors: result.errors,
            messages: result.messages
        };

    } catch (error: any) {
        console.error('\n Generation failed:', error.message);
        throw error;
    } finally {
        setFileCallback(null);
        setPhaseCallback(null);
    }
}

export { WebsiteState, GeneratedFile };
