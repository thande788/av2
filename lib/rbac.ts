/**
 * RBAC Types and Permission Definitions
 *
 * Fine-grained admin sub-roles and their permissions.
 * Referenced by both server actions and client components.
 */

export type AdminRole = 'SUPER_ADMIN' | 'HR_MANAGER' | 'CONTENT_MANAGER' | 'VIEWER';

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: ['*'], // Full access
  HR_MANAGER: [
    'applications.read', 'applications.write',
    'jobs.read', 'jobs.write',
    'workers.read', 'workers.write',
    'compliance.read', 'compliance.write',
    'timesheets.read', 'timesheets.write',
    'payroll.read', 'payroll.write',
    'analytics.read',
    'audit-log.read',
  ],
  CONTENT_MANAGER: [
    'testimonials.read', 'testimonials.write',
    'faqs.read', 'faqs.write',
    'services.read', 'services.write',
    'contacts.read', 'contacts.write',
    'inquiries.read', 'inquiries.write',
    'analytics.read',
  ],
  VIEWER: [
    'applications.read',
    'jobs.read',
    'contacts.read',
    'inquiries.read',
    'testimonials.read',
    'faqs.read',
    'services.read',
    'workers.read',
    'clients.read',
    'shifts.read',
    'analytics.read',
    'audit-log.read',
  ],
};

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  HR_MANAGER: 'HR Manager',
  CONTENT_MANAGER: 'Content Manager',
  VIEWER: 'Viewer',
};
