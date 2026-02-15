/**
 * Compliance Documents Server Actions
 *
 * Handles upload, verification, and management of worker compliance documents.
 * Includes antivirus scanning for uploaded files.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { put, del } from '@vercel/blob';
import { db } from '@/lib/db';
import { DocType, DocStatus, ComplianceStatus } from '@prisma/client';
import { validateFile } from '@/lib/file-scanner';

// Allowed document types
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Max file size (10MB for compliance docs)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface UploadDocumentResult {
  success: boolean;
  documentId?: string;
  error?: string;
}

/**
 * Upload a compliance document for a worker.
 */
export async function uploadComplianceDocument(
  workerId: string,
  formData: FormData
): Promise<UploadDocumentResult> {
  try {
    const file = formData.get('file') as File | null;
    const docType = formData.get('docType') as DocType | null;
    const name = formData.get('name') as string | null;
    const expiresAt = formData.get('expiresAt') as string | null;
    const issuedDate = formData.get('issuedDate') as string | null;

    // Validate inputs
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    if (!docType || !Object.values(DocType).includes(docType)) {
      return { success: false, error: 'Invalid document type' };
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: 'Document name is required' };
    }

    // Verify worker exists
    const worker = await db.worker.findUnique({ where: { id: workerId } });
    if (!worker) {
      return { success: false, error: 'Worker not found' };
    }

    // Convert file to buffer for validation and scanning
    const buffer = Buffer.from(await file.arrayBuffer());

    // Comprehensive file validation with antivirus scan
    const validationResult = await validateFile(buffer, file.name, file.type, {
      maxSize: MAX_FILE_SIZE,
      allowedTypes: ALLOWED_TYPES,
      requireScan: process.env.REQUIRE_ANTIVIRUS_SCAN === 'true',
    });

    if (!validationResult.valid) {
      return { success: false, error: validationResult.errors.join('. ') };
    }

    // Log if scan was skipped (for monitoring)
    if (!validationResult.scanned) {
      console.warn(`[Compliance] Antivirus scan skipped for ${file.name} (workerId: ${workerId})`);
    }

    // Generate safe filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'pdf';
    const safeBaseName = name
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .substring(0, 50);
    const filename = `compliance/${workerId}/${timestamp}-${safeBaseName}-${randomSuffix}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
    });

    // Create ComplianceDoc record
    const doc = await db.complianceDoc.create({
      data: {
        workerId,
        type: docType,
        name: name.trim(),
        fileUrl: blob.url,
        fileName: file.name,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        issuedDate: issuedDate ? new Date(issuedDate) : null,
        status: DocStatus.PENDING_REVIEW,
      },
    });

    // Update worker compliance status to PENDING if not already compliant
    if (worker.complianceStatus !== ComplianceStatus.COMPLIANT) {
      await db.worker.update({
        where: { id: workerId },
        data: { complianceStatus: ComplianceStatus.PENDING },
      });
    }

    revalidatePath('/employee/compliance');
    revalidatePath(`/admin/workers/${workerId}`);
    revalidatePath('/admin/compliance');

    return { success: true, documentId: doc.id };
  } catch (error) {
    console.error('[Compliance] Upload error:', error);
    return { success: false, error: 'Failed to upload document' };
  }
}

/**
 * Delete a compliance document.
 */
export async function deleteComplianceDocument(
  documentId: string,
  workerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find the document
    const doc = await db.complianceDoc.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      return { success: false, error: 'Document not found' };
    }

    // Verify ownership
    if (doc.workerId !== workerId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Only allow deletion of pending documents
    if (doc.status === DocStatus.APPROVED) {
      return { success: false, error: 'Cannot delete approved documents' };
    }

    // Delete from blob storage
    try {
      await del(doc.fileUrl);
    } catch (e) {
      console.warn('[Compliance] Failed to delete blob:', e);
      // Continue with DB deletion even if blob delete fails
    }

    // Delete from database
    await db.complianceDoc.delete({ where: { id: documentId } });

    // Recalculate worker compliance status
    await recalculateComplianceStatus(workerId);

    revalidatePath('/employee/compliance');
    revalidatePath(`/admin/workers/${workerId}`);

    return { success: true };
  } catch (error) {
    console.error('[Compliance] Delete error:', error);
    return { success: false, error: 'Failed to delete document' };
  }
}

/**
 * Admin: Approve a compliance document.
 */
export async function approveComplianceDocument(
  documentId: string,
  adminUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const doc = await db.complianceDoc.update({
      where: { id: documentId },
      data: {
        status: DocStatus.APPROVED,
        verifiedBy: adminUserId,
        verifiedAt: new Date(),
        rejectionNote: null,
      },
    });

    // Recalculate worker compliance status
    await recalculateComplianceStatus(doc.workerId);

    revalidatePath(`/admin/workers/${doc.workerId}`);
    revalidatePath('/admin/compliance');
    revalidatePath('/employee/compliance');

    return { success: true };
  } catch (error) {
    console.error('[Compliance] Approve error:', error);
    return { success: false, error: 'Failed to approve document' };
  }
}

/**
 * Admin: Reject a compliance document.
 */
export async function rejectComplianceDocument(
  documentId: string,
  adminUserId: string,
  rejectionNote: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!rejectionNote || rejectionNote.trim().length === 0) {
      return { success: false, error: 'Rejection reason is required' };
    }

    const doc = await db.complianceDoc.update({
      where: { id: documentId },
      data: {
        status: DocStatus.REJECTED,
        verifiedBy: adminUserId,
        verifiedAt: new Date(),
        rejectionNote: rejectionNote.trim(),
      },
    });

    // Recalculate worker compliance status
    await recalculateComplianceStatus(doc.workerId);

    revalidatePath(`/admin/workers/${doc.workerId}`);
    revalidatePath('/admin/compliance');
    revalidatePath('/employee/compliance');

    return { success: true };
  } catch (error) {
    console.error('[Compliance] Reject error:', error);
    return { success: false, error: 'Failed to reject document' };
  }
}

/**
 * Recalculate a worker's overall compliance status based on their documents.
 */
async function recalculateComplianceStatus(workerId: string): Promise<void> {
  const docs = await db.complianceDoc.findMany({
    where: { workerId },
  });

  if (docs.length === 0) {
    await db.worker.update({
      where: { id: workerId },
      data: { complianceStatus: ComplianceStatus.INCOMPLETE },
    });
    return;
  }

  // Check for expired documents
  const now = new Date();
  const hasExpired = docs.some(
    (doc) => doc.expiresAt && doc.expiresAt < now && doc.status === DocStatus.APPROVED
  );

  if (hasExpired) {
    await db.worker.update({
      where: { id: workerId },
      data: { complianceStatus: ComplianceStatus.EXPIRED },
    });
    return;
  }

  // Check if any documents are pending review
  const hasPending = docs.some((doc) => doc.status === DocStatus.PENDING_REVIEW);

  if (hasPending) {
    await db.worker.update({
      where: { id: workerId },
      data: { complianceStatus: ComplianceStatus.PENDING },
    });
    return;
  }

  // Check if any documents are rejected
  const hasRejected = docs.some((doc) => doc.status === DocStatus.REJECTED);

  if (hasRejected) {
    await db.worker.update({
      where: { id: workerId },
      data: { complianceStatus: ComplianceStatus.INCOMPLETE },
    });
    return;
  }

  // All documents approved and not expired
  const allApproved = docs.every((doc) => doc.status === DocStatus.APPROVED);

  if (allApproved) {
    await db.worker.update({
      where: { id: workerId },
      data: { complianceStatus: ComplianceStatus.COMPLIANT },
    });
    return;
  }

  // Default to incomplete
  await db.worker.update({
    where: { id: workerId },
    data: { complianceStatus: ComplianceStatus.INCOMPLETE },
  });
}

/**
 * Get compliance documents for a worker.
 */
export async function getWorkerComplianceDocuments(workerId: string) {
  return db.complianceDoc.findMany({
    where: { workerId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get all pending compliance documents (for admin review queue).
 */
export async function getPendingComplianceDocuments() {
  return db.complianceDoc.findMany({
    where: { status: DocStatus.PENDING_REVIEW },
    include: {
      worker: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' }, // Oldest first
  });
}

/**
 * Get compliance documents expiring soon (within 30 days).
 */
export async function getExpiringComplianceDocuments(days: number = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);

  return db.complianceDoc.findMany({
    where: {
      status: DocStatus.APPROVED,
      expiresAt: {
        lte: cutoff,
        gt: new Date(), // Not yet expired
      },
    },
    include: {
      worker: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { expiresAt: 'asc' },
  });
}
