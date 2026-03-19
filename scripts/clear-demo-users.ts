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
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

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

  // Delete in correct order to respect foreign key constraints
  console.log('Deleting demo users and related data...');
  
  const demoUserIds = demoUsers.map(u => u.id);
  const workerIds = demoUsers.filter(u => u.worker).map(u => u.worker!.id);
  const clientIds = demoUsers.filter(u => u.client).map(u => u.client!.id);

  // 1. Delete records that reference workers/clients but don't cascade
  if (workerIds.length > 0) {
    const timesheets = await prisma.timesheet.findMany({ where: { workerId: { in: workerIds } }, select: { id: true } }).catch(() => []);
    const timesheetIds = timesheets.map(t => t.id);
    if (timesheetIds.length > 0) {
      await prisma.timesheetEntry.deleteMany({ where: { timesheetId: { in: timesheetIds } } }).catch(() => {});
      console.log(`   Deleted timesheet entries`);
    }
    await prisma.timesheet.deleteMany({ where: { workerId: { in: workerIds } } }).catch(() => {});
    console.log(`   Deleted timesheets`);

    await prisma.shiftReview.deleteMany({ where: { workerId: { in: workerIds } } }).catch(() => {
      console.log(`   Skipped shift reviews (table not found)`);
    });

    await prisma.shiftBooking.deleteMany({ where: { workerId: { in: workerIds } } }).catch(() => {});
    console.log(`   Deleted shift bookings`);
  }

  if (clientIds.length > 0) {
    // Find care shifts for these clients
    const careShifts = await prisma.careShift.findMany({ where: { clientId: { in: clientIds } }, select: { id: true } }).catch(() => []);
    const shiftIds = careShifts.map(s => s.id);
    if (shiftIds.length > 0) {
      await prisma.shiftReview.deleteMany({ where: { shiftId: { in: shiftIds } } }).catch(() => {});
      await prisma.shiftBooking.deleteMany({ where: { shiftId: { in: shiftIds } } }).catch(() => {});
      await prisma.careShift.deleteMany({ where: { id: { in: shiftIds } } }).catch(() => {});
      console.log(`   Deleted care shifts and bookings`);
    }

    // Delete invoices
    const invoices = await prisma.invoice.findMany({ where: { clientId: { in: clientIds } }, select: { id: true } }).catch(() => []);
    if (invoices.length > 0) {
      await prisma.invoiceLineItem.deleteMany({ where: { invoiceId: { in: invoices.map(i => i.id) } } }).catch(() => {});
      await prisma.invoice.deleteMany({ where: { clientId: { in: clientIds } } }).catch(() => {});
      console.log(`   Deleted invoices`);
    }
  }

  // 2. Delete testimonials by demo users
  await prisma.testimonial.deleteMany({ where: { submittedById: { in: demoUserIds } } }).catch(() => {
    console.log(`   Skipped testimonials cleanup (column not found)`);
  });

  // 3. Now delete the portal users (cascades to Worker/Client)
  const deleted = await prisma.portalUser.deleteMany({
    where: { id: { in: demoUserIds } },
  });

  console.log(`✓ Deleted ${deleted.count} demo users and their associated data.`);
  
  // Show remaining
  const remaining = await prisma.portalUser.count();
  console.log(`   ${remaining} users remaining in database.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
