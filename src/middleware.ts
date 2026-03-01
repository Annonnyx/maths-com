import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export function middleware(request: NextRequest) {
  // Check for both dev and production cookie names
  const token = request.cookies.get('next-auth.session-token')?.value || 
                request.cookies.get('__Secure-next-auth.session-token')?.value ||
                request.cookies.get('__Host-next-auth.session-token')?.value;
  
  const isAuthenticated = !!token;
  const pathname = request.nextUrl.pathname;
  
  // Public routes that don't require auth
  const publicRoutes = [
    '/', 
    '/login', 
    '/register', 
    '/leaderboard', 
    '/courses',
    '/multiplayer',
    '/multiplayer/join',
    '/multiplayer/history',
    '/contact',
    '/banner',
    '/social',
    '/api/auth/[...nextauth]',
    '/robots.txt',
    '/sitemap.xml'
  ];
  
  // Static assets and API routes
  const isPublicRoute = publicRoutes.includes(pathname) || 
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js)$/);
  
  // Guest routes - accessible without auth but with limited functionality
  const guestRoutes = ['/test', '/practice'];
  const isGuestRoute = guestRoutes.some(route => pathname.startsWith(route));
  
  // If not authenticated and trying to access protected route (not guest), redirect to login
  if (!isAuthenticated && !isPublicRoute && !isGuestRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If authenticated and on login/register, redirect based on user role
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    try {
      const decodedToken = getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET 
      });
      const userRole = (decodedToken as any)?.role || 'user';
      
      // Redirect based on user role
      let redirectUrl = '/dashboard';
      if (userRole === 'admin') {
        redirectUrl = '/admin';
      } else if (userRole === 'teacher') {
        redirectUrl = '/dashboard'; // Teachers go to dashboard (could be changed to specific teacher dashboard)
      }
      
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    } catch (error) {
      // If token decoding fails, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
