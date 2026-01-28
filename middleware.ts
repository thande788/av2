
/**
 * Next.js middleware entrypoint that integrates Clerk authentication/authorization.
 *
 * This middleware protects the /admin routes, requiring authentication.
 * All other routes remain public.
 *
 * @see {@link https://clerk.com/docs/nextjs/middleware Clerk Next.js middleware docs}
 */
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define protected routes - only /admin and its sub-routes require auth
const isProtectedRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
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