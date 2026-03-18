
/**
 * Next.js proxy entrypoint that integrates Clerk authentication/authorization.
 * (Next.js 16+ renamed middleware.ts to proxy.ts)
 *
 * This proxy:
 * 1. Redirects authenticated users away from auth pages to their dashboard
 * 2. Protects portal routes with role-based access control
 * 3. Gates demo routes behind NEXT_PUBLIC_DEMO_MODE env var
 *
 * Role-based access:
 * - /admin: admin, manager only
 * - /employee: admin, manager, caregiver only (clients blocked)
 * - /client: admin, manager, client only (caregivers blocked)
 *
 * @see {@link https://clerk.com/docs/nextjs/middleware Clerk Next.js middleware docs}
 */
import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { isDemoGatedRoute, isDemoEnabled } from '@/lib/feature-flags';

/**
 * Get user role from Clerk metadata
 * Checks sessionClaims first, then fetches from Clerk API as fallback
 */
async function getUserRole(userId: string, sessionClaims: { metadata?: { role?: string } } | null): Promise<string | undefined> {
  // First check Clerk session claims (fastest)
  const clerkRole = (sessionClaims?.metadata as { role?: string })?.role;
  if (clerkRole) {
    return clerkRole;
  }

  // Fallback: check publicMetadata directly from Clerk user
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const metadataRole = (user.publicMetadata as { role?: string })?.role;
    if (metadataRole) {
      return metadataRole;
    }
  } catch {
    // Clerk API call failed
  }

  return undefined;
}

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
const isClientRoute = createRouteMatcher(['/client(.*)']);

/**
 * Role-based access control helpers
 */
const canAccessAdmin = (role?: string) => role === 'admin' || role === 'manager';
const canAccessEmployee = (role?: string) => role === 'admin' || role === 'manager' || role === 'caregiver';
const canAccessClient = (role?: string) => role === 'admin' || role === 'manager' || role === 'client';

/**
 * Get default redirect URL based on role
 */
function getDefaultPortalUrl(role?: string): string {
  if (role === 'admin' || role === 'manager') return '/admin';
  if (role === 'caregiver') return '/employee';
  if (role === 'client') return '/client';
  return '/portals'; // Fallback to portal selection
}

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Subdomain routing: app.angeltouch.services root → /portals
  if (hostname.startsWith('app.') && pathname === '/') {
    return NextResponse.rewrite(new URL('/portals', req.url));
  }

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
    const role = await getUserRole(userId, sessionClaims as { metadata?: { role?: string } } | null);
    return NextResponse.redirect(new URL(getDefaultPortalUrl(role), req.url));
  }

  // Auth routes are public for non-authenticated users
  if (isAuthRoute(req)) {
    return NextResponse.next();
  }

  // Get role for protected routes (only fetch once)
  let role: string | undefined;
  if (isAdminRoute(req) || isEmployeeRoute(req) || isClientRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
    }
    role = await getUserRole(userId, sessionClaims as { metadata?: { role?: string } } | null);
  }

  // Protect admin routes - admin/manager only
  if (isAdminRoute(req)) {
    if (!canAccessAdmin(role)) {
      // Redirect to their appropriate portal
      return NextResponse.redirect(new URL(getDefaultPortalUrl(role), req.url));
    }
  }

  // Protect employee routes - admin/manager/caregiver only (clients blocked)
  if (isEmployeeRoute(req)) {
    if (!canAccessEmployee(role)) {
      // Clients trying to access employee portal → redirect to client portal
      return NextResponse.redirect(new URL('/client', req.url));
    }
  }

  // Protect client routes - admin/manager/client only (caregivers blocked)
  if (isClientRoute(req)) {
    if (!canAccessClient(role)) {
      // Caregivers trying to access client portal → redirect to employee portal
      return NextResponse.redirect(new URL('/employee', req.url));
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