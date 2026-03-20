
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

import { isDemoGatedRoute } from '@/lib/feature-flags';
import { db } from '@/lib/db';

/**
 * Get user role and status from Clerk metadata, with database fallback
 * Checks sessionClaims first, then Clerk API, then database
 */
async function getUserRoleAndStatus(
  userId: string,
  sessionClaims: { metadata?: { role?: string } } | null
): Promise<{ role?: string; status?: string }> {
  let role: string | undefined;
  let status: string | undefined;

  // First check Clerk session claims (fastest)
  const clerkRole = (sessionClaims?.metadata as { role?: string })?.role;
  if (clerkRole) {
    role = clerkRole;
  }

  // Fallback 1: check publicMetadata directly from Clerk user
  if (!role) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const metadataRole = (user.publicMetadata as { role?: string })?.role;
      if (metadataRole) {
        role = metadataRole;
      }
    } catch {
      // Clerk API call failed
    }
  }

  // Always check database for status (and role if not found)
  try {
    const portalUser = await db.portalUser.findUnique({
      where: { clerkId: userId },
      select: { role: true, status: true },
    });
    if (portalUser) {
      status = portalUser.status.toLowerCase();
      if (!role) {
        role = portalUser.role.toLowerCase();
        // Sync role to Clerk for future requests
        try {
          const client = await clerkClient();
          await client.users.updateUserMetadata(userId, {
            publicMetadata: { role: portalUser.role.toLowerCase() },
          });
        } catch {
          // Non-critical, continue
        }
      }
    }
  } catch {
    // Database lookup failed
  }

  return { role, status };
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
  '/account-status(.*)', // Account status page (for pending/inactive/terminated users)
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
  // Also redirect authenticated users from marketing homepage to their portal
  if (hostname.startsWith('app.') && pathname === '/') {
    return NextResponse.rewrite(new URL('/portals', req.url));
  }
  if (userId && pathname === '/') {
    const { role } = await getUserRoleAndStatus(userId, sessionClaims as { metadata?: { role?: string } } | null);
    const portalUrl = getDefaultPortalUrl(role);
    return NextResponse.redirect(new URL(portalUrl, req.url));
  }

  // Gate feature-flagged routes - redirect to home if the feature is disabled
  if (isDemoGatedRoute(pathname)) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Allow public routes (but intercept /portals for authenticated users)
  if (isPublicRoute(req)) {
    // If authenticated user hits /portals, redirect to their actual dashboard
    if (userId && pathname === '/portals') {
      const { role } = await getUserRoleAndStatus(userId, sessionClaims as { metadata?: { role?: string } } | null);
      const portalUrl = getDefaultPortalUrl(role);
      if (portalUrl !== '/portals') {
        return NextResponse.redirect(new URL(portalUrl, req.url));
      }
    }
    return NextResponse.next();
  }

  // If user is signed in and tries to access auth routes, redirect to dashboard
  if (userId && isAuthRoute(req)) {
    const { role } = await getUserRoleAndStatus(userId, sessionClaims as { metadata?: { role?: string } } | null);
    return NextResponse.redirect(new URL(getDefaultPortalUrl(role), req.url));
  }

  // Auth routes are public for non-authenticated users
  if (isAuthRoute(req)) {
    return NextResponse.next();
  }

  // Get role and status for protected routes (only fetch once)
  let role: string | undefined;
  let status: string | undefined;
  if (isAdminRoute(req) || isEmployeeRoute(req) || isClientRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
    }
    const userInfo = await getUserRoleAndStatus(userId, sessionClaims as { metadata?: { role?: string } } | null);
    role = userInfo.role;
    status = userInfo.status;

    // Check if user account is not active - redirect to account status page
    if (status && status !== 'active') {
      return NextResponse.redirect(new URL('/account-status', req.url));
    }
  }

  // Protect admin routes - admin/manager only
  if (isAdminRoute(req)) {
    if (!canAccessAdmin(role)) {
      // Redirect to their appropriate portal based on role
      return NextResponse.redirect(new URL(getDefaultPortalUrl(role), req.url));
    }
  }

  // Protect employee routes - admin/manager/caregiver only
  if (isEmployeeRoute(req)) {
    if (!canAccessEmployee(role)) {
      // Redirect to their appropriate portal based on role
      return NextResponse.redirect(new URL(getDefaultPortalUrl(role), req.url));
    }
  }

  // Protect client routes - admin/manager/client only
  if (isClientRoute(req)) {
    if (!canAccessClient(role)) {
      // Redirect to their appropriate portal based on role
      return NextResponse.redirect(new URL(getDefaultPortalUrl(role), req.url));
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