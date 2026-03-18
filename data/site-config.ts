/**
 * Site-wide configuration for toggleable features
 * 
 * This file controls feature flags and promotional banners.
 * Configuration reads from environment variables with sensible defaults.
 * 
 * Environment variables:
 * - NEXT_PUBLIC_HIRING_BANNER: "true" | "false" (default: "true")
 * - NEXT_PUBLIC_ANNOUNCEMENT_BANNER: "true" | "false" (default: "false")
 * - NEXT_PUBLIC_BRAND_ACCENT_BABY_BLUE: "true" | "false" (default: "true")
 * - NEXT_PUBLIC_BRAND_ACCENT_ROSE: "true" | "false" (default: "true")
 */

const envBool = (key: string, fallback: boolean): boolean => {
  const val = process.env[key];
  if (val === undefined) return fallback;
  return val === 'true';
};

export const siteConfig = {
  /**
   * Brand accent colors toggle
   * Controls whether legacy brand accents (baby-blue, rose) are applied
   * When disabled, falls back to neutral blue/gray scheme
   */
  brandAccents: {
    /** Enable baby-blue accents (navbar highlights, decorative borders, card accents) */
    babyBlue: envBool('NEXT_PUBLIC_BRAND_ACCENT_BABY_BLUE', true),
    /** Enable rose accents (icons, hover states, gradients) */
    rose: envBool('NEXT_PUBLIC_BRAND_ACCENT_ROSE', true),
    /** Use deep rose (#E37383) for icons instead of base rose */
    useDeepRoseForIcons: true,
  },

  /**
   * Hiring banner configuration
   * Toggle via NEXT_PUBLIC_HIRING_BANNER env var or edit defaults here
   */
  hiringBanner: {
    enabled: envBool('NEXT_PUBLIC_HIRING_BANNER', true),
    message: "We're hiring! Join our team of compassionate caregivers.",
    ctaText: "View Open Positions",
    ctaHref: "/careers",
    // Optional: set to a future date to auto-disable, or null for indefinite
    expiresAt: null as Date | null,
  },

  /**
   * Announcement banner (for promotions, alerts, etc.)
   * Toggle via NEXT_PUBLIC_ANNOUNCEMENT_BANNER env var
   */
  announcementBanner: {
    enabled: envBool('NEXT_PUBLIC_ANNOUNCEMENT_BANNER', false),
    message: "",
    ctaText: "",
    ctaHref: "",
    variant: "info" as "info" | "warning" | "success",
  },
};

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
