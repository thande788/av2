
/**
 * Next.js middleware entrypoint that integrates Clerk authentication/authorization.
 *
 * This module exports Clerk's Next.js middleware as the default export and configures
 * route matching so the middleware runs on application routes and API routes, while
 * skipping Next.js internals and most static assets.
 *
 * @remarks
 * The `config.matcher` patterns are designed to:
 * - Exclude `/_next` and common static file extensions (images, fonts, scripts, etc.),
 *   unless those assets are referenced via search parameters.
 * - Always include `/api` and `/trpc` routes.
 *
 * @see {@link https://clerk.com/docs/nextjs/middleware Clerk Next.js middleware docs}
 */
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};