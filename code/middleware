// Middleware (proxy.tsx) - Handles authentication, routing, and locale management
// Note: Only one project can exist in the root directory

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

/** Enable simulated authentication mode (bypasses external API calls) */
const SIMULATED_MODE = true;

/** Admin routes accessible without authentication */
const PUBLIC_ADMIN_PATHS = [
    '/admin/login',
    '/admin/forgot',
    '/admin/reset'
] as const;

/** Paths that bypass middleware processing entirely */
const SKIP_PATHS = [
    '/_next',
    '/static',
    '/favicon.ico',
    '/api'
] as const;

/** Supported locale codes for internationalization */
const SUPPORTED_LOCALES = ['en', 'zh'];

/** Default locale when no locale is specified in URL */
const DEFAULT_LOCALE = 'zh';

// ============================================================================
// MOCK DATA (Production replacement: database/cache)
// ============================================================================

/** Simulated token storage with user metadata */
const VALID_TOKENS = new Map<string, { 
    userId: string; 
    role: 'admin' | 'editor'; 
    expiresAt: number;
}>([
    ['valid_token_123', { 
        userId: 'user1', 
        role: 'admin', 
        expiresAt: Date.now() + 86_400_000 // 24 hours
    }],
    ['valid_token_456', { 
        userId: 'user2', 
        role: 'admin', 
        expiresAt: Date.now() + 86_400_000 
    }],
    ['valid_token_789', { 
        userId: 'user3', 
        role: 'editor', 
        expiresAt: Date.now() + 86_400_000 
    }],
]);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Checks if a path belongs to public admin routes
 */
const isPublicAdminPath = (pathname: string): boolean => 
    PUBLIC_ADMIN_PATHS.some(path => pathname.startsWith(path));

/**
 * Checks if a path should bypass middleware processing
 */
const shouldSkipPath = (pathname: string): boolean => 
    SKIP_PATHS.some(path => pathname.startsWith(path));

/**
 * Extracts the first path segment from a URL pathname
 * @returns The first segment or empty string if none exists
 */
const getFirstPathSegment = (pathname: string): string => 
    pathname.split('/').filter(Boolean)[0] || '';

/**
 * Determines if a path already contains a valid locale prefix
 */
const hasValidLocalePrefix = (pathname: string): boolean => {
    const firstSegment = getFirstPathSegment(pathname);
    return SUPPORTED_LOCALES.includes(firstSegment as any);
};

/**
 * Validates an authentication token via API call or simulated lookup
 * @param token - The JWT or session token from cookies
 * @returns User data if valid, null otherwise
 */
async function validateToken(token: string): Promise<{ 
    userId: string; 
    role: string; 
    expiresAt?: number;
} | null> {
    if (!token) return null;

    try {
        // Production mode: Validate via external API
        if (!SIMULATED_MODE) {
            const response = await fetch(`${process.env.API_URL}/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ token }),
                // Prevent infinite middleware loops
                next: { revalidate: 0 },
            });

            if (!response.ok) return null;
            const data = await response.json();
            return data.user;
        }

        // Development mode: Simulated validation with delay
        await new Promise(resolve => setTimeout(resolve, 50));

        const userData = VALID_TOKENS.get(token);
        
        if (!userData) return null; // Invalid token
        
        if (userData.expiresAt < Date.now()) return null; // Expired token
        
        return userData;

    } catch (error) {
        console.error('Token validation failed:', error);
        return null;
    }
}

// ============================================================================
// MIDDLEWARE HANDLER
// ============================================================================

/**
 * Main middleware function orchestrating:
 * 1. Authentication (admin routes)
 * 2. Locale routing (internationalization)
 * 3. Redirect and rewrite logic
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('admin_token')?.value;

    // ------------------------------------------------------------------------
    // STEP 1: Skip middleware for asset paths
    // ------------------------------------------------------------------------
    if (shouldSkipPath(pathname)) {
        return NextResponse.next();
    }

    // ------------------------------------------------------------------------
    // STEP 2: Validate token if present
    // ------------------------------------------------------------------------
    const userData = token ? await validateToken(token) : null;

    // ------------------------------------------------------------------------
    // STEP 3: Public admin routes - redirect logged-in users
    // ------------------------------------------------------------------------
    if (isPublicAdminPath(pathname)) {
        if (userData) {
            // Already authenticated → redirect to admin dashboard
            return NextResponse.redirect(new URL('/admin', request.url));
        }
        // Unauthenticated → allow access to login/forgot/reset pages
        return NextResponse.next();
    }

    // ------------------------------------------------------------------------
    // STEP 4: Protected admin routes - require authentication
    // ------------------------------------------------------------------------
    if (pathname.startsWith('/admin')) {
        if (!userData) {
            // Redirect to login page if not authenticated
            const loginUrl = new URL('/admin/login', request.url);
            // Optional: Preserve original path for post-login redirection
            // loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
        // Authenticated → proceed
        return NextResponse.next();
    }

    // ------------------------------------------------------------------------
    // STEP 5: Internationalization (i18n) locale handling
    // ------------------------------------------------------------------------
    // Handles URLs without locale prefixes by adding the default locale
    
    // Case 1: Single locale supported → rewrite internally
    if (SUPPORTED_LOCALES.length === 1) {
        const singleLocale = SUPPORTED_LOCALES[0];
        
        if (!hasValidLocalePrefix(pathname)) {
            // Rewrite to include locale for internal routing (preserves URL)
            const internalPath = `/${singleLocale}${pathname}`;
            return NextResponse.rewrite(new URL(internalPath, request.url));
        }
    } 
    // Case 2: Multiple locales supported but missing prefix → redirect
    else if (!hasValidLocalePrefix(pathname)) {
        // Redirect to version with default locale (changes URL)
        const localizedPath = `/${DEFAULT_LOCALE}${pathname}`;
        return NextResponse.redirect(new URL(localizedPath, request.url));
    }

    // ------------------------------------------------------------------------
    // STEP 6: Default - continue to next middleware/route
    // ------------------------------------------------------------------------
    return NextResponse.next();
}

// ============================================================================
// EXPORT CONFIGURATION
// ============================================================================

/**
 * Next.js middleware configuration
 * Defines which paths trigger the middleware
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico (favicon file)
         * - public folder files
         * 
         * This ensures optimal performance by skipping static assets
         */
        '/((?!_next/static|_next/image|favicon.ico).*)'
    ]
};
