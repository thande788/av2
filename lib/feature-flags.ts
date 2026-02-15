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
 * DEMO_MODE gates all portal features for stakeholder preview.
 * Individual feature flags allow granular control during rollout.
 */
export const featureFlags = {
  /**
   * Demo mode enables portal features for stakeholder preview.
   * When enabled, shows employee/client portal routes and demo data.
   * When disabled, only marketing and current admin routes are available.
   */
  demoMode: process.env.DEMO_MODE === 'true',

  /**
   * Individual feature toggles for granular control.
   * These are automatically enabled when demoMode is true,
   * but can be individually enabled in production.
   */
  features: {
    /** Employee portal (/employee/*) */
    employeePortal:
      process.env.DEMO_MODE === 'true' ||
      process.env.FEATURE_EMPLOYEE_PORTAL === 'true',

    /** Client portal (/client/*) */
    clientPortal:
      process.env.DEMO_MODE === 'true' ||
      process.env.FEATURE_CLIENT_PORTAL === 'true',

    /** Shift scheduling (/admin/shifts/*) */
    shiftScheduling:
      process.env.DEMO_MODE === 'true' ||
      process.env.FEATURE_SHIFTS === 'true',

    /** SMS notifications via Twilio */
    smsNotifications:
      process.env.DEMO_MODE === 'true' ||
      process.env.FEATURE_SMS === 'true',

    /** Timesheet management */
    timesheets:
      process.env.DEMO_MODE === 'true' ||
      process.env.FEATURE_TIMESHEETS === 'true',

    /** Invoicing system */
    invoicing:
      process.env.DEMO_MODE === 'true' ||
      process.env.FEATURE_INVOICING === 'true',

    /** Compliance document tracking */
    complianceDocs:
      process.env.DEMO_MODE === 'true' ||
      process.env.FEATURE_COMPLIANCE === 'true',

    /** Payroll export/integration */
    payrollExport:
      process.env.DEMO_MODE === 'true' ||
      process.env.FEATURE_PAYROLL === 'true',

    /** Worker management in admin */
    workerManagement:
      process.env.DEMO_MODE === 'true' ||
      process.env.FEATURE_WORKERS === 'true',

    /** Client management in admin */
    clientManagement:
      process.env.DEMO_MODE === 'true' ||
      process.env.FEATURE_CLIENTS === 'true',
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
 * Features can be enabled via DEMO_MODE or individual FEATURE_* env vars.
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
 * Routes that are gated behind demo mode.
 * Used by middleware to redirect when demo is disabled.
 */
export const DEMO_GATED_ROUTES = [
  '/employee',
  '/client',
  '/admin/shifts',
  '/admin/workers',
  '/admin/clients',
  '/admin/timesheets',
  '/admin/payroll',
  '/admin/compliance',
] as const;

/**
 * Check if a pathname is gated behind demo mode.
 */
export function isDemoGatedRoute(pathname: string): boolean {
  return DEMO_GATED_ROUTES.some((route) => pathname.startsWith(route));
}
