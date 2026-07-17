// app/[...slug]/page.tsx

import Home from "../components/Home";
import About from "../components/About";
import { notFound } from "next/navigation";

interface slugProps {
    params: { slug: string[] };
}

// Route configuration type definition
interface RouteConfig {
    defaultLocale: string;
    supportLocale: string[];
    pageMapping: Array<{
        component: string;
        locale: string;
        slug: string[];
    }>;
}

/**
 * Fetch route configuration from the API on the server side
 * @param debugMode - When true, returns mock data instead of calling the API
 * @returns Route configuration object containing locale settings and page mappings
 */
async function fetchRouteConfig(debugMode = false): Promise<RouteConfig> {
    // If debug mode is enabled, return mock data directly
    if (debugMode) {
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
        defaultLocale: "en",
        supportLocale: ["en", "zh"],
        pageMapping: [
            { component: "Home", locale: "en", slug: [] },
            { component: "Home", locale: "zh", slug: [] },
            { component: "About", locale: "en", slug: ["about_us"] },
            { component: "About", locale: "zh", slug: ["關於我們"] }
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
 * - / → Defaults to English locale
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

    // Fetch route configuration from the server-side API
    const { defaultLocale, supportLocale, pageMapping } = await fetchRouteConfig(true);

    // Initialize with defaults
    let locale: string = defaultLocale;
    let paths: string[] = [];

    // Check if the first URL segment is a supported locale
    // If yes, use it as the locale and treat the rest as the path
    // If no, use the default locale and treat all segments as the path
    if (decodedSlug.length > 0 && supportLocale.includes(decodedSlug[0])) {
        [locale, ...paths] = decodedSlug;
    } else {
        // When no locale is found, treat all segments as the path
        // This will likely result in a 404 unless the path matches a route
        paths = decodedSlug;
    }

    // Find the matching route configuration based on locale and path segments
    const currentRoute = pageMapping.find(page => {
        return page.locale === locale && 
               JSON.stringify(page.slug) === JSON.stringify(paths);
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
    return <Component page={currentRoute} />;
}
