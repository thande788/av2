/**
 * Marketing layout wrapper for public pages
 *
 * This route group contains all public-facing marketing pages.
 * The Navbar and Footer are inherited from the root layout, so this
 * layout is used for shared marketing-specific concerns like:
 * - Structured data for local business
 * - Page transitions
 * - Marketing-specific analytics
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
