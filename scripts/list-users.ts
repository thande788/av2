/**
 * List all portal users in the database
 *
 * Usage:
 *   pnpm tsx scripts/list-users.ts           # List all users
 *   pnpm tsx scripts/list-users.ts caregiver # Filter by role
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roleFilter = process.argv[2]?.toUpperCase();

  const users = await prisma.portalUser.findMany({
    where: roleFilter ? { role: roleFilter as 'ADMIN' | 'MANAGER' | 'CAREGIVER' | 'CLIENT' } : undefined,
    include: {
      worker: { select: { id: true, complianceStatus: true } },
      client: { select: { id: true, type: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`\n📋 Portal Users (${users.length} total)\n`);
  console.log('─'.repeat(100));

  if (users.length === 0) {
    console.log('No users found.');
    return;
  }

  for (const user of users) {
    const hasProfile = user.worker ? '✓ Worker' : user.client ? '✓ Client' : '✗ No profile';
    console.log(`
  ID:       ${user.id}
  Clerk ID: ${user.clerkId}
  Email:    ${user.email}
  Name:     ${user.firstName} ${user.lastName}
  Role:     ${user.role}
  Status:   ${user.status}
  Profile:  ${hasProfile}
  Created:  ${user.createdAt.toISOString()}
${'─'.repeat(100)}`);
  }

  // Summary
  const byRole = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📊 Summary by Role:');
  Object.entries(byRole).forEach(([role, count]) => {
    console.log(`   ${role}: ${count}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
