/**
 * Feature flags for gating demo and experimental features.
 *
 * Usage:
 * ```ts
 * import { isDemoEnabled, isFeatureEnabled } from '@/lib/feature-flags';
 *
 * if (isDemoEnabled()) {
 *   // Show demo routes/features
 * }
 *
 * if (isFeatureEnabled('employeePortal')) {
 *   // Show employee portal
 * }
 * ```
 */

/**
 * Feature flag configuration.
 * NEXT_PUBLIC_DEMO_MODE gates all portal features for stakeholder preview.
 * Individual feature flags allow granular control during rollout.
 *
 * NOTE: Using NEXT_PUBLIC_ prefix so flags are available in client components.
 */
export const featureFlags = {
  /**
   * Demo mode enables portal features for stakeholder preview.
   * When enabled, shows employee/client portal routes and demo data.
   * When disabled, only marketing and current admin routes are available.
   */
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',

  /**
   * Individual feature toggles for granular control.
   * These are automatically enabled when demoMode is true,
   * but can be individually enabled in production.
   */
  features: {
    /** Employee portal (/employee/*) */
    employeePortal:
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
      process.env.NEXT_PUBLIC_FEATURE_EMPLOYEE_PORTAL === 'true',

    /** Client portal (/client/*) */
    clientPortal:
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
      process.env.NEXT_PUBLIC_FEATURE_CLIENT_PORTAL === 'true',

    /** Shift scheduling (/admin/shifts/*) */
    shiftScheduling:
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
      process.env.NEXT_PUBLIC_FEATURE_SHIFTS === 'true',

    /** SMS notifications via Twilio */
    smsNotifications:
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
      process.env.NEXT_PUBLIC_FEATURE_SMS === 'true',

    /** Timesheet management */
    timesheets:
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
      process.env.NEXT_PUBLIC_FEATURE_TIMESHEETS === 'true',

    /** Invoicing system */
    invoicing:
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
      process.env.NEXT_PUBLIC_FEATURE_INVOICING === 'true',

    /** Compliance document tracking */
    complianceDocs:
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
      process.env.NEXT_PUBLIC_FEATURE_COMPLIANCE === 'true',

    /** Payroll export/integration */
    payrollExport:
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
      process.env.NEXT_PUBLIC_FEATURE_PAYROLL === 'true',

    /** Worker management in admin */
    workerManagement:
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
      process.env.NEXT_PUBLIC_FEATURE_WORKERS === 'true',

    /** Client management in admin */
    clientManagement:
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
      process.env.NEXT_PUBLIC_FEATURE_CLIENTS === 'true',

    /** Shift reviews and ratings */
    reviews:
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
      process.env.NEXT_PUBLIC_FEATURE_REVIEWS === 'true',
  },
} as const;

export type FeatureKey = keyof typeof featureFlags.features;

/**
 * Check if demo mode is enabled.
 * Use this for general "is demo running" checks.
 */
export function isDemoEnabled(): boolean {
  return featureFlags.demoMode;
}

/**
 * Check if a specific feature is enabled.
 * Features can be enabled via NEXT_PUBLIC_DEMO_MODE or individual NEXT_PUBLIC_FEATURE_* env vars.
 *
 * @param feature - The feature key to check
 * @returns true if the feature is enabled
 */
export function isFeatureEnabled(feature: FeatureKey): boolean {
  return featureFlags.features[feature];
}

/**
 * Get all enabled features.
 * Useful for debugging and feature dashboards.
 */
export function getEnabledFeatures(): FeatureKey[] {
  return (Object.keys(featureFlags.features) as FeatureKey[]).filter(
    (key) => featureFlags.features[key]
  );
}

/**
 * Map of route prefixes to the feature flag that gates them.
 * Used by middleware to redirect when the corresponding feature is disabled.
 */
const ROUTE_FEATURE_MAP: Record<string, FeatureKey> = {
  '/employee': 'employeePortal',
  '/client': 'clientPortal',
  '/admin/shifts': 'shiftScheduling',
  '/admin/workers': 'workerManagement',
  '/admin/clients': 'clientManagement',
  '/admin/timesheets': 'timesheets',
  '/admin/payroll': 'payrollExport',
  '/admin/compliance': 'complianceDocs',
};

/**
 * Check if a pathname is gated behind a feature flag.
 */
export function isDemoGatedRoute(pathname: string): boolean {
  return Object.entries(ROUTE_FEATURE_MAP).some(
    ([route, feature]) => pathname.startsWith(route) && !isFeatureEnabled(feature)
  );
}
