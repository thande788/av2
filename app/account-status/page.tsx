import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { ErrorDisplay, type ErrorType } from '@/components/shared/error-display';

export const metadata = {
  title: 'Account Status | Angel Touch Homecare',
  description: 'Your account status information',
};

interface AccountStatusPageProps {
  searchParams: Promise<{ issue?: string }>;
}

export default async function AccountStatusPage({ searchParams }: AccountStatusPageProps) {
  const params = await searchParams;
  const issue = params.issue;
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get the portal user from database
  const portalUser = await db.portalUser.findUnique({
    where: { clerkId: user.id },
  });

  // If no portal user found, show actionable guidance instead of bouncing.
  if (!portalUser) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-12">
          <ErrorDisplay
            type="general"
            title="Account setup issue"
            message={
              issue === 'missing-role'
                ? 'You are signed in, but your portal role is missing. Please contact support so we can finish your account setup.'
                : 'We could not find your portal account yet. Please contact support so we can complete your access.'
            }
            showHomeLink={true}
            showContactLink={true}
            homeUrl="/portals"
          />
        </div>
      </div>
    );
  }

  // If user is active, redirect to their portal
  if (portalUser.status === 'ACTIVE') {
    const roleRedirects: Record<string, string> = {
      ADMIN: '/admin',
      MANAGER: '/admin',
      CAREGIVER: '/employee',
      CLIENT: '/client',
    };
    const roleRedirect = roleRedirects[portalUser.role];

    if (roleRedirect) {
      redirect(roleRedirect);
    }

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-12">
          <ErrorDisplay
            type="general"
            title="Account role issue"
            message="Your account is active, but your role is not configured for a portal. Please contact support to correct your access."
            showHomeLink={true}
            showContactLink={true}
            homeUrl="/portals"
          />
        </div>
      </div>
    );
  }

  // Map status to error type
  const statusErrorMap: Record<string, ErrorType> = {
    PENDING: 'account-pending',
    INACTIVE: 'account-inactive',
    TERMINATED: 'account-terminated',
  };

  const errorType = statusErrorMap[portalUser.status] || 'general';

  // Custom messages based on role
  const roleMessages: Record<string, Record<string, string>> = {
    PENDING: {
      CAREGIVER: 'Your caregiver account is pending approval. Once verified, you will be able to view and accept shifts.',
      CLIENT: 'Your account is being set up. Our team will contact you shortly to discuss your care needs.',
      default: 'Your account is awaiting administrator approval.',
    },
    INACTIVE: {
      CAREGIVER: 'Your caregiver account has been temporarily deactivated. Please contact HR for assistance.',
      CLIENT: 'Your account has been temporarily deactivated. Please contact our office for assistance.',
      default: 'Your account has been deactivated. Please contact support.',
    },
    TERMINATED: {
      CAREGIVER: 'Your employment has been terminated. Please contact HR if you have questions.',
      CLIENT: 'Your account has been closed. Thank you for using Angel Touch Homecare services.',
      default: 'Your account has been terminated.',
    },
  };

  const message = roleMessages[portalUser.status]?.[portalUser.role] 
    || roleMessages[portalUser.status]?.default
    || 'There is an issue with your account status.';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12">
        <ErrorDisplay
          type={errorType}
          message={message}
          showHomeLink={true}
          showContactLink={true}
          homeUrl="/"
        />

        {/* Additional info card */}
        {portalUser.status === 'PENDING' && (
          <div className="mx-auto mt-8 max-w-md rounded-lg border bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              <strong>Account created:</strong>{' '}
              {portalUser.createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              If you&apos;ve been waiting more than 2 business days, please contact us.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
