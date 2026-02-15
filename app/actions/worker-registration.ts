'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { UserRole, UserStatus, ComplianceStatus } from '@prisma/client';
import { workerRegistrationSchema, type WorkerRegistrationData } from '@/lib/validation/worker-registration';

export type WorkerRegistrationState = {
  success: boolean;
  message: string;
  errors?: Partial<Record<keyof WorkerRegistrationData, string[]>>;
  workerId?: string;
};

/**
 * Create a worker profile from the public registration form
 * 
 * This creates both a PortalUser and Worker record. The user will need
 * to complete Clerk signup separately (or be auto-created via webhook).
 * 
 * Note: In production, this would typically integrate with Clerk's
 * backend API to create the user, or the workflow would be:
 * 1. User signs up with Clerk
 * 2. Webhook creates PortalUser
 * 3. User fills out worker profile
 * 4. This action creates Worker record linked to existing PortalUser
 */
export async function registerWorker(
  _prevState: WorkerRegistrationState,
  formData: FormData
): Promise<WorkerRegistrationState> {
  try {
    // Parse form data
    const rawData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
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

    // Honeypot check
    const honeypot = formData.get('website') as string;
    if (honeypot) {
      // Bot detected - silently fail
      return {
        success: true,
        message: 'Registration submitted successfully.',
      };
    }

    // Validate
    const result = workerRegistrationSchema.safeParse(rawData);
    if (!result.success) {
      const errors: Partial<Record<keyof WorkerRegistrationData, string[]>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof WorkerRegistrationData;
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

    // Check if email already exists
    const existingUser = await db.portalUser.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'An account with this email already exists. Please sign in instead.',
        errors: {
          email: ['An account with this email already exists'],
        },
      };
    }

    // Create PortalUser and Worker in a transaction
    const { worker } = await db.$transaction(async (tx) => {
      // Create PortalUser
      // Note: clerkId is a placeholder - will be updated when user completes Clerk signup
      // or via webhook when Clerk user is created
      const portalUser = await tx.portalUser.create({
        data: {
          clerkId: `pending_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          email: data.email,
          phone: data.phone,
          firstName: data.firstName,
          lastName: data.lastName,
          role: UserRole.CAREGIVER,
          status: UserStatus.PENDING,
        },
      });

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

      // Create Worker
      const worker = await tx.worker.create({
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

      return { portalUser, worker };
    });

    // Revalidate admin pages
    revalidatePath('/admin/workers');

    return {
      success: true,
      message: 'Registration submitted successfully! Our team will review your application and contact you within 2-3 business days.',
      workerId: worker.id,
    };
  } catch (error) {
    console.error('Worker registration error:', error);
    return {
      success: false,
      message: 'An error occurred while submitting your registration. Please try again.',
    };
  }
}

/**
 * Link a Clerk user to an existing pending worker registration
 * 
 * Called after Clerk signup to link the Clerk user to the worker profile
 * that was created during registration.
 */
export async function linkClerkToWorker(
  email: string,
  clerkId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const portalUser = await db.portalUser.findUnique({
      where: { email },
    });

    if (!portalUser) {
      return { success: false, error: 'No registration found for this email' };
    }

    // Check if already linked
    if (!portalUser.clerkId.startsWith('pending_')) {
      return { success: false, error: 'Account already linked' };
    }

    // Update with real Clerk ID
    await db.portalUser.update({
      where: { id: portalUser.id },
      data: { clerkId },
    });

    return { success: true };
  } catch (error) {
    console.error('Error linking Clerk user to worker:', error);
    return { success: false, error: 'Failed to link account' };
  }
}
