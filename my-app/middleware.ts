import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

// Routes that require authentication (only onboarding is truly protected)
const protectedRoutes = ['/onboarding'];

// Routes that should redirect to home if already authenticated
const authRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  try {
    const session = await auth();
    const { pathname } = request.nextUrl;

    // Check if the route requires authentication
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // Redirect to login if accessing onboarding without session
    if (isProtectedRoute && !session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect to home if accessing auth routes with active session and onboarding completed
    if (isAuthRoute && session) {
      const user = session.user as any;
      if (!user.onboardingCompleted) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
      return NextResponse.redirect(new URL('/home', request.url));
    }

    // Redirect to onboarding if user is logged in but hasn't completed onboarding
    // Only redirect if trying to access protected user routes
    if (session && pathname !== '/onboarding' && pathname !== '/login' && pathname !== '/signup') {
      const user = session.user as any;
      if (!user.onboardingCompleted && (pathname.startsWith('/home') || pathname === '/')) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (except auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api/(?!auth)|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)',
  ],
};
