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
   * Brand accent colors toggle
   * Controls whether legacy brand accents (baby-blue, rose) are applied
   * When disabled, falls back to neutral blue/gray scheme
   */
  brandAccents: {
    /** Enable baby-blue accents (navbar highlights, decorative borders, card accents) */
    babyBlue: true,
    /** Enable rose accents (icons, hover states, gradients) */
    rose: true,
    /** Use deep rose (#E37383) for icons instead of base rose */
    useDeepRoseForIcons: true,
  },

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

/**
 * Get the data attribute value for brand accents
 * Returns a string like "baby-blue rose" or "rose" or "" based on config
 */
export function getBrandAccentsAttribute(): string {
  const { babyBlue, rose } = siteConfig.brandAccents;
  const accents: string[] = [];
  
  if (babyBlue) accents.push("baby-blue");
  if (rose) accents.push("rose");
  
  return accents.join(" ");
}

/**
 * Check if a specific brand accent is enabled
 */
export function isBrandAccentEnabled(accent: "babyBlue" | "rose"): boolean {
  return siteConfig.brandAccents[accent];
}
