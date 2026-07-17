// app/[...slug]/page.tsx

import Home from "../components/Home";
import About from "../components/About";
import { notFound } from "next/navigation";

interface slugProps {
    params: { slug: string[] };
}

// Route configuration type definition
interface RouteConfig {
    defaultcurrentLocale: string;
    supportcurrentLocale: string[];
    pageMapping: Array<{
        component: string;
        currentLocale: string;
        slug: string[];
    }>;
}

/**
 * Fetch route configuration from the API on the server side
 * @param SIMULATED_MODE  - When true, returns mock data instead of calling the API
 * @returns Route configuration object containing currentLocale settings and page mappings
 */
async function fetchRouteConfig(SIMULATED_MODE  = false): Promise<RouteConfig> {
    // If debug mode is enabled, return mock data directly
    if (SIMULATED_MODE ) {
        return getDefaultConfig();
    }

    try {
        // Call the API on the server side
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/routes`,
            {
                cache: 'no-store' // Retrieve the latest data on every request
                // Alternative caching strategies:
                // cache: 'force-cache' - Static generation, suitable for data that doesn't change frequently
                // next: { revalidate: 3600 } - Revalidate every hour
            }
        );

        // Check if the API response is successful
        if (!res.ok) {
            console.error(`API returned status ${res.status}, using default config`);
            return getDefaultConfig();
        }

        // Parse and return the API response
        return await res.json();
    } catch (error) {
        // Handle network errors or other exceptions
        console.error('Failed to fetch route config from API:', error);
        return getDefaultConfig();
    }
}

/**
 * Get default route configuration as a fallback
 * @returns Default route configuration
 */
function getDefaultConfig(): RouteConfig {
    return {
        defaultcurrentLocale: "en",
        supportcurrentLocale: ["en", "zh"],
        pageMapping: [
            { component: "Home", currentLocale: "en", slug: [] },
            { component: "Home", currentLocale: "zh", slug: [] },
            { component: "About", currentLocale: "en", slug: ["about_us"] },
            { component: "About", currentLocale: "zh", slug: ["關於我們"] }
        ]
    };
}

// Registry mapping component names to their actual React components
export const registry: Record<string, React.ComponentType<any>> = {
    Home,
    About
};

/**
 * Dynamic page component that handles multi-language routing
 * Uses catch-all route [...slug] to capture URL segments
 * 
 * URL patterns:
 * - /en → Home component (English)
 * - /zh → Home component (Chinese)
 * - /en/about_us → About component (English)
 * - /zh/關於我們 → About component (Chinese)
 * - / → Defaults to English currentLocale
 * - /fr → Falls back to English (404 if route doesn't exist)
 */
export default async function Page({ params }: slugProps) {
    // Extract language and parameters from the URL
    const { slug = [] } = await params;

    // Decode URL-encoded characters (e.g., %20 -> space)
    const decodedSlug = slug.map(item => {
        try {
            return decodeURIComponent(item);
        } catch {
            return item;
        }
    });

    console.log(decodedSlug);

    // Fetch route configuration from the server-side API
    const { defaultcurrentLocale, supportcurrentLocale, pageMapping } = await fetchRouteConfig(true);

    // Initialize with defaults
    let currentLocale: string = defaultcurrentLocale;
    let currentPaths: string[] = [];

    // Check if the first URL segment is a supported currentLocale
    // If yes, use it as the currentLocale and treat the rest as the path
    // If no, use the default currentLocale and treat all segments as the path
    if (decodedSlug.length > 0 && supportcurrentLocale.includes(decodedSlug[0])) {
        [currentLocale, ...currentPaths] = decodedSlug;
    } else {
        // When no currentLocale is found, treat all segments as the path
        // This will likely result in a 404 unless the path matches a route
        currentPaths = decodedSlug;
    }

    // Find the matching route configuration based on currentLocale and path segments
    const currentRoute = pageMapping.find(page => {
        return page.currentLocale === currentLocale && 
               JSON.stringify(page.slug) === JSON.stringify(currentPaths);
    });

    // If no matching route is found, return a 404 page
    if (!currentRoute) {
        notFound();
    }

    // Get the actual React component from the registry
    const Component = registry[currentRoute.component];
    if (!Component) {
        notFound();
    }
    
    // Render the component with the route configuration as props
    // E.g.: export default function YourPage({ currentLocale } : { currentLocale: string }) { ... }
    return <Component page={currentRoute} locale={currentLocale} />;
}
