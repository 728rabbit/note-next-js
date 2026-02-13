// middleware - root dir, there can only be one project. 

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token');

    console.log('Middleware 執行:', pathname);

    if(pathname === '/admin/login') {
        if (token) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // Skip middleware for static files and API routes
    if (
        pathname.startsWith('/_next') ||  // Next.js internal files
        pathname.startsWith('/static') ||  // Static files
        pathname.startsWith('/favicon.ico') || // Favicon
        pathname.startsWith('/api')  // API routes (if you have them)
    ) {
        return NextResponse.next();
    }

    if (!token && pathname.startsWith('/admin')) {
        // 沒有 token，重定向到登入頁
        return NextResponse.redirect(new URL('/admin/login', request.url));
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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
