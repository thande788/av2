'use server';

import { z } from 'zod';
import sharp from 'sharp';
import { db } from '@/lib/db';
import { put, del } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { getCurrentWorker } from '@/lib/auth';
import { validateFile } from '@/lib/file-scanner';
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
 * Upload and scan a marketing profile photo, then store the URL.
 *
 * Accepts a FormData with a single "file" field (JPEG or PNG, max 5 MB).
 * The image is validated (size, MIME, magic-bytes) and scanned for malware
 * via ClamAV before being persisted to Vercel Blob.
 */

const PHOTO_ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const PHOTO_MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const PHOTO_MIN_DIMENSION = 400; // px — ensures quality at 1x for card (400×300) and avatar views
const PHOTO_MAX_DIMENSION = 4096; // px — prevents absurdly large images

export async function uploadMarketingPhoto(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const worker = await getCurrentWorker();
    if (!worker) {
      return { success: false, error: 'Not authenticated as a worker' };
    }

    const file = formData.get('file') as File | null;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Convert to buffer for scanning
    const buffer = Buffer.from(await file.arrayBuffer());

    // Comprehensive validation + antivirus scan
    const validation = await validateFile(buffer, file.name, file.type, {
      maxSize: PHOTO_MAX_SIZE,
      allowedTypes: PHOTO_ALLOWED_TYPES,
      requireScan: process.env.REQUIRE_ANTIVIRUS_SCAN === 'true',
    });

    if (!validation.valid) {
      return { success: false, error: validation.errors.join('. ') };
    }

    if (!validation.scanned) {
      console.warn(`[MarketingPhoto] Antivirus scan skipped for ${file.name} (workerId: ${worker.id})`);
    }

    // Dimension validation via sharp
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;

    if (width < PHOTO_MIN_DIMENSION || height < PHOTO_MIN_DIMENSION) {
      return {
        success: false,
        error: `Image must be at least ${PHOTO_MIN_DIMENSION}×${PHOTO_MIN_DIMENSION} pixels. Yours is ${width}×${height}.`,
      };
    }
    if (width > PHOTO_MAX_DIMENSION || height > PHOTO_MAX_DIMENSION) {
      return {
        success: false,
        error: `Image must be no larger than ${PHOTO_MAX_DIMENSION}×${PHOTO_MAX_DIMENSION} pixels. Yours is ${width}×${height}.`,
      };
    }

    // Generate safe blob path
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const ext = file.type === 'image/png' ? 'png' : 'jpg';
    const filename = `marketing-photos/${worker.id}/${timestamp}-${randomSuffix}.${ext}`;

    // Delete previous photo if it exists on our blob storage
    if (
      worker.marketingPhotoUrl &&
      (worker.marketingPhotoUrl.includes('vercel-storage.com') ||
        worker.marketingPhotoUrl.includes('blob.vercel-storage.com'))
    ) {
      try {
        await del(worker.marketingPhotoUrl);
      } catch {
        // Non-critical — old blob may already be gone
      }
    }

    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
    });

    // Persist URL
    await db.worker.update({
      where: { id: worker.id },
      data: { marketingPhotoUrl: blob.url },
    });

    revalidatePath('/employee/profile');
    revalidatePath('/admin/caregivers');
    revalidatePath('/caregivers');

    return { success: true, url: blob.url };
  } catch (error) {
    console.error('Failed to upload marketing photo:', error);
    return { success: false, error: 'Failed to upload photo' };
  }
}
