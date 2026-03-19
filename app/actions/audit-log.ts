'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Log an admin action to the audit trail.
 * Call this from any server action that modifies data.
 */
export async function logAuditEvent({
  action,
  entity,
  entityId,
  details,
}: {
  action: string;
  entity: string;
  entityId: string;
  details?: Record<string, unknown>;
}) {
  const { userId } = await auth();
  if (!userId) return;

  const user = await currentUser();
  const userName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0]?.emailAddress
    : undefined;

  await db.auditLog.create({
    data: {
      userId,
      userName,
      action,
      entity,
      entityId,
      details: details ? JSON.parse(JSON.stringify(details)) : undefined,
    },
  });
}

/**
 * Get audit log entries for a specific entity
 */
export async function getEntityAuditLog(entity: string, entityId: string) {
  return db.auditLog.findMany({
    where: { entity, entityId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

/**
 * Get recent audit log entries across all entities
 */
export async function getRecentAuditLog(limit = 50) {
  return db.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get filtered audit log entries
 */
export async function getFilteredAuditLog({
  entity,
  action,
  userId,
  limit = 100,
}: {
  entity?: string;
  action?: string;
  userId?: string;
  limit?: number;
} = {}) {
  return db.auditLog.findMany({
    where: {
      ...(entity && { entity }),
      ...(action && { action }),
      ...(userId && { userId }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

// =============================================================================
// BULK ACTIONS (with audit logging)
// =============================================================================

/**
 * Bulk update application status
 */
export async function bulkUpdateApplicationStatus(
  ids: string[],
  status: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db.application.updateMany({
    where: { id: { in: ids } },
    data: { status: status as never },
  });

  await logAuditEvent({
    action: 'BULK_STATUS_UPDATE',
    entity: 'Application',
    entityId: ids.join(','),
    details: { ids, newStatus: status, count: ids.length },
  });

  revalidatePath('/admin/applications');
}

/**
 * Bulk mark contacts as read
 */
export async function bulkMarkContactsRead(ids: string[]) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db.contactSubmission.updateMany({
    where: { id: { in: ids } },
    data: { isRead: true },
  });

  await logAuditEvent({
    action: 'BULK_MARK_READ',
    entity: 'ContactSubmission',
    entityId: ids.join(','),
    details: { ids, count: ids.length },
  });

  revalidatePath('/admin/contacts');
}

/**
 * Bulk update inquiry status
 */
export async function bulkUpdateInquiryStatus(
  ids: string[],
  status: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db.serviceInquiry.updateMany({
    where: { id: { in: ids } },
    data: { status: status as never },
  });

  await logAuditEvent({
    action: 'BULK_STATUS_UPDATE',
    entity: 'ServiceInquiry',
    entityId: ids.join(','),
    details: { ids, newStatus: status, count: ids.length },
  });

  revalidatePath('/admin/inquiries');
}

/**
 * Bulk delete contacts
 */
export async function bulkDeleteContacts(ids: string[]) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db.contactSubmission.deleteMany({
    where: { id: { in: ids } },
  });

  await logAuditEvent({
    action: 'BULK_DELETE',
    entity: 'ContactSubmission',
    entityId: ids.join(','),
    details: { ids, count: ids.length },
  });

  revalidatePath('/admin/contacts');
}

/**
 * Bulk delete inquiries
 */
export async function bulkDeleteInquiries(ids: string[]) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db.serviceInquiry.deleteMany({
    where: { id: { in: ids } },
  });

  await logAuditEvent({
    action: 'BULK_DELETE',
    entity: 'ServiceInquiry',
    entityId: ids.join(','),
    details: { ids, count: ids.length },
  });

  revalidatePath('/admin/inquiries');
}
