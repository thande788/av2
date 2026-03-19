'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ROLE_PERMISSIONS, type AdminRole } from '@/lib/rbac';
import type { UserRole } from '@prisma/client';

// =============================================================================
// PERMISSION CHECKS
// =============================================================================

/**
 * Get the admin sub-role from Clerk metadata.
 * Falls back to SUPER_ADMIN for ADMIN users, VIEWER for MANAGER users.
 */
export async function getAdminRole(clerkId: string): Promise<AdminRole> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkId);
    const meta = user.publicMetadata as { role?: string; adminRole?: AdminRole };

    if (meta.adminRole && meta.adminRole in ROLE_PERMISSIONS) {
      return meta.adminRole;
    }

    // Default based on UserRole
    if (meta.role === 'admin') return 'SUPER_ADMIN';
    if (meta.role === 'manager') return 'VIEWER';
  } catch {
    // Fall through
  }

  // Check DB
  const portalUser = await db.portalUser.findUnique({
    where: { clerkId },
    select: { role: true },
  });

  if (portalUser?.role === 'ADMIN') return 'SUPER_ADMIN';
  return 'VIEWER';
}

/**
 * Check if the current user has a specific permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const adminRole = await getAdminRole(userId);
  const permissions = ROLE_PERMISSIONS[adminRole];

  return permissions.includes('*') || permissions.includes(permission);
}

/**
 * Get all permissions for the current user
 */
export async function getCurrentPermissions(): Promise<string[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const adminRole = await getAdminRole(userId);
  return ROLE_PERMISSIONS[adminRole];
}

/**
 * Get the admin role for the current user
 */
export async function getCurrentAdminRole(): Promise<AdminRole | null> {
  const { userId } = await auth();
  if (!userId) return null;

  return getAdminRole(userId);
}

// =============================================================================
// USER MANAGEMENT ACTIONS
// =============================================================================

/**
 * List all admin/manager portal users
 */
export async function getAdminUsers() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const currentRole = await getAdminRole(userId);
  if (currentRole !== 'SUPER_ADMIN') {
    throw new Error('Only Super Admins can manage users');
  }

  const users = await db.portalUser.findMany({
    where: {
      role: { in: ['ADMIN', 'MANAGER'] },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Enrich with Clerk metadata for adminRole
  const enriched = await Promise.all(
    users.map(async (user) => {
      let adminRole: AdminRole = user.role === 'ADMIN' ? 'SUPER_ADMIN' : 'VIEWER';
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(user.clerkId);
        const meta = clerkUser.publicMetadata as { adminRole?: AdminRole };
        if (meta.adminRole && meta.adminRole in ROLE_PERMISSIONS) {
          adminRole = meta.adminRole;
        }
      } catch {
        // Use default
      }
      return { ...user, adminRole };
    })
  );

  return enriched;
}

/**
 * Update a user's admin sub-role
 */
export async function updateUserAdminRole(
  targetClerkId: string,
  newAdminRole: AdminRole
) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const currentRole = await getAdminRole(userId);
  if (currentRole !== 'SUPER_ADMIN') {
    throw new Error('Only Super Admins can modify roles');
  }

  // Prevent self-demotion
  if (targetClerkId === userId && newAdminRole !== 'SUPER_ADMIN') {
    throw new Error('Cannot demote yourself');
  }

  // Validate newAdminRole
  if (!(newAdminRole in ROLE_PERMISSIONS)) {
    throw new Error('Invalid admin role');
  }

  const client = await clerkClient();
  const user = await client.users.getUser(targetClerkId);

  await client.users.updateUserMetadata(targetClerkId, {
    publicMetadata: {
      ...user.publicMetadata,
      adminRole: newAdminRole,
    },
  });

  // Update PortalUser role accordingly
  const dbRole: UserRole = (newAdminRole === 'SUPER_ADMIN' || newAdminRole === 'HR_MANAGER')
    ? 'ADMIN' : 'MANAGER';

  await db.portalUser.update({
    where: { clerkId: targetClerkId },
    data: { role: dbRole },
  });

  revalidatePath('/admin/users');
}

/**
 * Invite a new admin user by email
 */
export async function inviteAdminUser(
  email: string,
  firstName: string,
  lastName: string,
  adminRole: AdminRole
) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const currentRole = await getAdminRole(userId);
  if (currentRole !== 'SUPER_ADMIN') {
    throw new Error('Only Super Admins can invite users');
  }

  // Validate adminRole
  if (!(adminRole in ROLE_PERMISSIONS)) {
    throw new Error('Invalid admin role');
  }

  // Check if user already exists
  const existing = await db.portalUser.findUnique({ where: { email } });
  if (existing) {
    throw new Error('A user with this email already exists');
  }

  // Create invitation via Clerk
  const client = await clerkClient();

  try {
    // Check if user already exists in Clerk
    const existingUsers = await client.users.getUserList({ emailAddress: [email] });
    if (existingUsers.totalCount > 0) {
      throw new Error('A user with this email already exists in the authentication system');
    }

    // Revoke any existing pending invitation for this email before creating a new one
    const existingInvitations = await client.invitations.getInvitationList();
    const pendingForEmail = existingInvitations.data.filter(
      (inv) => inv.emailAddress === email && inv.status === 'pending'
    );
    for (const inv of pendingForEmail) {
      await client.invitations.revokeInvitation(inv.id);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    await client.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `${appUrl}/sign-up`,
      publicMetadata: {
        role: adminRole === 'SUPER_ADMIN' || adminRole === 'HR_MANAGER' ? 'admin' : 'manager',
        adminRole,
      },
    });
  } catch (err: unknown) {
    // Re-throw our own errors as-is
    if (err instanceof Error && !('clerkError' in err)) {
      throw err;
    }
    // Extract Clerk-specific error messages
    const clerkErr = err as { errors?: Array<{ message?: string; longMessage?: string; code?: string }> };
    const detail = clerkErr.errors?.[0]?.longMessage || clerkErr.errors?.[0]?.message || 'Failed to create invitation';
    throw new Error(detail);
  }

  revalidatePath('/admin/users');
  return { success: true };
}

/**
 * Deactivate an admin user
 */
export async function deactivateAdminUser(targetClerkId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const currentRole = await getAdminRole(userId);
  if (currentRole !== 'SUPER_ADMIN') {
    throw new Error('Only Super Admins can deactivate users');
  }

  if (targetClerkId === userId) {
    throw new Error('Cannot deactivate yourself');
  }

  await db.portalUser.update({
    where: { clerkId: targetClerkId },
    data: { status: 'INACTIVE' },
  });

  revalidatePath('/admin/users');
}

/**
 * Reactivate an admin user
 */
export async function reactivateAdminUser(targetClerkId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const currentRole = await getAdminRole(userId);
  if (currentRole !== 'SUPER_ADMIN') {
    throw new Error('Only Super Admins can reactivate users');
  }

  await db.portalUser.update({
    where: { clerkId: targetClerkId },
    data: { status: 'ACTIVE' },
  });

  revalidatePath('/admin/users');
}
