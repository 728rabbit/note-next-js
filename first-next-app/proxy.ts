// Middleware - root dir, there can only be one project. 

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Extracting constants - for easier maintenance
const simulatedMode = true;
const publicAdminPaths = [
    '/admin/login',
    '/admin/forgot', 
    '/admin/reset'
] as const;

const skipPaths = [
    '/_next',
    '/static',
    '/favicon.ico',
    '/api'
] as const;

const isPublicAdminPath = (pathname: string) => publicAdminPaths.some(path => pathname.startsWith(path));

const shouldSkipPath = (pathname: string) => skipPaths.some(path => pathname.startsWith(path));

// Simulated user database / token validation
const VALID_TOKENS = new Map([
    // In production, this would be a database/cache lookup
    ['valid_token_123', { userId: 'user1', role: 'admin', expiresAt: Date.now() + 86400000 }],
    ['valid_token_456', { userId: 'user2', role: 'admin', expiresAt: Date.now() + 86400000 }],
    ['valid_token_789', { userId: 'user3', role: 'editor', expiresAt: Date.now() + 86400000 }],
]);

// Simulated token validation function
async function validateToken(token: string) {
    try {
        if (!token) return null;

        if(!simulatedMode) {
            const response = await fetch(`${process.env.API_URL}/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ token }),
                // Important: Avoid infinite loops
                next: { revalidate: 0 }
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return data.user;
        }
        else {
            // Simulate database/cache lookup delay (unit: ms)
            await new Promise(resolve => setTimeout(resolve, 50));

            // In production: 
            // 1. Check if token is expired
            // 2. Check if token has been revoked
            // 3. Fetch user permissions
            const userData = VALID_TOKENS.get(token);
            
            if (!userData) {
                return null; // Invalid token
            }
            
            if (userData.expiresAt < Date.now()) {
                return null; // Expired token
            }
            
            return userData;

        }
    } catch (error) {
        console.error('Token verification API call failed:', error);
        return null;
    }
}


export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    // Skip
    if (shouldSkipPath(pathname)) {
        return NextResponse.next();
    }

    // If you are already logged in, return to the admin homepage
    const userData = token ?  await validateToken(token) : null;

    if (isPublicAdminPath(pathname)) {
        if (userData) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
        return NextResponse.next();
    }

    // Admin path that requires authentication
    if (pathname.startsWith('/admin')) {
        if (!userData) {
            const loginUrl = new URL('/admin/login', request.url);
            // Optional: Record the original path and import it after logging in.
            // loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
      /*
      * Match all request paths except:
      * - _next/static (static files)
      * - _next/image (image optimization files)
      * - favicon.ico (favicon file)
      * - public folder files
      */
      '/((?!_next/static|_next/image|favicon.ico).*)'
    ]
};