import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Only handle specific cases in middleware
  // Let pages handle their own auth checks to avoid redirect loops
  
  // Redirect www to non-www
  const url = request.nextUrl;
  if (url.hostname.startsWith('www.')) {
    url.hostname = url.hostname.replace('www.', '');
    return NextResponse.redirect(url);
  }
  
  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
