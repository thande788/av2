
/**
 * Next.js proxy entrypoint that integrates Clerk authentication/authorization.
 * (Next.js 16+ renamed middleware.ts to proxy.ts)
 *
 * This proxy:
 * 1. Redirects authenticated users away from auth pages to their dashboard
 * 2. Protects /admin and /employee routes, requiring authentication
 * 3. Enforces role-based access (admin/manager for /admin routes)
 * 4. Gates demo routes behind NEXT_PUBLIC_DEMO_MODE env var
 *
 * @see {@link https://clerk.com/docs/nextjs/middleware Clerk Next.js middleware docs}
 */
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { isDemoGatedRoute, isDemoEnabled } from '@/lib/feature-flags';

/**
 * Route matchers for different access levels
 */
const isPublicRoute = createRouteMatcher([
  '/',
  '/about(.*)',
  '/services(.*)',
  '/caregivers(.*)',
  '/testimonials(.*)',
  '/faqs(.*)',
  '/contact(.*)',
  '/careers(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/resources(.*)',
  '/portals(.*)',
  '/client-portal(.*)',
  '/api/webhooks(.*)',
  '/book/(.*)', // SMS booking links - auth checked in page
]);

const isAuthRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isEmployeeRoute = createRouteMatcher(['/employee(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const { pathname } = req.nextUrl;

  // Gate demo routes - redirect to home if demo mode is disabled
  if (isDemoGatedRoute(pathname) && !isDemoEnabled()) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // If user is signed in and tries to access auth routes, redirect to dashboard
  if (userId && isAuthRoute(req)) {
    // Get role from session claims (set by Clerk)
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    
    // Redirect based on role
    let redirectUrl = '/employee'; // Default for caregivers
    if (role === 'admin' || role === 'manager') {
      redirectUrl = '/admin';
    }
    
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  // Auth routes are public for non-authenticated users
  if (isAuthRoute(req)) {
    return NextResponse.next();
  }

  // Protect admin routes - require authentication and admin/manager role
  if (isAdminRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
    }
    
    // Check for admin/manager role
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    if (role !== 'admin' && role !== 'manager') {
      // Not authorized - redirect to employee portal or home
      return NextResponse.redirect(new URL('/employee', req.url));
    }
  }

  // Protect employee routes - require authentication
  if (isEmployeeRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};