'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { UserStatus, ComplianceStatus } from '@prisma/client';

/**
 * Approve a pending worker application
 */
export async function approveWorker(
  workerId: string,
  employeeId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const worker = await db.worker.findUnique({
      where: { id: workerId },
      include: { user: true },
    });

    if (!worker) {
      return { success: false, error: 'Worker not found' };
    }

    if (worker.user.status !== 'PENDING') {
      return { success: false, error: 'Worker is not pending approval' };
    }

    // Generate employee ID if not provided
    const newEmployeeId = employeeId || `EMP-${Date.now().toString().slice(-5)}`;

    // Update user status and worker employee ID
    await db.portalUser.update({
      where: { id: worker.userId },
      data: { status: UserStatus.ACTIVE },
    });

    await db.worker.update({
      where: { id: workerId },
      data: {
        employeeId: newEmployeeId,
        hireDate: new Date(),
      },
    });

    revalidatePath('/admin/workers');
    revalidatePath(`/admin/workers/${workerId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to approve worker:', error);
    return { success: false, error: 'Failed to approve worker' };
  }
}

/**
 * Reject a pending worker application
 */
export async function rejectWorker(
  workerId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const worker = await db.worker.findUnique({
      where: { id: workerId },
      include: { user: true },
    });

    if (!worker) {
      return { success: false, error: 'Worker not found' };
    }

    // Update user status to TERMINATED (rejected)
    await db.portalUser.update({
      where: { id: worker.userId },
      data: { status: UserStatus.TERMINATED },
    });

    // Optionally store rejection reason in notes
    if (reason) {
      await db.worker.update({
        where: { id: workerId },
        data: {
          notes: `Rejected: ${reason}`,
        },
      });
    }

    revalidatePath('/admin/workers');
    revalidatePath(`/admin/workers/${workerId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to reject worker:', error);
    return { success: false, error: 'Failed to reject worker' };
  }
}

/**
 * Update worker status
 */
export async function updateWorkerStatus(
  workerId: string,
  status: UserStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const worker = await db.worker.findUnique({
      where: { id: workerId },
      include: { user: true },
    });

    if (!worker) {
      return { success: false, error: 'Worker not found' };
    }

    await db.portalUser.update({
      where: { id: worker.userId },
      data: { status },
    });

    revalidatePath('/admin/workers');
    revalidatePath(`/admin/workers/${workerId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to update worker status:', error);
    return { success: false, error: 'Failed to update worker status' };
  }
}

/**
 * Update worker compliance status
 */
export async function updateComplianceStatus(
  workerId: string,
  status: ComplianceStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.worker.update({
      where: { id: workerId },
      data: { complianceStatus: status },
    });

    revalidatePath('/admin/workers');
    revalidatePath(`/admin/workers/${workerId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to update compliance status:', error);
    return { success: false, error: 'Failed to update compliance status' };
  }
}
