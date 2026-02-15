import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { checkWorkerProfileStatus } from '@/app/actions/complete-profile';
import { WorkerProfileForm } from '@/components/signup/worker-profile-form';

export const metadata = {
  title: 'Complete Your Profile | Angel Touch Homecare Services',
  description: 'Complete your caregiver profile to start accepting shifts.',
};

export default async function CompleteProfilePage() {
  // Check authentication
  const user = await currentUser();

  if (!user) {
    // Not signed in - redirect to signup
    redirect('/sign-up');
  }

  // Check if profile is already complete
  const status = await checkWorkerProfileStatus();

  if (status.hasWorkerProfile) {
    // Already completed - redirect to dashboard
    redirect('/employee');
  }

  // Show message if account not yet created (webhook delay)
  if (!status.hasAccount) {
    // The webhook may not have fired yet
    // Show a waiting state or retry
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="mx-auto mb-6 size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <h1 className="mb-2 text-2xl font-bold">Setting up your account...</h1>
          <p className="mb-6 text-muted-foreground">
            Please wait a moment while we finish setting up your account.
          </p>
          <p className="text-sm text-muted-foreground">
            This usually takes just a few seconds. If this takes too long, please{' '}
            <a href="/contact" className="text-primary underline">
              contact support
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">Complete Your Profile</h1>
        <p className="text-muted-foreground">
          Welcome, {user.firstName || user.emailAddresses[0].emailAddress}! 
          Tell us about your experience and availability.
        </p>
      </div>

      <WorkerProfileForm
        userName={user.fullName || user.firstName || undefined}
        userEmail={user.emailAddresses[0]?.emailAddress}
      />
    </div>
  );
}
