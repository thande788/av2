
/**
 * Next.js proxy entrypoint that integrates Clerk authentication/authorization.
 * (Next.js 16+ renamed middleware.ts to proxy.ts)
 *
 * This proxy:
 * 1. Protects /admin routes, requiring authentication
 * 2. Gates demo routes (/employee, /client, /admin/shifts, etc.) behind DEMO_MODE env var
 *
 * @see {@link https://clerk.com/docs/nextjs/middleware Clerk Next.js middleware docs}
 */
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { isDemoGatedRoute, isDemoEnabled } from '@/lib/feature-flags';

// Define protected routes - only /admin and demo portals require auth
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/employee(.*)',
  '/client(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Gate demo routes - redirect to home if demo mode is disabled
  if (isDemoGatedRoute(pathname) && !isDemoEnabled()) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Protect authenticated routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};