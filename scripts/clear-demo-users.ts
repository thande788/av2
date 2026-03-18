/**
 * Clear demo portal users from the database
 * 
 * This removes users with fake clerkIds (not starting with 'user_')
 * 
 * Usage:
 *   pnpm tsx scripts/clear-demo-users.ts         # Dry run (show what would be deleted)
 *   pnpm tsx scripts/clear-demo-users.ts --force # Actually delete
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const force = process.argv.includes('--force');

  // Find demo users (clerkId doesn't start with 'user_')
  const demoUsers = await prisma.portalUser.findMany({
    where: {
      NOT: {
        clerkId: { startsWith: 'user_' },
      },
    },
    include: {
      worker: { select: { id: true } },
      client: { select: { id: true } },
    },
  });

  // Find real users
  const realUsers = await prisma.portalUser.findMany({
    where: {
      clerkId: { startsWith: 'user_' },
    },
  });

  console.log('\n📊 Database Summary');
  console.log('─'.repeat(50));
  console.log(`Demo users (fake clerkId):     ${demoUsers.length}`);
  console.log(`Real users (valid clerkId):    ${realUsers.length}`);
  console.log('');

  if (demoUsers.length === 0) {
    console.log('✓ No demo users to clear.');
    return;
  }

  console.log('🗑️  Demo users to delete:');
  for (const user of demoUsers) {
    const profile = user.worker ? 'Worker' : user.client ? 'Client' : 'No profile';
    console.log(`   ${user.email} (${user.role}) - ${profile}`);
  }
  console.log('');

  if (!force) {
    console.log('⚠️  Dry run mode. No changes made.');
    console.log('   Run with --force to actually delete:');
    console.log('   pnpm tsx scripts/clear-demo-users.ts --force');
    return;
  }

  // Delete in correct order (cascade handles most, but be explicit)
  console.log('Deleting demo users...');
  
  // Get IDs for cascade deletion
  const demoUserIds = demoUsers.map(u => u.id);
  
  // Delete users (will cascade to worker/client)
  const deleted = await prisma.portalUser.deleteMany({
    where: {
      id: { in: demoUserIds },
    },
  });

  console.log(`✓ Deleted ${deleted.count} demo users and their associated data.`);
  
  // Show remaining
  const remaining = await prisma.portalUser.count();
  console.log(`   ${remaining} users remaining in database.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
