import { ApplicationStatus, DocStatus, InquiryStatus, SwapStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { AdminSidebar } from './sidebar';
import type { AdminBadgeCounts } from './navigation-config';

async function safeCount(operation: Promise<number>): Promise<number> {
  try {
    return await operation;
  } catch {
    return 0;
  }
}

async function getAdminSidebarBadgeCounts(): Promise<AdminBadgeCounts> {
  const now = new Date();

  const [applicationsPending, contactsUnread, inquiriesNew, swapRequestsPending, compliancePendingReview, complianceExpired] =
    await Promise.all([
      safeCount(db.application.count({
        where: { status: ApplicationStatus.PENDING },
      })),
      safeCount(db.contactSubmission.count({
        where: { isRead: false },
      })),
      safeCount(db.serviceInquiry.count({
        where: { status: InquiryStatus.NEW },
      })),
      safeCount(db.swapRequest.count({
        where: { status: SwapStatus.PENDING },
      })),
      safeCount(db.complianceDoc.count({
        where: { status: DocStatus.PENDING_REVIEW },
      })),
      safeCount(db.complianceDoc.count({
        where: {
          OR: [
            { status: DocStatus.EXPIRED },
            {
              status: DocStatus.APPROVED,
              expiresAt: { lte: now },
            },
          ],
        },
      })),
    ]);

  return {
    applicationsPending,
    contactsUnread,
    inquiriesNew,
    swapRequestsPending,
    complianceAttention: compliancePendingReview + complianceExpired,
  };
}

export async function AdminSidebarShell() {
  const badgeCounts = await getAdminSidebarBadgeCounts();

  return <AdminSidebar badgeCounts={badgeCounts} />;
}
