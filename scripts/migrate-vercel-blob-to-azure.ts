/**
 * Migrate file URLs from Vercel Blob to Azure Blob Storage.
 *
 * Usage:
 *   pnpm tsx scripts/migrate-vercel-blob-to-azure.ts --dry-run
 *   pnpm tsx scripts/migrate-vercel-blob-to-azure.ts
 */

import { config } from 'dotenv';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import { getStorageContainer, uploadBufferToAzureBlob } from '../lib/azure-blob';

config({ path: '.env' });
config({ path: '.env.local', override: true });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set.');
}

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({
  adapter,
  log: ['error'],
});

const dryRun = process.argv.includes('--dry-run');

type Target = {
  model: 'application' | 'worker' | 'complianceDoc';
  id: string;
  field: 'resumeUrl' | 'coverLetterUrl' | 'marketingPhotoUrl' | 'fileUrl';
  sourceUrl: string;
  container: string;
};

function isVercelBlobUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.includes('vercel-storage.com');
  } catch {
    return false;
  }
}

function guessContentType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.doc')) return 'application/msword';
  if (lower.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  return 'application/octet-stream';
}

function buildBlobName(target: Target): string {
  let parsedPath = '';

  try {
    parsedPath = decodeURIComponent(new URL(target.sourceUrl).pathname).replace(/^\/+/, '');
  } catch {
    parsedPath = '';
  }

  const fileName =
    parsedPath.split('/').filter(Boolean).pop()?.replace(/[^a-zA-Z0-9._-]/g, '_') ||
    `${target.field}-${target.id}`;

  return `migrated/${target.model}/${target.field}/${target.id}/${fileName}`;
}

async function fetchSource(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed with ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const contentTypeHeader = response.headers.get('content-type')?.split(';')[0]?.trim();

  return {
    buffer: Buffer.from(arrayBuffer),
    contentType: contentTypeHeader || guessContentType(url),
  };
}

async function getTargets(): Promise<Target[]> {
  const uploadsContainer = getStorageContainer('AZURE_STORAGE_UPLOADS_CONTAINER', 'uploads');
  const marketingContainer = getStorageContainer('AZURE_STORAGE_MARKETING_CONTAINER', 'uploads');
  const complianceContainer = getStorageContainer('AZURE_STORAGE_COMPLIANCE_CONTAINER', 'uploads');

  const [applications, workers, complianceDocs] = await Promise.all([
    db.application.findMany({
      select: { id: true, resumeUrl: true, coverLetterUrl: true },
      where: {
        OR: [{ resumeUrl: { not: null } }, { coverLetterUrl: { not: null } }],
      },
    }),
    db.worker.findMany({
      select: { id: true, marketingPhotoUrl: true },
      where: { marketingPhotoUrl: { not: null } },
    }),
    db.complianceDoc.findMany({
      select: { id: true, fileUrl: true },
    }),
  ]);

  const targets: Target[] = [];

  for (const row of applications) {
    if (row.resumeUrl) {
      targets.push({
        model: 'application',
        id: row.id,
        field: 'resumeUrl',
        sourceUrl: row.resumeUrl,
        container: uploadsContainer,
      });
    }

    if (row.coverLetterUrl) {
      targets.push({
        model: 'application',
        id: row.id,
        field: 'coverLetterUrl',
        sourceUrl: row.coverLetterUrl,
        container: uploadsContainer,
      });
    }
  }

  for (const row of workers) {
    if (!row.marketingPhotoUrl) continue;
    targets.push({
      model: 'worker',
      id: row.id,
      field: 'marketingPhotoUrl',
      sourceUrl: row.marketingPhotoUrl,
      container: marketingContainer,
    });
  }

  for (const row of complianceDocs) {
    targets.push({
      model: 'complianceDoc',
      id: row.id,
      field: 'fileUrl',
      sourceUrl: row.fileUrl,
      container: complianceContainer,
    });
  }

  return targets;
}

async function updateTargetUrl(target: Target, newUrl: string): Promise<void> {
  if (target.model === 'application') {
    const data =
      target.field === 'resumeUrl'
        ? { resumeUrl: newUrl }
        : { coverLetterUrl: newUrl };

    await db.application.update({
      where: { id: target.id },
      data,
    });
    return;
  }

  if (target.model === 'worker') {
    await db.worker.update({
      where: { id: target.id },
      data: { marketingPhotoUrl: newUrl },
    });
    return;
  }

  await db.complianceDoc.update({
    where: { id: target.id },
    data: { fileUrl: newUrl },
  });
}

async function main(): Promise<void> {
  const targets = await getTargets();
  let inspected = 0;
  let eligible = 0;
  let migrated = 0;
  let failed = 0;

  for (const target of targets) {
    inspected += 1;

    if (!isVercelBlobUrl(target.sourceUrl)) {
      continue;
    }

    eligible += 1;

    if (dryRun) {
      console.log(`[DRY-RUN] ${target.model}.${target.field}(${target.id}) -> ${target.container}`);
      continue;
    }

    try {
      const source = await fetchSource(target.sourceUrl);
      const blobName = buildBlobName(target);
      const uploaded = await uploadBufferToAzureBlob({
        container: target.container,
        blobName,
        data: source.buffer,
        contentType: source.contentType,
      });

      await updateTargetUrl(target, uploaded.url);
      migrated += 1;
      console.log(`[MIGRATED] ${target.model}.${target.field}(${target.id})`);
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[FAILED] ${target.model}.${target.field}(${target.id}): ${message}`);
    }
  }

  console.log('---');
  console.log(`inspected: ${inspected}`);
  console.log(`eligible (vercel urls): ${eligible}`);
  console.log(`migrated: ${migrated}`);
  console.log(`failed: ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
