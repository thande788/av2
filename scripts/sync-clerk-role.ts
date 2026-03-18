/**
 * Development script to sync a user's role from the database to Clerk
 *
 * Usage:
 *   pnpm tsx scripts/sync-clerk-role.ts <clerk_user_id> [role]
 *
 * Examples:
 *   pnpm tsx scripts/sync-clerk-role.ts user_2abc123def caregiver
 *   pnpm tsx scripts/sync-clerk-role.ts user_2abc123def  # reads from database
 */

import { clerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [clerkUserId, roleArg] = process.argv.slice(2);

  if (!clerkUserId) {
    console.error('Usage: pnpm tsx scripts/sync-clerk-role.ts <clerk_user_id> [role]');
    console.error('');
    console.error('Roles: admin, manager, caregiver, client');
    process.exit(1);
  }

  if (!process.env.CLERK_SECRET_KEY) {
    console.error('CLERK_SECRET_KEY not set in environment');
    process.exit(1);
  }

  const clerk = await clerkClient();

  let role = roleArg?.toLowerCase();

  // If no role provided, try to get from database
  if (!role) {
    const portalUser = await prisma.portalUser.findUnique({
      where: { clerkId: clerkUserId },
      select: { role: true, email: true },
    });

    if (portalUser) {
      role = portalUser.role.toLowerCase();
      console.log(`Found user in database: ${portalUser.email}, role: ${role}`);
    } else {
      console.error(`User ${clerkUserId} not found in database. Provide role as second argument.`);
      process.exit(1);
    }
  }

  // Validate role
  const validRoles = ['admin', 'manager', 'caregiver', 'client'];
  if (!validRoles.includes(role)) {
    console.error(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
    process.exit(1);
  }

  try {
    // Get current user
    const user = await clerk.users.getUser(clerkUserId);
    console.log(`Current publicMetadata:`, user.publicMetadata);

    // Update publicMetadata with role
    await clerk.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        ...user.publicMetadata,
        role,
      },
    });

    console.log(`✓ Successfully set role '${role}' for user ${clerkUserId}`);
    console.log(`  User can now access: ${getAccessDescription(role)}`);
  } catch (error) {
    console.error('Failed to update Clerk user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function getAccessDescription(role: string): string {
  switch (role) {
    case 'admin':
    case 'manager':
      return '/admin, /employee, /client';
    case 'caregiver':
      return '/employee';
    case 'client':
      return '/client';
    default:
      return '/portals (selection page)';
  }
}

main();
