import { WebsiteState, ProjectMemory } from './graph-state';

export function initProjectMemory(state: WebsiteState): ProjectMemory {
    const blueprint = state.blueprint;
    const theme = state.dynamicTheme;

    return {
        projectName: blueprint?.projectName || 'generated-project',
        siteType: state.projectType || 'frontend',
        colorPalette: {
            primary: theme?.palette?.primary || blueprint?.designSystem?.primaryColor || '#6366f1',
            secondary: theme?.palette?.secondary || blueprint?.designSystem?.secondaryColor || '#8b5cf6',
            accent: theme?.palette?.accent || blueprint?.designSystem?.accentColor || '#f59e0b',
            background: theme?.palette?.background || '#0a0a0a',
            text: theme?.palette?.surface || '#ffffff',
        },
        typography: {
            heading: theme?.fonts?.heading || blueprint?.designSystem?.fonts?.[0] || 'Inter',
            body: theme?.fonts?.body || blueprint?.designSystem?.fonts?.[1] || 'Inter',
        },
        designTokens: {
            borderRadius: '0.75rem',
            shadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            ...(theme?.extendedPackages || {}),
        },
        sections: blueprint?.pages?.flatMap(p => p.sections || []) || [],
        componentsGenerated: [],
        pagesGenerated: [],
        is3D: state.enable3D || false,
        threeDModules: state.threeDModules || [],
        ragContext: state.ragContext || '',
        threeDDependencies: {},
        threeDComponentPaths: [],
        threeDImportInstructions: '',
        narrativeStyle: '',
    };
}

export function getMemoryContext(memory: ProjectMemory): string {
    const lines: string[] = [
        `PROJECT: ${memory.projectName} (${memory.siteType})`,
        `COLORS: primary=${memory.colorPalette.primary}, secondary=${memory.colorPalette.secondary}, accent=${memory.colorPalette.accent}, bg=${memory.colorPalette.background}`,
        `FONTS: heading=${memory.typography.heading}, body=${memory.typography.body}`,
    ];

    if (memory.componentsGenerated.length > 0) {
        lines.push(`COMPONENTS ALREADY GENERATED: ${memory.componentsGenerated.join(', ')}`);
    }
    if (memory.pagesGenerated.length > 0) {
        lines.push(`PAGES ALREADY GENERATED: ${memory.pagesGenerated.join(', ')}`);
    }
    if (memory.narrativeStyle) {
        lines.push(`NARRATIVE STYLE: ${memory.narrativeStyle}`);
    }
    if (memory.is3D) {
        lines.push(`3D MODE: enabled`);
        if (memory.threeDModules.length > 0) {
            lines.push(`3D MODULES AVAILABLE: ${memory.threeDModules.join(', ')}`);
        }
        if (memory.threeDComponentPaths.length > 0) {
            lines.push(`3D COMPONENTS GENERATED: ${memory.threeDComponentPaths.join(', ')}`);
        }
        if (memory.threeDImportInstructions) {
            lines.push(`\n3D INTEGRATION INSTRUCTIONS:\n${memory.threeDImportInstructions}`);
        }
    }

    return lines.join('\n');
}

export function updateMemoryComponents(memory: ProjectMemory, componentNames: string[]): ProjectMemory {
    return {
        ...memory,
        componentsGenerated: [...memory.componentsGenerated, ...componentNames],
    };
}

export function updateMemoryPages(memory: ProjectMemory, pageNames: string[]): ProjectMemory {
    return {
        ...memory,
        pagesGenerated: [...memory.pagesGenerated, ...pageNames],
    };
}

export function updateMemory3D(
    memory: ProjectMemory,
    componentPaths: string[],
    importInstructions: string
): ProjectMemory {
    return {
        ...memory,
        threeDComponentPaths: [...memory.threeDComponentPaths, ...componentPaths],
        threeDImportInstructions: importInstructions,
    };
}
