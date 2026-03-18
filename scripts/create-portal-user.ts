/**
 * Create or update a PortalUser record for a real Clerk user
 *
 * Usage:
 *   pnpm tsx scripts/create-portal-user.ts <clerkId> <email> <firstName> <lastName> <role>
 *
 * Examples:
 *   pnpm tsx scripts/create-portal-user.ts user_2abc123def admin@example.com John Smith admin
 *   pnpm tsx scripts/create-portal-user.ts user_2xyz789ghi caregiver@example.com Jane Doe caregiver
 */

import { PrismaClient, UserRole, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [clerkId, email, firstName, lastName, roleArg] = process.argv.slice(2);

  if (!clerkId || !email || !firstName || !lastName || !roleArg) {
    console.error('Usage: pnpm tsx scripts/create-portal-user.ts <clerkId> <email> <firstName> <lastName> <role>');
    console.error('');
    console.error('Arguments:');
    console.error('  clerkId   - Clerk user ID (starts with user_)');
    console.error('  email     - User email address');
    console.error('  firstName - First name');
    console.error('  lastName  - Last name');
    console.error('  role      - One of: admin, manager, caregiver, client');
    console.error('');
    console.error('Example:');
    console.error('  pnpm tsx scripts/create-portal-user.ts user_2abc123 admin@example.com John Smith admin');
    process.exit(1);
  }

  // Map role string to enum
  const roleMap: Record<string, UserRole> = {
    admin: UserRole.ADMIN,
    manager: UserRole.MANAGER,
    caregiver: UserRole.CAREGIVER,
    client: UserRole.CLIENT,
  };

  const role = roleMap[roleArg.toLowerCase()];
  if (!role) {
    console.error(`Invalid role: ${roleArg}`);
    console.error(`Valid roles: admin, manager, caregiver, client`);
    process.exit(1);
  }

  try {
    // Check if user already exists
    const existing = await prisma.portalUser.findFirst({
      where: {
        OR: [
          { clerkId },
          { email },
        ],
      },
    });

    if (existing) {
      // Update existing user
      const updated = await prisma.portalUser.update({
        where: { id: existing.id },
        data: {
          clerkId,
          email,
          firstName,
          lastName,
          role,
          status: UserStatus.ACTIVE,
        },
      });
      console.log(`✓ Updated existing user: ${updated.email}`);
      console.log(`  ID:       ${updated.id}`);
      console.log(`  Clerk ID: ${updated.clerkId}`);
      console.log(`  Role:     ${updated.role}`);
    } else {
      // Create new user
      const created = await prisma.portalUser.create({
        data: {
          clerkId,
          email,
          firstName,
          lastName,
          role,
          status: UserStatus.ACTIVE,
        },
      });
      console.log(`✓ Created new user: ${created.email}`);
      console.log(`  ID:       ${created.id}`);
      console.log(`  Clerk ID: ${created.clerkId}`);
      console.log(`  Role:     ${created.role}`);
    }

    console.log('');
    console.log('Next step: Set role in Clerk publicMetadata');
    console.log(`  pnpm tsx scripts/sync-clerk-role.ts ${clerkId} ${roleArg}`);

  } catch (error) {
    console.error('Failed to create/update user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
