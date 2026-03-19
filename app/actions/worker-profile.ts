'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getCurrentWorker } from '@/lib/auth';
import { marketingProfileSchema, type MarketingProfileData } from '@/lib/validation/worker-profile';
import { ProfileStatus } from '@prisma/client';

// --- Personal profile editing ---

const personalProfileSchema = z.object({
  phone: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(2).optional(),
  zip: z.string().max(10).optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

export type PersonalProfileData = z.infer<typeof personalProfileSchema>;

/**
 * Update the employee's personal profile information (phone, location, skills, languages).
 */
export async function updatePersonalProfile(
  data: PersonalProfileData
): Promise<{ success: boolean; error?: string }> {
  try {
    const worker = await getCurrentWorker();
    if (!worker) {
      return { success: false, error: 'Not authenticated as a worker' };
    }

    const parsed = personalProfileSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid data' };
    }

    // Update phone on PortalUser, location/skills/languages on Worker
    const { phone, city, state, zip, skills, languages } = parsed.data;

    if (phone !== undefined) {
      await db.portalUser.update({
        where: { id: worker.userId },
        data: { phone },
      });
    }

    await db.worker.update({
      where: { id: worker.id },
      data: {
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zip !== undefined && { zip }),
        ...(skills !== undefined && { skills }),
        ...(languages !== undefined && { languages }),
      },
    });

    revalidatePath('/employee/profile');

    return { success: true };
  } catch (error) {
    console.error('Failed to update personal profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

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
