'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getCurrentWorker } from '@/lib/auth';
import { marketingProfileSchema, type MarketingProfileData } from '@/lib/validation/worker-profile';
import { ProfileStatus } from '@prisma/client';

/**
 * Submit or update the employee's marketing profile and request admin review.
 */
export async function submitMarketingProfile(
  data: MarketingProfileData
): Promise<{ success: boolean; error?: string }> {
  try {
    const worker = await getCurrentWorker();
    if (!worker) {
      return { success: false, error: 'Not authenticated as a worker' };
    }

    const parsed = marketingProfileSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid data' };
    }

    await db.worker.update({
      where: { id: worker.id },
      data: {
        marketingBio: parsed.data.marketingBio,
        marketingSpecialties: parsed.data.marketingSpecialties,
        marketingLanguages: parsed.data.marketingLanguages,
        marketingCertifications: parsed.data.marketingCertifications,
        yearsExperience: parsed.data.yearsExperience,
        profileStatus: ProfileStatus.PENDING_REVIEW,
        profileRejectionNote: null,
      },
    });

    revalidatePath('/employee/profile');
    revalidatePath('/admin/workers');

    return { success: true };
  } catch (error) {
    console.error('Failed to submit marketing profile:', error);
    return { success: false, error: 'Failed to submit marketing profile' };
  }
}

/**
 * Save marketing profile as draft (without submitting for review).
 */
export async function saveMarketingProfileDraft(
  data: Partial<MarketingProfileData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const worker = await getCurrentWorker();
    if (!worker) {
      return { success: false, error: 'Not authenticated as a worker' };
    }

    await db.worker.update({
      where: { id: worker.id },
      data: {
        ...(data.marketingBio !== undefined && { marketingBio: data.marketingBio }),
        ...(data.marketingSpecialties !== undefined && { marketingSpecialties: data.marketingSpecialties }),
        ...(data.marketingLanguages !== undefined && { marketingLanguages: data.marketingLanguages }),
        ...(data.marketingCertifications !== undefined && { marketingCertifications: data.marketingCertifications }),
        ...(data.yearsExperience !== undefined && { yearsExperience: data.yearsExperience }),
        profileStatus: ProfileStatus.DRAFT,
      },
    });

    revalidatePath('/employee/profile');

    return { success: true };
  } catch (error) {
    console.error('Failed to save marketing profile draft:', error);
    return { success: false, error: 'Failed to save draft' };
  }
}

/**
 * Update the marketing profile photo URL.
 */
export async function updateMarketingPhoto(
  photoUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const worker = await getCurrentWorker();
    if (!worker) {
      return { success: false, error: 'Not authenticated as a worker' };
    }

    await db.worker.update({
      where: { id: worker.id },
      data: { marketingPhotoUrl: photoUrl },
    });

    revalidatePath('/employee/profile');

    return { success: true };
  } catch (error) {
    console.error('Failed to update marketing photo:', error);
    return { success: false, error: 'Failed to update photo' };
  }
}
