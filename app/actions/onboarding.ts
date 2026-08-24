'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { getClientProfileCompletion } from '@/lib/client-profile-completion';
import { revalidatePath } from 'next/cache';

export interface OnboardingStatus {
  step: number;
  completed: boolean;
}

/** Get the current user's onboarding status */
export async function getOnboardingStatus(): Promise<OnboardingStatus | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.portalUser.findUnique({
    where: { clerkId: userId },
    select: { onboardingStep: true, onboardingCompletedAt: true },
  });

  if (!user) return null;

  return {
    step: user.onboardingStep,
    completed: user.onboardingCompletedAt !== null,
  };
}

/** Advance to the next onboarding step */
export async function advanceOnboardingStep(): Promise<{ success: boolean; step: number }> {
  const { userId } = await auth();
  if (!userId) return { success: false, step: 0 };

  const user = await db.portalUser.update({
    where: { clerkId: userId },
    data: { onboardingStep: { increment: 1 } },
    select: { onboardingStep: true },
  });

  return { success: true, step: user.onboardingStep };
}

/** Mark onboarding as complete */
export async function completeOnboarding(): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Not authenticated' };

  const portalUser = await db.portalUser.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  });

  if (!portalUser) {
    return { success: false, error: 'User record not found' };
  }

  if (portalUser.role === 'CLIENT') {
    const client = await db.client.findUnique({
      where: { userId: portalUser.id },
      include: { user: { select: { phone: true } },
      },
    });

    if (!client) {
      return { success: false, error: 'Client profile not found yet' };
    }

    const completion = getClientProfileCompletion(client);
    if (completion.profileStatus === 'INCOMPLETE') {
      return {
        success: false,
        error: 'Please complete care recipient, address, and emergency details first.',
      };
    }
  }

  await db.portalUser.update({
    where: { clerkId: userId },
    data: { onboardingCompletedAt: new Date() },
  });

  revalidatePath('/', 'layout');
  return { success: true };
}

/** Skip/dismiss onboarding entirely */
export async function skipOnboarding(): Promise<{ success: boolean; error?: string }> {
  return completeOnboarding();
}
