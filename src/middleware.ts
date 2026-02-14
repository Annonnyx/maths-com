import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('next-auth.session-token')?.value;
  
  const isAuthenticated = !!token;
  const pathname = request.nextUrl.pathname;
  
  // Public routes that don't require auth
  const publicRoutes = ['/', '/login', '/register', '/leaderboard', '/courses'];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Guest routes - accessible without auth but with limited functionality
  const guestRoutes = ['/test', '/practice', '/courses'];
  const isGuestRoute = guestRoutes.some(route => pathname.startsWith(route));
  
  // If not authenticated and trying to access protected route (not guest), redirect to login
  if (!isAuthenticated && !isPublicRoute && !isGuestRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If authenticated and on login/register, redirect to dashboard
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
