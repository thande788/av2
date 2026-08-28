/**
 * Backfill existing plaintext PII into encrypted/hash-aware storage.
 *
 * Usage:
 *   pnpm tsx scripts/backfill-pii.ts
 *   pnpm tsx scripts/backfill-pii.ts --dry-run
 */

import { config } from 'dotenv';

config({ path: '.env' });
config({ path: '.env.local', override: true });

let db: Awaited<typeof import('../lib/db')>['default'];

const dryRun = process.argv.includes('--dry-run');

type Step = {
  name: string;
  run: () => Promise<number>;
};

async function backfillById<T extends { id: string }>(
  rows: T[],
  updater: (row: T) => Promise<void>
): Promise<number> {
  let updated = 0;

  for (const row of rows) {
    if (!dryRun) {
      await updater(row);
    }
    updated += 1;
  }

  return updated;
}

async function main() {
  ({ default: db } = await import('../lib/db'));

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Load .env/.env.local before running backfill.');
  }

  const steps: Step[] = [
    {
      name: 'PortalUser (email/phone)',
      run: async () => {
        const rows = await db.portalUser.findMany({
          select: { id: true, email: true, phone: true },
        });

        return backfillById(rows, async (row) => {
          await db.portalUser.update({
            where: { id: row.id },
            data: {
              email: row.email,
              phone: row.phone,
            },
          });
        });
      },
    },
    {
      name: 'Client (street/emergency/billingEmail/care notes/access notes/DOB)',
      run: async () => {
        const rows = await db.client.findMany({
          select: {
            id: true,
            street: true,
            emergencyName: true,
            emergencyPhone: true,
            billingEmail: true,
            careNotes: true,
            accessNotes: true,
            careRecipientDOB: true,
          },
        });

        return backfillById(rows, async (row) => {
          await db.client.update({
            where: { id: row.id },
            data: {
              street: row.street,
              emergencyName: row.emergencyName,
              emergencyPhone: row.emergencyPhone,
              billingEmail: row.billingEmail,
              careNotes: row.careNotes,
              accessNotes: row.accessNotes,
              careRecipientDOB: row.careRecipientDOB,
            },
          });
        });
      },
    },
    {
      name: 'Worker (street/notes)',
      run: async () => {
        const rows = await db.worker.findMany({
          select: { id: true, street: true, notes: true },
        });

        return backfillById(rows, async (row) => {
          await db.worker.update({
            where: { id: row.id },
            data: {
              street: row.street,
              notes: row.notes,
            },
          });
        });
      },
    },
    {
      name: 'CareRecipient (notes/DOB)',
      run: async () => {
        const rows = await db.careRecipient.findMany({
          select: { id: true, notes: true, dateOfBirth: true },
        });

        return backfillById(rows, async (row) => {
          await db.careRecipient.update({
            where: { id: row.id },
            data: {
              notes: row.notes,
              dateOfBirth: row.dateOfBirth,
            },
          });
        });
      },
    },
    {
      name: 'Application (email/phone/street/additional/internal notes)',
      run: async () => {
        const rows = await db.application.findMany({
          select: {
            id: true,
            email: true,
            phone: true,
            street: true,
            additionalInfo: true,
            internalNotes: true,
          },
        });

        return backfillById(rows, async (row) => {
          await db.application.update({
            where: { id: row.id },
            data: {
              email: row.email,
              phone: row.phone,
              street: row.street,
              additionalInfo: row.additionalInfo,
              internalNotes: row.internalNotes,
            },
          });
        });
      },
    },
    {
      name: 'ContactSubmission (email/phone/message)',
      run: async () => {
        const rows = await db.contactSubmission.findMany({
          select: { id: true, email: true, phone: true, message: true },
        });

        return backfillById(rows, async (row) => {
          await db.contactSubmission.update({
            where: { id: row.id },
            data: {
              email: row.email,
              phone: row.phone,
              message: row.message,
            },
          });
        });
      },
    },
    {
      name: 'ServiceInquiry (email/phone/message)',
      run: async () => {
        const rows = await db.serviceInquiry.findMany({
          select: { id: true, email: true, phone: true, message: true },
        });

        return backfillById(rows, async (row) => {
          await db.serviceInquiry.update({
            where: { id: row.id },
            data: {
              email: row.email,
              phone: row.phone,
              message: row.message,
            },
          });
        });
      },
    },
    {
      name: 'CareShift (notes)',
      run: async () => {
        const rows = await db.careShift.findMany({
          select: { id: true, notes: true },
        });

        return backfillById(rows, async (row) => {
          await db.careShift.update({
            where: { id: row.id },
            data: { notes: row.notes },
          });
        });
      },
    },
    {
      name: 'ShiftNote (content)',
      run: async () => {
        const rows = await db.shiftNote.findMany({
          select: { id: true, content: true },
        });

        return backfillById(rows, async (row) => {
          await db.shiftNote.update({
            where: { id: row.id },
            data: { content: row.content },
          });
        });
      },
    },
    {
      name: 'SatisfactionSurvey (comment)',
      run: async () => {
        const rows = await db.satisfactionSurvey.findMany({
          select: { id: true, comment: true },
        });

        return backfillById(rows, async (row) => {
          await db.satisfactionSurvey.update({
            where: { id: row.id },
            data: { comment: row.comment },
          });
        });
      },
    },
    {
      name: 'SwapRequest (reason)',
      run: async () => {
        const rows = await db.swapRequest.findMany({
          select: { id: true, reason: true },
        });

        return backfillById(rows, async (row) => {
          await db.swapRequest.update({
            where: { id: row.id },
            data: { reason: row.reason },
          });
        });
      },
    },
    {
      name: 'EmergencyIncident (description/resolution)',
      run: async () => {
        const rows = await db.emergencyIncident.findMany({
          select: { id: true, description: true, resolution: true },
        });

        return backfillById(rows, async (row) => {
          await db.emergencyIncident.update({
            where: { id: row.id },
            data: {
              description: row.description,
              resolution: row.resolution,
            },
          });
        });
      },
    },
    {
      name: 'TimesheetEntry (workDescription)',
      run: async () => {
        const rows = await db.timesheetEntry.findMany({
          select: { id: true, workDescription: true },
        });

        return backfillById(rows, async (row) => {
          await db.timesheetEntry.update({
            where: { id: row.id },
            data: { workDescription: row.workDescription },
          });
        });
      },
    },
    {
      name: 'Invoice (notes)',
      run: async () => {
        const rows = await db.invoice.findMany({
          select: { id: true, notes: true },
        });

        return backfillById(rows, async (row) => {
          await db.invoice.update({
            where: { id: row.id },
            data: { notes: row.notes },
          });
        });
      },
    },
  ];

  let total = 0;

  console.log(`PII backfill started (${dryRun ? 'dry-run' : 'live'})`);
  for (const step of steps) {
    const count = await step.run();
    total += count;
    console.log(`- ${step.name}: ${count}`);
  }

  console.log(`Done. Processed ${total} rows.`);
}

main()
  .catch((error) => {
    console.error('PII backfill failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
