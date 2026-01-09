/**
 * Blueprint Node - Generates project blueprint using PlanningService
 * Uses autonomous multi-phase planning for dynamic feature ideation
 */

import { WebsiteState, ProjectBlueprint } from '../graph-state';
import { storeBlueprintMemory, clearProjectMemory, generateProjectId } from '../memory-utils';
import { fetchProjectImages, storeImagesInMemory, UnsplashImage } from '../services/image.service';
import { PlanningService } from '../../../services/planning-fixed.service';

// Complete list of dependencies
const STANDARD_DEPENDENCIES: Record<string, string> = {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.1.1",
    "framer-motion": "^11.14.4",
    "lucide-react": "^0.460.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "react-hook-form": "^7.54.0",
    "@hookform/resolvers": "^3.9.1",
    "zod": "^3.24.1",
    "zustand": "^5.0.2",
    "@tanstack/react-query": "^5.62.2",
    "axios": "^1.7.9",
    "sonner": "^1.7.3",
    "date-fns": "^4.1.0",
    "gsap": "^3.12.5"
};

const DEV_DEPENDENCIES: Record<string, string> = {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/node": "^22.10.2",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.2",
    "vite": "^6.0.5",
    "eslint": "^9.16.0"
};

export async function blueprintNode(state: WebsiteState): Promise<Partial<WebsiteState>> {
    console.log('\n📋 ═══════════════════════════════════════════');
    console.log('📋 NODE: BLUEPRINT (DYNAMIC PLANNING)');
    console.log('📋 ═══════════════════════════════════════════\n');

    try {
        console.log('🤖 Starting autonomous planning...');
        console.log(`   User Request: "${state.userPrompt.slice(0, 100)}..."`);
        console.log(`   Project Type: ${state.projectType || 'frontend'}`);

        // Use PlanningService for autonomous multi-phase planning
        const planningResponse = await PlanningService.generateBlueprint(
            state.userPrompt,
            0, // retry count
            state.projectType || 'frontend'
        );

        if (!planningResponse.success || !planningResponse.data) {
            throw new Error(planningResponse.error || 'Planning failed');
        }

        const planBlueprint = planningResponse.data.blueprint;

        // Convert PlanningService blueprint to LangGraph ProjectBlueprint format
        const blueprint: ProjectBlueprint = {
            projectName: planBlueprint.projectName,
            description: planBlueprint.description,
            features: planBlueprint.features.map(f => ({
                name: typeof f === 'string' ? f : f,
                description: typeof f === 'string' ? f : f,
                priority: 'high' as const
            })),
            pages: extractPagesFromContext(planBlueprint.detailedContext, planBlueprint.features),
            components: extractComponentsFromContext(planBlueprint.detailedContext),
            designSystem: extractDesignSystem(planBlueprint.detailedContext),
            dependencies: { ...STANDARD_DEPENDENCIES }
        };

        // Ensure page names are valid
        blueprint.pages = blueprint.pages.map(page => ({
            ...page,
            name: page.name.replace(/\s+/g, '')
        }));

        console.log(`\n✅ Dynamic Blueprint Created: ${blueprint.projectName}`);
        console.log(`   📄 Pages: ${blueprint.pages.length} (dynamically determined)`);
        console.log(`   🧩 Components: ${blueprint.components.length}`);
        console.log(`   ✨ Features: ${blueprint.features.length}`);
        console.log(`   🎨 Workflow Nodes: ${planBlueprint.workflow?.nodes?.length || 0}`);

        // Log the pages for visibility
        blueprint.pages.forEach(p => console.log(`      → ${p.name} (${p.route})`));

        // Generate project ID for Mem0 tracking
        const projectId = generateProjectId(blueprint.projectName);
        console.log(`   🧠 Project ID: ${projectId}`);

        // Clear any previous memory for this project and store new blueprint
        await clearProjectMemory(projectId);
        await storeBlueprintMemory(projectId, blueprint);

        // Fetch images from the image microservice
        console.log('\n🖼️  Fetching project images...');
        let availableImages: UnsplashImage[] = [];
        try {
            availableImages = await fetchProjectImages(state.userPrompt);
            if (availableImages.length > 0) {
                await storeImagesInMemory(projectId, availableImages);
                console.log(`✅ ${availableImages.length} images fetched and stored`);
            } else {
                console.log('⚠️  No images fetched - will use gradient placeholders');
            }
        } catch (imgError: any) {
            console.error(`⚠️  Image fetching failed: ${imgError.message} - will use gradients`);
        }

        return {
            blueprint,
            projectId,
            availableImages,
            detailedContext: planBlueprint.detailedContext || '',
            workflowNodes: planBlueprint.workflow?.nodes || [],
            workflowEdges: planBlueprint.workflow?.edges || [],
            currentPhase: 'blueprint',
            messages: [
                `🤖 Autonomous Planning Complete: ${blueprint.projectName}`,
                `📄 ${blueprint.pages.length} pages dynamically determined`,
                `✨ ${blueprint.features.length} features identified`,
                `🖼️ ${availableImages.length} images ready`
            ]
        };

    } catch (error: any) {
        console.error('❌ Blueprint generation failed:', error.message);
        throw error;
    }
}

/**
 * Extract pages from detailedContext - parses the planning output
 */
function extractPagesFromContext(context: string, features: any[]): any[] {
    const pages: any[] = [];

    // Always include HomePage
    pages.push({
        name: 'HomePage',
        route: '/',
        description: 'Main landing page with hero section and key features',
        sections: ['Hero', 'Features', 'Testimonials', 'CTA'],
        components: ['Hero', 'FeatureGrid', 'TestimonialSlider', 'CallToAction']
    });

    // Parse features to determine additional pages
    const featureNames = features.map(f => typeof f === 'string' ? f : f.name || f);

    // Common page patterns based on features
    const pagePatterns = [
        { keywords: ['product', 'catalog', 'shop', 'store', 'item'], page: { name: 'ProductsPage', route: '/products', description: 'Product catalog and listings', sections: ['ProductGrid', 'Filters', 'Pagination'], components: ['ProductCard', 'FilterBar', 'SearchBar'] } },
        { keywords: ['service', 'offering'], page: { name: 'ServicesPage', route: '/services', description: 'Services offered', sections: ['ServiceGrid', 'Pricing'], components: ['ServiceCard', 'PricingTable'] } },
        { keywords: ['about', 'team', 'story'], page: { name: 'AboutPage', route: '/about', description: 'About the company/project', sections: ['Story', 'Team', 'Values'], components: ['TeamMember', 'Timeline'] } },
        { keywords: ['contact', 'support', 'help'], page: { name: 'ContactPage', route: '/contact', description: 'Contact information and form', sections: ['ContactForm', 'Map', 'Info'], components: ['ContactForm', 'LocationMap'] } },
        { keywords: ['pricing', 'plan', 'subscription'], page: { name: 'PricingPage', route: '/pricing', description: 'Pricing plans and tiers', sections: ['PricingCards', 'Comparison', 'FAQ'], components: ['PricingCard', 'ComparisonTable', 'FAQ'] } },
        { keywords: ['dashboard', 'admin', 'analytics'], page: { name: 'DashboardPage', route: '/dashboard', description: 'User dashboard with stats', sections: ['Stats', 'Charts', 'RecentActivity'], components: ['StatCard', 'Chart', 'ActivityFeed'] } },
        { keywords: ['blog', 'article', 'news', 'post'], page: { name: 'BlogPage', route: '/blog', description: 'Blog posts and articles', sections: ['FeaturedPost', 'PostGrid', 'Categories'], components: ['BlogCard', 'BlogPost', 'CategoryFilter'] } },
        { keywords: ['portfolio', 'project', 'work', 'gallery'], page: { name: 'PortfolioPage', route: '/portfolio', description: 'Portfolio and project showcase', sections: ['ProjectGrid', 'Categories', 'Featured'], components: ['ProjectCard', 'ImageGallery', 'Modal'] } },
        { keywords: ['faq', 'question'], page: { name: 'FAQPage', route: '/faq', description: 'Frequently asked questions', sections: ['FAQList', 'Categories'], components: ['Accordion', 'SearchBar'] } },
        { keywords: ['testimonial', 'review', 'feedback'], page: { name: 'TestimonialsPage', route: '/testimonials', description: 'Customer testimonials', sections: ['TestimonialGrid', 'Stats'], components: ['TestimonialCard', 'RatingStars'] } },
        { keywords: ['login', 'signin', 'auth'], page: { name: 'LoginPage', route: '/login', description: 'User authentication', sections: ['LoginForm'], components: ['LoginForm', 'SocialLogin'] } },
        { keywords: ['register', 'signup'], page: { name: 'RegisterPage', route: '/register', description: 'User registration', sections: ['RegisterForm'], components: ['RegisterForm', 'PasswordStrength'] } },
        { keywords: ['profile', 'account', 'setting'], page: { name: 'ProfilePage', route: '/profile', description: 'User profile and settings', sections: ['ProfileInfo', 'Settings'], components: ['ProfileCard', 'SettingsForm'] } },
        { keywords: ['cart', 'checkout', 'order'], page: { name: 'CartPage', route: '/cart', description: 'Shopping cart', sections: ['CartItems', 'Summary'], components: ['CartItem', 'OrderSummary', 'CheckoutButton'] } },
        { keywords: ['search', 'find', 'explore'], page: { name: 'SearchPage', route: '/search', description: 'Search results', sections: ['SearchBar', 'Results', 'Filters'], components: ['SearchBar', 'ResultCard', 'FilterSidebar'] } },
    ];

    // Match features to pages
    const contextLower = context.toLowerCase();
    const featuresLower = featureNames.join(' ').toLowerCase();

    for (const pattern of pagePatterns) {
        const hasMatch = pattern.keywords.some(kw =>
            contextLower.includes(kw) || featuresLower.includes(kw)
        );
        if (hasMatch && !pages.find(p => p.name === pattern.page.name)) {
            pages.push(pattern.page);
        }
    }

    // Always add 404 page
    pages.push({
        name: 'NotFoundPage',
        route: '*',
        description: '404 error page',
        sections: ['ErrorMessage', 'BackButton'],
        components: ['ErrorDisplay']
    });

    // Ensure minimum 5 pages
    const defaultPages = [
        { name: 'AboutPage', route: '/about', description: 'About page', sections: ['Story', 'Team'], components: ['TeamMember'] },
        { name: 'ContactPage', route: '/contact', description: 'Contact page', sections: ['ContactForm'], components: ['ContactForm'] },
        { name: 'ServicesPage', route: '/services', description: 'Services page', sections: ['ServiceGrid'], components: ['ServiceCard'] }
    ];

    for (const dp of defaultPages) {
        if (pages.length < 5 && !pages.find(p => p.name === dp.name)) {
            pages.push(dp);
        }
    }

    return pages;
}

/**
 * Extract components from detailedContext
 */
function extractComponentsFromContext(context: string): any[] {
    // Base UI components that are always needed
    const baseComponents = [
        { name: 'Button', type: 'ui', props: ['children', 'variant', 'size', 'onClick', 'disabled', 'loading'] },
        { name: 'Card', type: 'ui', props: ['children', 'className', 'hover'] },
        { name: 'Input', type: 'ui', props: ['placeholder', 'value', 'onChange', 'type', 'error'] },
        { name: 'Modal', type: 'ui', props: ['isOpen', 'onClose', 'title', 'children'] },
        { name: 'Badge', type: 'ui', props: ['children', 'variant', 'size'] },
        { name: 'Avatar', type: 'ui', props: ['src', 'alt', 'size', 'fallback'] },
        { name: 'Skeleton', type: 'ui', props: ['width', 'height', 'className'] },
        { name: 'Spinner', type: 'ui', props: ['size', 'className'] },
        { name: 'Toast', type: 'ui', props: ['message', 'type', 'duration'] },
        { name: 'Tooltip', type: 'ui', props: ['content', 'children', 'position'] },
        { name: 'Tabs', type: 'ui', props: ['tabs', 'activeTab', 'onChange'] },
        { name: 'Accordion', type: 'ui', props: ['items', 'allowMultiple'] },
        { name: 'Dropdown', type: 'ui', props: ['trigger', 'items', 'onSelect'] },
    ];

    // Layout components
    const layoutComponents = [
        { name: 'Header', type: 'layout', props: ['logo', 'navItems', 'sticky'] },
        { name: 'Footer', type: 'layout', props: ['links', 'social', 'copyright'] },
        { name: 'Sidebar', type: 'layout', props: ['items', 'collapsed', 'onToggle'] },
        { name: 'Container', type: 'layout', props: ['children', 'maxWidth', 'className'] },
        { name: 'Section', type: 'layout', props: ['children', 'id', 'className', 'background'] },
    ];

    // Feature components based on context keywords
    const featureComponents: any[] = [];
    const contextLower = context.toLowerCase();

    if (contextLower.includes('product') || contextLower.includes('shop')) {
        featureComponents.push(
            { name: 'ProductCard', type: 'feature', props: ['product', 'onAddToCart'] },
            { name: 'ProductGrid', type: 'feature', props: ['products', 'columns'] },
            { name: 'FilterBar', type: 'feature', props: ['filters', 'onFilterChange'] },
            { name: 'CartItem', type: 'feature', props: ['item', 'onRemove', 'onQuantityChange'] }
        );
    }

    if (contextLower.includes('testimonial') || contextLower.includes('review')) {
        featureComponents.push(
            { name: 'TestimonialCard', type: 'feature', props: ['testimonial'] },
            { name: 'TestimonialSlider', type: 'feature', props: ['testimonials', 'autoPlay'] },
            { name: 'RatingStars', type: 'feature', props: ['rating', 'maxStars'] }
        );
    }

    if (contextLower.includes('pricing') || contextLower.includes('plan')) {
        featureComponents.push(
            { name: 'PricingCard', type: 'feature', props: ['plan', 'popular', 'onSelect'] },
            { name: 'PricingTable', type: 'feature', props: ['plans', 'features'] },
            { name: 'FeatureCheck', type: 'feature', props: ['feature', 'included'] }
        );
    }

    if (contextLower.includes('dashboard') || contextLower.includes('stat')) {
        featureComponents.push(
            { name: 'StatCard', type: 'feature', props: ['title', 'value', 'change', 'icon'] },
            { name: 'Chart', type: 'feature', props: ['data', 'type', 'options'] },
            { name: 'ActivityFeed', type: 'feature', props: ['activities', 'maxItems'] }
        );
    }

    if (contextLower.includes('blog') || contextLower.includes('article')) {
        featureComponents.push(
            { name: 'BlogCard', type: 'feature', props: ['post', 'compact'] },
            { name: 'BlogPost', type: 'feature', props: ['content', 'author', 'date'] },
            { name: 'AuthorCard', type: 'feature', props: ['author'] }
        );
    }

    if (contextLower.includes('contact') || contextLower.includes('form')) {
        featureComponents.push(
            { name: 'ContactForm', type: 'feature', props: ['onSubmit', 'fields'] },
            { name: 'NewsletterForm', type: 'feature', props: ['onSubscribe'] }
        );
    }

    if (contextLower.includes('team') || contextLower.includes('member')) {
        featureComponents.push(
            { name: 'TeamMember', type: 'feature', props: ['member'] },
            { name: 'TeamGrid', type: 'feature', props: ['members', 'columns'] }
        );
    }

    // Hero and CTA are always useful
    featureComponents.push(
        { name: 'Hero', type: 'feature', props: ['title', 'subtitle', 'cta', 'image'] },
        { name: 'CallToAction', type: 'feature', props: ['title', 'description', 'buttonText', 'onAction'] },
        { name: 'FeatureGrid', type: 'feature', props: ['features', 'columns'] },
        { name: 'FeatureCard', type: 'feature', props: ['icon', 'title', 'description'] }
    );

    return [...layoutComponents, ...baseComponents, ...featureComponents];
}

/**
 * Extract design system from detailedContext
 */
function extractDesignSystem(context: string): any {
    // Default modern design system
    const defaultDesign = {
        primaryColor: '#6366f1', // Indigo
        secondaryColor: '#8b5cf6', // Violet
        accentColor: '#10b981', // Emerald
        style: 'modern',
        fonts: ['Inter', 'system-ui', 'sans-serif']
    };

    // Try to extract colors from context
    const colorMatch = context.match(/(#[0-9A-Fa-f]{6})/g);
    if (colorMatch && colorMatch.length >= 2) {
        defaultDesign.primaryColor = colorMatch[0];
        defaultDesign.secondaryColor = colorMatch[1];
        if (colorMatch.length >= 3) {
            defaultDesign.accentColor = colorMatch[2];
        }
    }

    // Determine style from keywords
    const contextLower = context.toLowerCase();
    if (contextLower.includes('minimal') || contextLower.includes('clean')) {
        defaultDesign.style = 'minimal';
    } else if (contextLower.includes('playful') || contextLower.includes('fun') || contextLower.includes('colorful')) {
        defaultDesign.style = 'playful';
    } else if (contextLower.includes('corporate') || contextLower.includes('professional') || contextLower.includes('business')) {
        defaultDesign.style = 'corporate';
    } else if (contextLower.includes('dark') || contextLower.includes('modern')) {
        defaultDesign.style = 'modern';
    }

    return defaultDesign;
}

export { STANDARD_DEPENDENCIES, DEV_DEPENDENCIES };
