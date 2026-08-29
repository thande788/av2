/**
 * Admin Compliance Documents Page
 *
 * Review and verify worker compliance documents.
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { serialize } from '@/lib/utils';
import { maybeSignBlobReadUrl } from '@/lib/azure-blob';
import { DocStatus } from '@prisma/client';
import { ComplianceReviewQueue } from './compliance-review-queue';
import { ExpiringDocumentsAlert } from './expiring-documents-alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const COMPLIANCE_TABS = ['pending', 'expiring', 'expired', 'recent'] as const;

type ComplianceTab = (typeof COMPLIANCE_TABS)[number];

function getExpiredDocumentsWhere(now: Date) {
  return {
    OR: [
      { status: DocStatus.EXPIRED },
      {
        status: DocStatus.APPROVED,
        expiresAt: { lte: now },
      },
    ],
  };
}

export const metadata: Metadata = {
  title: 'Compliance Documents',
  description: 'Review worker compliance documents',
};

async function getComplianceStats() {
  const now = new Date();
  const cutoff = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [pendingCount, expiringCount, expiredCount, totalWorkers, compliantWorkers] =
    await Promise.all([
      db.complianceDoc.count({ where: { status: DocStatus.PENDING_REVIEW } }),
      db.complianceDoc.count({
        where: {
          status: DocStatus.APPROVED,
          expiresAt: {
            lte: cutoff,
            gt: now,
          },
        },
      }),
      db.complianceDoc.count({ where: getExpiredDocumentsWhere(now) }),
      db.worker.count(),
      db.worker.count({ where: { complianceStatus: 'COMPLIANT' } }),
    ]);

  return { pendingCount, expiringCount, expiredCount, totalWorkers, compliantWorkers };
}

async function getPendingDocuments() {
  return db.complianceDoc.findMany({
    where: { status: DocStatus.PENDING_REVIEW },
    include: {
      worker: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

async function getExpiringDocuments() {
  const now = new Date();
  const cutoff = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return db.complianceDoc.findMany({
    where: {
      status: DocStatus.APPROVED,
      expiresAt: {
        lte: cutoff,
        gt: now,
      },
    },
    include: {
      worker: {
        include: { user: true },
      },
    },
    orderBy: { expiresAt: 'asc' },
  });
}

async function getExpiredDocuments() {
  const now = new Date();

  return db.complianceDoc.findMany({
    where: getExpiredDocumentsWhere(now),
    include: {
      worker: {
        include: { user: true },
      },
    },
    orderBy: [{ expiresAt: 'asc' }, { updatedAt: 'desc' }],
  });
}

async function getRecentlyReviewed() {
  return db.complianceDoc.findMany({
    where: {
      status: { in: [DocStatus.APPROVED, DocStatus.REJECTED] },
      verifiedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    include: {
      worker: {
        include: { user: true },
      },
    },
    orderBy: { verifiedAt: 'desc' },
    take: 20,
  });
}

async function signDocUrls<T extends { fileUrl: string }>(docs: T[]): Promise<T[]> {
  return Promise.all(
    docs.map(async (doc) => ({
      ...doc,
      fileUrl: (await maybeSignBlobReadUrl(doc.fileUrl)) || doc.fileUrl,
    })),
  );
}

function CompliancePageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

async function ComplianceContent({ initialTab }: { initialTab: ComplianceTab }) {
  const [stats, pendingDocs, expiringDocs, expiredDocs, recentDocs] = await Promise.all([
    getComplianceStats(),
    getPendingDocuments(),
    getExpiringDocuments(),
    getExpiredDocuments(),
    getRecentlyReviewed(),
  ]);

  const [pendingSigned, expiringSigned, expiredSigned, recentSigned] = await Promise.all([
    signDocUrls(pendingDocs),
    signDocUrls(expiringDocs),
    signDocUrls(expiredDocs),
    signDocUrls(recentDocs),
  ]);

  // Serialize Prisma objects to plain objects for client components
  const serializedPending = serialize(pendingSigned);
  const serializedExpiring = serialize(expiringSigned);
  const serializedExpired = serialize(expiredSigned);
  const serializedRecent = serialize(recentSigned);

  const complianceRate =
    stats.totalWorkers > 0
      ? Math.round((stats.compliantWorkers / stats.totalWorkers) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Compliance Documents
        </h1>
        <p className="mt-1 text-muted-foreground">
          Review and verify worker compliance documents
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pending Review"
          value={stats.pendingCount}
          variant={stats.pendingCount > 0 ? 'warning' : 'default'}
        />
        <StatCard
          label="Expiring Soon"
          value={stats.expiringCount}
          variant={stats.expiringCount > 0 ? 'warning' : 'default'}
        />
        <StatCard
          label="Expired"
          value={stats.expiredCount}
          variant={stats.expiredCount > 0 ? 'danger' : 'default'}
        />
        <StatCard
          label="Compliance Rate"
          value={`${complianceRate}%`}
          variant={complianceRate >= 80 ? 'success' : complianceRate >= 50 ? 'warning' : 'danger'}
        />
      </div>

      {/* Expiring Alert */}
      {serializedExpiring.length > 0 && (
        <ExpiringDocumentsAlert documents={serializedExpiring} />
      )}

      {/* Tabs */}
      <Tabs defaultValue={initialTab} className="space-y-4">
        <TabsList className="bg-transparent border border-border">
          <TabsTrigger value="pending">
            Pending Review
            {stats.pendingCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                {stats.pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="expiring">
            Expiring Soon
            {stats.expiringCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.expiringCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="expired">
            Expired
            {stats.expiredCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500">
                {stats.expiredCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <ComplianceReviewQueue documents={serializedPending} />
        </TabsContent>

        <TabsContent value="expiring">
          <ComplianceReviewQueue documents={serializedExpiring} showExpiry />
        </TabsContent>

        <TabsContent value="expired">
          <ComplianceReviewQueue documents={serializedExpired} showExpiry showStatus />
        </TabsContent>

        <TabsContent value="recent">
          <ComplianceReviewQueue documents={serializedRecent} showStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: number | string;
  variant: 'default' | 'success' | 'warning' | 'danger';
}) {
  const styles = {
    default: 'border-border/50 bg-card',
    success: 'border-emerald-500/40 bg-emerald-500/5',
    warning: 'border-yellow-500/40 bg-yellow-500/5',
    danger: 'border-red-500/40 bg-red-500/5',
  };

  const valueColors = {
    default: 'text-foreground',
    success: 'text-emerald-600 dark:text-emerald-500',
    warning: 'text-yellow-600 dark:text-yellow-500',
    danger: 'text-red-600 dark:text-red-500',
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border p-4 ${styles[variant]}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold ${valueColors[variant]}`}>{value}</p>
      </div>
    </div>
  );
}

interface CompliancePageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function CompliancePage({ searchParams }: CompliancePageProps) {
  const params = await searchParams;
  const requestedTab = params.tab;
  const initialTab: ComplianceTab = COMPLIANCE_TABS.includes(requestedTab as ComplianceTab)
    ? (requestedTab as ComplianceTab)
    : 'pending';

  return (
    <Suspense fallback={<CompliancePageSkeleton />}>
      <ComplianceContent initialTab={initialTab} />
    </Suspense>
  );
}
