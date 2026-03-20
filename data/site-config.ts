/**
 * Site-wide configuration for toggleable features
 * 
 * Configuration hierarchy (highest to lowest priority):
 * 1. Database (SiteSetting table) — admin-editable at /admin/settings
 * 2. Environment variables (NEXT_PUBLIC_*)
 * 3. Hardcoded defaults below
 * 
 * The `siteConfig` object is the static/env-var fallback used by client
 * components. Server components should call `getSiteSettings()` from
 * `@/app/actions/site-settings` for the freshest DB-backed values.
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
 * DB-backed brand accents attribute.
 * Falls back to static config if DB read fails (e.g. during build).
 */
export async function getBrandAccentsFromDB(): Promise<string> {
  try {
    const { getSiteSettings } = await import('@/app/actions/site-settings');
    const settings = await getSiteSettings();
    const accents: string[] = [];
    if (settings['brandAccents.babyBlue']) accents.push('baby-blue');
    if (settings['brandAccents.rose']) accents.push('rose');
    return accents.join(' ');
  } catch {
    // Fallback to static config during build or if DB is unavailable
    return getBrandAccentsAttribute();
  }
}

/**
 * Check if a specific brand accent is enabled
 */
export function isBrandAccentEnabled(accent: "babyBlue" | "rose"): boolean {
  return siteConfig.brandAccents[accent];
}
