import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ClientSetupNeeded } from '@/components/client/client-setup-needed';
import { ClientCareOnboardingGate } from '@/components/client/onboarding/client-care-onboarding-gate';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { getCurrentClient } from '@/lib/auth';
import { getClientProfileCompletion } from '@/lib/client-profile-completion';
import { ClientSidebar } from '@/components/client/sidebar';
import { DemoBanner } from '@/components/demo/demo-banner';
import { LogoWatermark } from '@/components/shared/logo-watermark';
import { OnboardingGate } from '@/components/shared/onboarding-gate';
import { familyOnboardingSteps } from '@/components/shared/onboarding-steps';

export const metadata: Metadata = {
  title: {
    default: 'Family Portal',
    template: '%s | Family Portal',
  },
  description: 'Angel Touch Homecare family care portal',
};

export const dynamic = 'force-dynamic';

export default async function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate the client portal behind its feature flag
  if (!isFeatureEnabled('clientPortal')) {
    redirect('/');
  }

  const client = await getCurrentClient();
  const completion = client ? getClientProfileCompletion(client) : null;
  const needsCareOnboarding = !!completion && completion.profileStatus === 'INCOMPLETE';

  return (
    <div className="flex min-h-screen flex-col bg-background lg:h-screen lg:overflow-hidden lg:flex-row">
      <ClientSidebar />
      <main className="relative min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        <LogoWatermark />
        <div className="relative z-10 mx-auto w-full max-w-[160rem] px-5 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-10 lg:py-10">
          <OnboardingGate
            steps={familyOnboardingSteps}
            portalName="Family Portal"
            accentColor="sky-500"
            enabled={!needsCareOnboarding}
          >
            {client ? (
              needsCareOnboarding && completion ? (
                <ClientCareOnboardingGate
                  completedFields={completion.completedFields}
                  totalFields={completion.totalFields}
                  percentComplete={completion.percentComplete}
                  initialValues={{
                    phone: client.user.phone,
                    type: client.type,
                    relationship: client.relationship,
                    careRecipientName: client.careRecipientName,
                    careRecipientDOB: client.careRecipientDOB
                      ? new Date(client.careRecipientDOB).toISOString().slice(0, 10)
                      : null,
                    street: client.street,
                    city: client.city,
                    state: client.state,
                    zip: client.zip,
                    emergencyName: client.emergencyName,
                    emergencyPhone: client.emergencyPhone,
                    emergencyRelation: client.emergencyRelation,
                  }}
                />
              ) : (
                children
              )
            ) : (
              <ClientSetupNeeded />
            )}
          </OnboardingGate>
        </div>
      </main>
      <DemoBanner />
    </div>
  );
}
