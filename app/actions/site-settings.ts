'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { logAuditEvent } from './audit-log';

// ── Types ────────────────────────────────────────────────────────────────────

export interface SiteSettings {
  'hiringBanner.enabled': boolean;
  'hiringBanner.message': string;
  'hiringBanner.ctaText': string;
  'hiringBanner.ctaHref': string;
  'announcementBanner.enabled': boolean;
  'announcementBanner.message': string;
  'announcementBanner.ctaText': string;
  'announcementBanner.ctaHref': string;
  'announcementBanner.variant': 'info' | 'warning' | 'success';
  'brandAccents.babyBlue': boolean;
  'brandAccents.rose': boolean;
  'brandAccents.useDeepRoseForIcons': boolean;
}

type SettingKey = keyof SiteSettings;

/** Default values — mirrors data/site-config.ts fallback behavior */
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
