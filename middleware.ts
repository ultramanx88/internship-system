import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files, API routes, and auth pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Basic role-based routing redirects
  // Note: This is a basic implementation. Full authentication should be handled by client-side AuthRedirect component
  
  // Redirect root to login if not authenticated
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Basic dashboard redirects (will be overridden by client-side auth)
  if (pathname.startsWith('/admin') || pathname.startsWith('/staff') || 
      pathname.startsWith('/educator') || pathname.startsWith('/student')) {
    // Let client-side AuthRedirect handle the actual role checking
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};