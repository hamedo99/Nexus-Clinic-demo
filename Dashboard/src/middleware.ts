// ... existing code ...
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken } from '@/lib/auth'
// ... existing code ...

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value

    // Define protected routes
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/patients') ||
        request.nextUrl.pathname.startsWith('/settings') ||
        request.nextUrl.pathname.startsWith('/admin')

    const isLoginPage = request.nextUrl.pathname.startsWith('/login')

    // 1. If trying to access protected route without session -> Redirect to Login
    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. If trying to access login page WITH session -> Redirect to Dashboard
    if (isLoginPage && session) {
        // Verify session validity
        const payload = await verifySessionToken(session);
        if (payload) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        // If invalid, let them stay on login (and maybe clear cookie?)
    }

    // 3. If on protected route WITH session -> Verify validity
    if (isProtectedRoute && session) {
        const payload = await verifySessionToken(session);
        if (!payload) {
            // Invalid token -> Redirect to login and clear cookie
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('session');
            return response;
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
