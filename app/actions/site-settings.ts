'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { logAuditEvent } from './audit-log';

// ── Types ────────────────────────────────────────────────────────────────────

export interface SiteSettings {
  // ── Banners ─────────────────────────────────────────────────────
  'hiringBanner.enabled': boolean;
  'hiringBanner.message': string;
  'hiringBanner.ctaText': string;
  'hiringBanner.ctaHref': string;
  'announcementBanner.enabled': boolean;
  'announcementBanner.message': string;
  'announcementBanner.ctaText': string;
  'announcementBanner.ctaHref': string;
  'announcementBanner.variant': 'info' | 'warning' | 'success';
  // ── Brand Accents ───────────────────────────────────────────────
  'brandAccents.babyBlue': boolean;
  'brandAccents.rose': boolean;
  'brandAccents.useDeepRoseForIcons': boolean;
  // ── Contact Info ────────────────────────────────────────────────
  'contact.phonePrimary': string;
  'contact.phoneSecondary': string;
  'contact.email': string;
  'contact.serviceArea': string;
  // ── Address ─────────────────────────────────────────────────────
  'address.street': string;
  'address.city': string;
  'address.state': string;
  'address.zip': string;
  // ── Social Links ────────────────────────────────────────────────
  'social.facebook': string;
  'social.linkedin': string;
  'social.instagram': string;
  // ── Business Info ───────────────────────────────────────────────
  'business.priceRange': string;
  'business.foundingDate': string;
}

type SettingKey = keyof SiteSettings;

/** Default values — mirrors data/site-config.ts and lib/seo/site-metadata.ts */
const DEFAULTS: SiteSettings = {
  'hiringBanner.enabled': true,
  'hiringBanner.message': "We're hiring! Join our team of compassionate caregivers.",
  'hiringBanner.ctaText': 'View Open Positions',
  'hiringBanner.ctaHref': '/careers',
  'announcementBanner.enabled': false,
  'announcementBanner.message': '',
  'announcementBanner.ctaText': '',
  'announcementBanner.ctaHref': '',
  'announcementBanner.variant': 'info',
  'brandAccents.babyBlue': true,
  'brandAccents.rose': true,
  'brandAccents.useDeepRoseForIcons': true,
  'contact.phonePrimary': '(978) 856-9358',
  'contact.phoneSecondary': '(254) 245-6917',
  'contact.email': 'info@angeltouch.services',
  'contact.serviceArea': 'Serving Lowell, Dracut, Chelmsford, Tewksbury & Billerica',
  'address.street': 'Main Street',
  'address.city': 'Lowell',
  'address.state': 'MA',
  'address.zip': '01852',
  'social.facebook': 'https://facebook.com/angeltouchhomecare',
  'social.linkedin': 'https://linkedin.com/company/angeltouchhomecare',
  'social.instagram': 'https://instagram.com/angeltouchhomecare',
  'business.priceRange': '$28-$35/hour',
  'business.foundingDate': '2015',
};

// ── Reads ────────────────────────────────────────────────────────────────────

/**
 * Load all site settings from DB, merged with defaults.
 * Safe to call from server components.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await db.siteSetting.findMany();

  const settings = { ...DEFAULTS };

  for (const row of rows) {
    const key = row.key as SettingKey;
    if (key in DEFAULTS) {
      try {
        settings[key] = JSON.parse(row.value) as never;
      } catch {
        // keep default if the stored value is corrupt
      }
    }
  }

  return settings;
}

// ── Writes ───────────────────────────────────────────────────────────────────

/**
 * Save a batch of site settings. Only keys present in the payload are upserted;
 * others remain unchanged.
 */
export async function updateSiteSettings(
  payload: Partial<SiteSettings>
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Unauthorized' };

  try {
    const entries = Object.entries(payload) as [SettingKey, SiteSettings[SettingKey]][];

    await db.$transaction(
      entries.map(([key, value]) =>
        db.siteSetting.upsert({
          where: { key },
          create: {
            key,
            value: JSON.stringify(value),
            updatedBy: userId,
          },
          update: {
            value: JSON.stringify(value),
            updatedBy: userId,
          },
        })
      )
    );

    await logAuditEvent({
      action: 'SETTINGS_UPDATE',
      entity: 'SiteSetting',
      entityId: 'global',
      details: { changedKeys: Object.keys(payload) },
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to update site settings:', error);
    return { success: false, error: 'Failed to save settings' };
  }
}
