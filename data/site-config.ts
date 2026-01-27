/**
 * Site-wide configuration for toggleable features
 * 
 * This file controls feature flags and promotional banners.
 * In production, these would be managed via:
 * - Environment variables
 * - Database (admin dashboard)
 * - CMS integration
 * 
 * For now, toggle features by editing this file.
 */

export const siteConfig = {
  /**
   * Hiring banner configuration
   * Toggle `enabled` to show/hide the banner site-wide
   */
  hiringBanner: {
    enabled: true,
    message: "We're hiring! Join our team of compassionate caregivers.",
    ctaText: "View Open Positions",
    ctaHref: "/careers",
    // Optional: set to a future date to auto-disable, or null for indefinite
    expiresAt: null as Date | null,
  },

  /**
   * Announcement banner (for promotions, alerts, etc.)
   */
  announcementBanner: {
    enabled: false,
    message: "",
    ctaText: "",
    ctaHref: "",
    variant: "info" as "info" | "warning" | "success",
  },
} as const;

/**
 * Check if hiring banner should be displayed
 */
export function isHiringBannerActive(): boolean {
  const { enabled, expiresAt } = siteConfig.hiringBanner;
  
  if (!enabled) return false;
  if (expiresAt && new Date() > expiresAt) return false;
  
  return true;
}
