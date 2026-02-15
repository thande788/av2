import { Navbar, Footer } from "@/components/layout";

/**
 * Marketing layout wrapper for public pages
 *
 * This route group contains all public-facing marketing pages.
 * Includes the Navbar and Footer which are NOT shown on admin routes.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
