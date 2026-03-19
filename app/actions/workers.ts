'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { UserStatus, ComplianceStatus, ProfileStatus } from '@prisma/client';

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

/**
 * Update worker profile (admin action)
 * Allows admins to modify worker details including employee ID
 */
export async function updateWorker(
  workerId: string,
  data: {
    employeeId?: string;
    payRate?: number;
    skills?: string[];
    languages?: string[];
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    notes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if employeeId is being changed and is unique
    if (data.employeeId) {
      const existing = await db.worker.findUnique({
        where: { employeeId: data.employeeId },
      });
      
      if (existing && existing.id !== workerId) {
        return { 
          success: false, 
          error: `Employee ID "${data.employeeId}" is already assigned to another worker` 
        };
      }
    }

    await db.worker.update({
      where: { id: workerId },
      data: {
        ...(data.employeeId !== undefined && { employeeId: data.employeeId }),
        ...(data.payRate !== undefined && { payRate: data.payRate }),
        ...(data.skills !== undefined && { skills: data.skills }),
        ...(data.languages !== undefined && { languages: data.languages }),
        ...(data.street !== undefined && { street: data.street }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.zip !== undefined && { zip: data.zip }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    revalidatePath('/admin/workers');
    revalidatePath(`/admin/workers/${workerId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to update worker:', error);
    return { success: false, error: 'Failed to update worker' };
  }
}

/**
 * Approve a worker's marketing profile for public display.
 */
export async function approveWorkerProfile(
  workerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const worker = await db.worker.findUnique({
      where: { id: workerId },
    });

    if (!worker) {
      return { success: false, error: 'Worker not found' };
    }

    if (worker.profileStatus !== 'PENDING_REVIEW') {
      return { success: false, error: 'Profile is not pending review' };
    }

    await db.worker.update({
      where: { id: workerId },
      data: {
        profileStatus: ProfileStatus.APPROVED,
        profileReviewedAt: new Date(),
        profileRejectionNote: null,
      },
    });

    revalidatePath('/admin/workers');
    revalidatePath(`/admin/workers/${workerId}`);
    revalidatePath('/admin/caregivers');
    revalidatePath('/employee/profile');
    revalidatePath('/caregivers');

    return { success: true };
  } catch (error) {
    console.error('Failed to approve worker profile:', error);
    return { success: false, error: 'Failed to approve profile' };
  }
}

/**
 * Reject a worker's marketing profile with feedback.
 */
export async function rejectWorkerProfile(
  workerId: string,
  note: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const worker = await db.worker.findUnique({
      where: { id: workerId },
    });

    if (!worker) {
      return { success: false, error: 'Worker not found' };
    }

    if (worker.profileStatus !== 'PENDING_REVIEW') {
      return { success: false, error: 'Profile is not pending review' };
    }

    await db.worker.update({
      where: { id: workerId },
      data: {
        profileStatus: ProfileStatus.REJECTED,
        profileReviewedAt: new Date(),
        profileRejectionNote: note,
      },
    });

    revalidatePath('/admin/workers');
    revalidatePath(`/admin/workers/${workerId}`);
    revalidatePath('/admin/caregivers');
    revalidatePath('/employee/profile');

    return { success: true };
  } catch (error) {
    console.error('Failed to reject worker profile:', error);
    return { success: false, error: 'Failed to reject profile' };
  }
}

/**
 * Toggle a worker's public visibility on the marketing caregivers page.
 */
export async function togglePublicProfile(
  workerId: string,
  isPublic: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const worker = await db.worker.findUnique({
      where: { id: workerId },
    });

    if (!worker) {
      return { success: false, error: 'Worker not found' };
    }

    if (isPublic && worker.profileStatus !== 'APPROVED') {
      return { success: false, error: 'Profile must be approved before making it public' };
    }

    await db.worker.update({
      where: { id: workerId },
      data: { isPublicProfile: isPublic },
    });

    revalidatePath('/admin/workers');
    revalidatePath(`/admin/workers/${workerId}`);
    revalidatePath('/admin/caregivers');
    revalidatePath('/caregivers');

    return { success: true };
  } catch (error) {
    console.error('Failed to toggle public profile:', error);
    return { success: false, error: 'Failed to toggle public profile' };
  }
}
