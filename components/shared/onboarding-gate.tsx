import { getOnboardingStatus } from '@/app/actions/onboarding';
import { OnboardingWizard, type OnboardingStep } from '@/components/shared/onboarding-wizard';

interface OnboardingGateProps {
  steps: OnboardingStep[];
  portalName: string;
  accentColor?: string;
  children: React.ReactNode;
}

/**
 * Server component wrapper: if onboarding is incomplete, shows the wizard
 * above the portal content. Once completed, children render normally.
 */
export async function OnboardingGate({
  steps,
  portalName,
  accentColor,
  children,
}: OnboardingGateProps) {
  let showWizard = false;
  let initialStep = 0;

  try {
    const status = await getOnboardingStatus();
    if (status && !status.completed) {
      showWizard = true;
      initialStep = Math.min(status.step, steps.length - 1);
    }
  } catch {
    // If DB call fails, just render children normally
  }

  return (
    <>
      {showWizard && (
        <div className="mb-6">
          <OnboardingWizard
            steps={steps}
            initialStep={initialStep}
            portalName={portalName}
            accentColor={accentColor}
          />
        </div>
      )}
      {children}
    </>
  );
}
