// app/[...slug]/page.tsx

import Home from "../components/Home";
import About from "../components/About";
import { notFound } from "next/navigation";
import { Metadata } from "next";

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
 * @param SIMULATED_MODE - When true, returns mock data instead of calling the API
 * @returns Route configuration object containing locale settings and page mappings
 */
async function fetchRouteConfig(SIMULATED_MODE = false): Promise<RouteConfig> {
    if (SIMULATED_MODE) {
        return defaultRouteConfig();
    }

    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/routes`,
            {
                cache: 'no-store'
                // Alternative caching strategies:
                // cache: 'force-cache' - Static generation, suitable for data that doesn't change frequently
                // next: { revalidate: 3600 } - Revalidate every hour
            }
        );

        if (!res.ok) {
            console.error(`API returned status ${res.status}, using default config`);
            return defaultRouteConfig();
        }

        return await res.json();
    } catch (error) {
        console.error('Failed to fetch route config from API:', error);
        return defaultRouteConfig();
    }
}

/**
 * Get default route configuration as a fallback
 * @returns Default route configuration
 */
function defaultRouteConfig(): RouteConfig {
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

// SEO Meta configuration
const pageMetadataMap = {
    Home: {
        en: {
            title: "Home",
            description: "Welcome to our website",
            ogTitle: "Home - My Next App",
            ogDescription: "Welcome to our website",
        },
        zh: {
            title: "首頁",
            description: "歡迎來到我們的網站",
            ogTitle: "首頁 - My Next App",
            ogDescription: "歡迎來到我們的網站",
        },
    },
    About: {
        en: {
            title: "About Us",
            description: "Learn more about our company",
            ogTitle: "About Us - My Next App",
            ogDescription: "Learn more about our company",
        },
        zh: {
            title: "關於我們",
            description: "這是關於頁面",
            ogTitle: "關於我們 - My Next App",
            ogDescription: "分享關於我們的資訊",
        },
    },
} as const;

/**
 * Shared function to resolve route data from URL parameters
 * Used by both Page component and generateMetadata
 * @param params - The URL parameters containing slug array
 * @param simulatedMode - Enable simulated mode for testing
 * @returns Object containing locale, currentRoute, and configuration
 */
async function getRouteData(params: { slug: string[] }, simulatedMode = true) {
    // Extract and decode URL parameters
    const { slug = [] } = await params;
    
    // Decode URL-encoded characters (e.g., %20 -> space)
    const decodedSlug = slug.map(item => {
        try {
            return decodeURIComponent(item);
        } catch {
            return item;
        }
    });

    // Fetch route configuration
    const { defaultLocale, supportLocale, pageMapping } = await fetchRouteConfig(simulatedMode);

    // Initialize with defaults
    let locale: string = defaultLocale;
    let paths: string[] = [];

    // Check if the first URL segment is a supported locale
    if (decodedSlug.length > 0 && supportLocale.includes(decodedSlug[0])) {
        [locale, ...paths] = decodedSlug;
    } else {
        // When no locale is found, treat all segments as the path
        paths = decodedSlug;
    }

    // Find the matching route configuration
    const currentRoute = pageMapping.find(page => {
        return page.locale === locale && 
               JSON.stringify(page.slug) === JSON.stringify(paths);
    });

    // If no matching route is found, return 404
    if (!currentRoute) {
        notFound();
    }

    return { 
        locale, 
        currentRoute, 
        decodedSlug,
        defaultLocale,
        supportLocale,
        pageMapping 
    };
}

/**
 * Dynamically generates metadata based on URL parameters
 * This runs on the server and is critical for SEO
 * @param params - URL slug parameters from the catch-all route
 * @returns Metadata object for the current page
 */
export async function generateMetadata({ params }: slugProps): Promise<Metadata> {
    // Use shared function to get route data
    const { locale, currentRoute, decodedSlug } = await getRouteData(params, true);

    // Get component-specific metadata
    const componentName = currentRoute.component as keyof typeof pageMetadataMap;
    const metadataForComponent = pageMetadataMap[componentName];
    const metadataForLocale = metadataForComponent?.[locale as keyof typeof metadataForComponent];

    // Fallback metadata if specific entry doesn't exist
    if (!metadataForLocale) {
        return {
            title: locale === 'zh' ? '頁面' : 'Page',
            description: locale === 'zh' ? '頁面內容' : 'Page content',
        };
    }

    // Build full URL for canonical and Open Graph
    const urlPath = decodedSlug.join('/');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com';
    const fullUrl = `${baseUrl}/${urlPath}`;

    // Return complete metadata for SEO
    return {
        title: metadataForLocale.title,
        description: metadataForLocale.description,
        openGraph: {
            title: metadataForLocale.ogTitle,
            description: metadataForLocale.ogDescription,
            url: fullUrl,
            images: [
                {
                    url: "/og-image.png",
                    width: 1200,
                    height: 630,
                    alt: metadataForLocale.title,
                },
            ],
            locale: locale === 'zh' ? 'zh_Hant' : 'en_US',
            type: "website",
        },
        alternates: {
            // Multi-language SEO with hreflang tags
            languages: {
                'en': `${baseUrl}/en${currentRoute.slug.length ? '/' + currentRoute.slug.join('/') : ''}`,
                'zh': `${baseUrl}/zh${currentRoute.slug.length ? '/' + currentRoute.slug.join('/') : ''}`,
            },
        },
        /*keywords: locale === 'zh' 
            ? ['網站', '應用程式', '首頁'] 
            : ['website', 'app', 'home'],*/
        robots: {
            index: true,
            follow: true,
        },
    };
}

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
    // Use shared function to get route data
    const { locale, currentRoute } = await getRouteData(params, true);

    // Get the actual React component from the registry
    const Component = registry[currentRoute.component];
    if (!Component) {
        notFound();
    }

    // Render the component with the locale as props
    // E.g.: export default function Home({ locale } : { locale: string }) { ... }
    return <Component locale={locale} />;
}
