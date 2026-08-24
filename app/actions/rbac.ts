'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ROLE_PERMISSIONS, type AdminRole } from '@/lib/rbac';
import type { UserRole } from '@prisma/client';
import { z } from 'zod';

export type RoleMismatchType =
  | 'none'
  | 'missing-clerk-user'
  | 'missing-clerk-role'
  | 'role-mismatch';

export interface PortalUserRoleDiagnostic {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: string;
  createdAt: Date;
  clerkRole: string | null;
  clerkUsername: string | null;
  mismatchType: RoleMismatchType;
}

function normalizeRoleForComparison(role?: string | null): string | null {
  if (!role) {
    return null;
  }

  const normalized = role.toLowerCase();

  if (normalized === 'admin') return 'admin';
  if (normalized === 'manager') return 'manager';
  if (normalized === 'caregiver') return 'caregiver';
  if (normalized === 'client') return 'client';

  return null;
}

function dbRoleToClerkRole(role: UserRole): string {
  if (role === 'ADMIN') return 'admin';
  if (role === 'MANAGER') return 'manager';
  if (role === 'CAREGIVER') return 'caregiver';
  return 'client';
}

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
 * List all portal users (all roles) with Clerk metadata mismatch diagnostics.
 */
export async function getAllPortalUsersWithRoleDiagnostics(): Promise<PortalUserRoleDiagnostic[]> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const currentRole = await getAdminRole(userId);
  if (currentRole !== 'SUPER_ADMIN') {
    throw new Error('Only Super Admins can view all portal users');
  }

  const users = await db.portalUser.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const client = await clerkClient();

  const diagnostics = await Promise.all(
    users.map(async (user): Promise<PortalUserRoleDiagnostic> => {
      try {
        const clerkUser = await client.users.getUser(user.clerkId);
        const clerkRoleRaw = (clerkUser.publicMetadata as { role?: string })?.role ?? null;
        const normalizedClerkRole = normalizeRoleForComparison(clerkRoleRaw);
        const expectedClerkRole = dbRoleToClerkRole(user.role);

        let mismatchType: RoleMismatchType = 'none';

        if (!normalizedClerkRole) {
          mismatchType = 'missing-clerk-role';
        } else if (normalizedClerkRole !== expectedClerkRole) {
          mismatchType = 'role-mismatch';
        }

        return {
          ...user,
          clerkRole: clerkRoleRaw,
          clerkUsername: clerkUser.username ?? null,
          mismatchType,
        };
      } catch {
        return {
          ...user,
          clerkRole: null,
          clerkUsername: null,
          mismatchType: 'missing-clerk-user',
        };
      }
    })
  );

  return diagnostics;
}

export async function getPortalUserById(userId: string) {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) throw new Error('Unauthorized');

  const currentRole = await getAdminRole(currentUserId);
  if (currentRole !== 'SUPER_ADMIN') {
    throw new Error('Only Super Admins can view portal user details');
  }

  const user = await db.portalUser.findUnique({
    where: { id: userId },
    include: {
      worker: {
        select: { id: true },
      },
      client: {
        select: { id: true },
      },
    },
  });

  if (!user) {
    return null;
  }

  let clerkRole: string | null = null;
  let clerkUsername: string | null = null;

  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(user.clerkId);
    clerkRole = ((clerkUser.publicMetadata as { role?: string })?.role ?? null) as string | null;
    clerkUsername = clerkUser.username ?? null;
  } catch {
    clerkRole = null;
    clerkUsername = null;
  }

  return {
    ...user,
    clerkRole,
    clerkUsername,
  };
}

const updatePortalUserSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  firstName: z.string().min(1, 'First name is required').max(80, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(80, 'Last name is too long'),
  role: z.enum(['ADMIN', 'MANAGER', 'CAREGIVER', 'CLIENT']),
  status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'TERMINATED']),
});

export async function updatePortalUserProfile(input: z.infer<typeof updatePortalUserSchema>) {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) throw new Error('Unauthorized');

  const currentRole = await getAdminRole(currentUserId);
  if (currentRole !== 'SUPER_ADMIN') {
    throw new Error('Only Super Admins can update users');
  }

  const validated = updatePortalUserSchema.parse(input);

  const updated = await db.portalUser.update({
    where: { id: validated.id },
    data: {
      firstName: validated.firstName,
      lastName: validated.lastName,
      role: validated.role,
      status: validated.status,
    },
  });

  const clerkRole = dbRoleToClerkRole(validated.role);
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(updated.clerkId);
    await client.users.updateUserMetadata(updated.clerkId, {
      publicMetadata: {
        ...(user.publicMetadata as Record<string, unknown>),
        role: clerkRole,
      },
    });
  } catch {
    // Database update succeeds even if Clerk sync fails.
  }

  revalidatePath('/admin/users');
  revalidatePath('/admin/users/all');
  revalidatePath(`/admin/users/all/${validated.id}`);

  return { success: true };
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

// =============================================================================
// INVITATION MANAGEMENT
// =============================================================================

export type ClerkInvitation = {
  id: string;
  emailAddress: string;
  status: string;
  publicMetadata: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
};

/**
 * List all Clerk invitations
 */
export async function getInvitations(): Promise<ClerkInvitation[]> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const currentRole = await getAdminRole(userId);
  if (currentRole !== 'SUPER_ADMIN') {
    throw new Error('Only Super Admins can view invitations');
  }

  const client = await clerkClient();
  const result = await client.invitations.getInvitationList();

  return result.data.map((inv) => ({
    id: inv.id,
    emailAddress: inv.emailAddress,
    status: inv.status,
    publicMetadata: (inv.publicMetadata ?? {}) as Record<string, unknown>,
    createdAt: inv.createdAt,
    updatedAt: inv.updatedAt,
  }));
}

/**
 * Revoke a pending invitation
 */
export async function revokeInvitation(invitationId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const currentRole = await getAdminRole(userId);
  if (currentRole !== 'SUPER_ADMIN') {
    throw new Error('Only Super Admins can revoke invitations');
  }

  const client = await clerkClient();
  await client.invitations.revokeInvitation(invitationId);

  revalidatePath('/admin/users');
  return { success: true };
}

/**
 * Resend an invitation (revokes existing, creates new with same metadata)
 */
export async function resendInvitation(invitationId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const currentRole = await getAdminRole(userId);
  if (currentRole !== 'SUPER_ADMIN') {
    throw new Error('Only Super Admins can resend invitations');
  }

  const client = await clerkClient();

  // Fetch the existing invitation to preserve its metadata
  const allInvitations = await client.invitations.getInvitationList();
  const existing = allInvitations.data.find((inv) => inv.id === invitationId);
  if (!existing) {
    throw new Error('Invitation not found');
  }
  if (existing.status !== 'pending') {
    throw new Error('Only pending invitations can be resent');
  }

  const emailAddress = existing.emailAddress;
  const publicMetadata = existing.publicMetadata;

  // Revoke the old one
  await client.invitations.revokeInvitation(invitationId);

  // Create a fresh invitation
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  await client.invitations.createInvitation({
    emailAddress,
    redirectUrl: `${appUrl}/sign-up`,
    publicMetadata: publicMetadata ?? undefined,
  });

  revalidatePath('/admin/users');
  return { success: true };
}
