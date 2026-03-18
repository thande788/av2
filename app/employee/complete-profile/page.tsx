import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { checkWorkerProfileStatus } from '@/app/actions/complete-profile';
import { WorkerProfileForm } from '@/components/signup/worker-profile-form';
import { AccountSetupWaiting } from '@/components/employee/account-setup-waiting';
import { getCurrentPortalUser } from '@/lib/auth';

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

  // Check if this is an admin/manager viewing the portal
  const portalUser = await getCurrentPortalUser();
  if (portalUser?.role === 'ADMIN' || portalUser?.role === 'MANAGER') {
    // Admins don't need to complete a worker profile
    redirect('/employee');
  }

  // Check if profile is already complete
  const status = await checkWorkerProfileStatus();

  if (status.hasWorkerProfile) {
    // Already completed - redirect to dashboard
    redirect('/employee');
  }

  // Show message if account not yet created (webhook delay)
  if (!status.hasAccount) {
    return <AccountSetupWaiting error={status.error} />;
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
