'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { ComplianceStatus } from '@prisma/client';
import {
  skillsSchema,
  availabilitySchema,
  addressInfoSchema,
  type SkillsData,
  type AvailabilityData,
  type AddressInfoData,
} from '@/lib/validation/worker-registration';
import { z } from 'zod';

// Combined schema for profile completion (personal info comes from Clerk)
const workerProfileSchema = z.object({
  phone: z.string().min(10, 'Phone number is required'),
  ...skillsSchema.shape,
  ...availabilitySchema.shape,
  ...addressInfoSchema.shape,
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
  agreeToBackgroundCheck: z.boolean().refine((val) => val === true, {
    message: 'You must consent to a background check',
  }),
});

export type WorkerProfileData = z.infer<typeof workerProfileSchema>;

export type CompleteProfileState = {
  success: boolean;
  message: string;
  errors?: Partial<Record<keyof WorkerProfileData, string[]>>;
  workerId?: string;
};

/**
 * Complete worker profile after Clerk signup
 * 
 * This is called after a user has signed up with Clerk and been
 * redirected to the profile completion page. The PortalUser should
 * already exist (created by webhook).
 */
export async function completeWorkerProfile(
  _prevState: CompleteProfileState,
  formData: FormData
): Promise<CompleteProfileState> {
  try {
    // Get authenticated user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return {
        success: false,
        message: 'You must be signed in to complete your profile.',
      };
    }

    // Parse form data
    const rawData = {
      phone: formData.get('phone') as string,
      skills: formData.getAll('skills') as string[],
      certifications: formData.getAll('certifications') as string[],
      languages: formData.getAll('languages') as string[],
      yearsExperience: formData.get('yearsExperience') as string,
      shiftsAvailable: formData.getAll('shiftsAvailable') as string[],
      hoursPerWeek: formData.get('hoursPerWeek') as string,
      startDate: formData.get('startDate') as string,
      transportation: formData.get('transportation') === 'true',
      street: formData.get('street') as string,
      city: formData.get('city') as string,
      state: (formData.get('state') as string)?.toUpperCase(),
      zip: formData.get('zip') as string,
      agreeToTerms: formData.get('agreeToTerms') === 'true',
      agreeToBackgroundCheck: formData.get('agreeToBackgroundCheck') === 'true',
    };

    // Validate
    const result = workerProfileSchema.safeParse(rawData);
    if (!result.success) {
      const errors: Partial<Record<keyof WorkerProfileData, string[]>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof WorkerProfileData;
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field]!.push(issue.message);
      });
      return {
        success: false,
        message: 'Please fix the errors below.',
        errors,
      };
    }

    const data = result.data;

    // Find the PortalUser created by webhook
    const portalUser = await db.portalUser.findUnique({
      where: { clerkId: clerkUserId },
      include: { worker: true },
    });

    if (!portalUser) {
      // User not found - webhook may not have fired yet
      // Retry after a moment or inform user
      return {
        success: false,
        message: 'Your account is being set up. Please wait a moment and try again.',
      };
    }

    // Check if worker profile already exists
    if (portalUser.worker) {
      return {
        success: false,
        message: 'Your profile has already been completed.',
      };
    }

    // Map skills to proper format
    const skillsFormatted = data.skills.map((s) =>
      s.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    );

    // Map languages to proper format
    const languagesFormatted = data.languages.map((l) =>
      l.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    );

    // Estimate pay rate based on experience
    const payRateMap: Record<string, number> = {
      '0-1': 18.0,
      '1-3': 20.0,
      '3-5': 22.0,
      '5+': 25.0,
    };
    const payRate = payRateMap[data.yearsExperience] || 18.0;

    // Update PortalUser with phone and create Worker
    const worker = await db.$transaction(async (tx) => {
      // Update phone on PortalUser if provided
      if (data.phone) {
        await tx.portalUser.update({
          where: { id: portalUser.id },
          data: { phone: data.phone },
        });
      }

      // Create Worker record
      return tx.worker.create({
        data: {
          userId: portalUser.id,
          payRate,
          skills: skillsFormatted,
          languages: languagesFormatted,
          complianceStatus: ComplianceStatus.INCOMPLETE,
          street: data.street,
          city: data.city,
          state: data.state,
          zip: data.zip,
          notes: JSON.stringify({
            certifications: data.certifications,
            yearsExperience: data.yearsExperience,
            shiftsAvailable: data.shiftsAvailable,
            hoursPerWeek: data.hoursPerWeek,
            startDate: data.startDate,
            hasTransportation: data.transportation,
          }),
        },
      });
    });

    // Revalidate pages
    revalidatePath('/employee');
    revalidatePath('/admin/workers');

    return {
      success: true,
      message: 'Profile completed successfully! Our team will review your application.',
      workerId: worker.id,
    };
  } catch (error) {
    console.error('Error completing worker profile:', error);
    return {
      success: false,
      message: 'An error occurred. Please try again.',
    };
  }
}

/**
 * Check if current user has completed their worker profile
 */
export async function checkWorkerProfileStatus(): Promise<{
  hasAccount: boolean;
  hasWorkerProfile: boolean;
  portalUserId?: string;
}> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return { hasAccount: false, hasWorkerProfile: false };
  }

  const portalUser = await db.portalUser.findUnique({
    where: { clerkId: clerkUserId },
    include: { worker: true },
  });

  return {
    hasAccount: !!portalUser,
    hasWorkerProfile: !!portalUser?.worker,
    portalUserId: portalUser?.id,
  };
}
