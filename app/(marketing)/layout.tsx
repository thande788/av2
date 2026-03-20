import { Navbar, Footer } from "@/components/layout";
import { LazyChatWidget } from "@/components/shared";
import { AnnouncementBanner } from "@/components/shared/announcement-banner";
import { getSiteSettings } from "@/app/actions/site-settings";

/**
 * Marketing layout wrapper for public pages
 *
 * This route group contains all public-facing marketing pages.
 * Includes the Navbar and Footer which are NOT shown on admin routes.
 */
export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let announcement: { enabled: boolean; message: string; ctaText: string; ctaHref: string; variant: 'info' | 'warning' | 'success' } | null = null;
  try {
    const settings = await getSiteSettings();
    if (settings['announcementBanner.enabled']) {
      announcement = {
        enabled: true,
        message: settings['announcementBanner.message'],
        ctaText: settings['announcementBanner.ctaText'],
        ctaHref: settings['announcementBanner.ctaHref'],
        variant: settings['announcementBanner.variant'],
      };
    }
  } catch {
    // If DB is unavailable, silently skip the banner
  }

  return (
    <>
      <Navbar />
      {announcement && (
        <div className="mx-auto w-full max-w-7xl px-4 pt-2 sm:px-6">
          <AnnouncementBanner
            enabled={announcement.enabled}
            message={announcement.message}
            ctaText={announcement.ctaText}
            ctaHref={announcement.ctaHref}
            variant={announcement.variant}
          />
        </div>
      )}
      <main id="main-content" className="flex-1 min-w-0 overflow-x-hidden">
        {children}
      </main>
      <Footer />
      <LazyChatWidget />
    </>
  );
}
