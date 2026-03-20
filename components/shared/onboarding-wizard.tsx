'use client';

import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { advanceOnboardingStep, completeOnboarding, skipOnboarding } from '@/app/actions/onboarding';
import { Check, ChevronRight, X } from 'lucide-react';

export interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

interface OnboardingWizardProps {
  steps: OnboardingStep[];
  initialStep?: number;
  portalName: string;
  accentColor?: string;
}

export function OnboardingWizard({
  steps,
  initialStep = 0,
  portalName,
  accentColor = 'primary',
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isPending, startTransition] = useTransition();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  function handleNext() {
    startTransition(async () => {
      if (isLast) {
        await completeOnboarding();
        setDismissed(true);
      } else {
        await advanceOnboardingStep();
        setCurrentStep((s) => s + 1);
      }
    });
  }

  function handleBack() {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }

  function handleSkip() {
    startTransition(async () => {
      await skipOnboarding();
      setDismissed(true);
    });
  }

  const Icon = step.icon;

  return (
    <div className="rounded-xl border bg-card shadow-lg overflow-hidden">
      {/* Header */}
      <div className={cn('flex items-center justify-between px-6 py-4 bg-muted/50 border-b')}>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {portalName} Setup
          </p>
          <h2 className="text-lg font-semibold mt-0.5">Welcome! Let&apos;s get you started</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={handleSkip} disabled={isPending} aria-label="Skip onboarding">
          <X className="size-4" />
        </Button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1.5 px-6 pt-5">
        {steps.map((s, i) => (
          <div key={s.title} className="flex-1 flex items-center gap-1.5">
            <div
              className={cn(
                'flex shrink-0 items-center justify-center size-7 rounded-full text-xs font-medium transition-colors',
                i < currentStep && `bg-${accentColor} text-${accentColor}-foreground`,
                i === currentStep && `bg-${accentColor}/15 text-${accentColor} ring-2 ring-${accentColor}/30`,
                i > currentStep && 'bg-muted text-muted-foreground'
              )}
            >
              {i < currentStep ? <Check className="size-3.5" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 rounded-full transition-colors',
                  i < currentStep ? `bg-${accentColor}` : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="px-6 py-6">
        <div className="flex items-start gap-4">
          <div className={cn(`shrink-0 rounded-lg bg-${accentColor}/10 p-2.5`)}>
            <Icon className={cn(`size-5 text-${accentColor}`)} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold">{step.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
          </div>
        </div>

        <div className="mt-5">{step.content}</div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t px-6 py-4 bg-muted/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          disabled={isPending}
          className="text-muted-foreground"
        >
          Skip for now
        </Button>
        <div className="flex gap-2">
          {currentStep > 0 && (
            <Button variant="outline" size="sm" onClick={handleBack} disabled={isPending}>
              Back
            </Button>
          )}
          <Button size="sm" onClick={handleNext} disabled={isPending}>
            {isLast ? 'Finish' : 'Next'}
            {!isLast && <ChevronRight className="size-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
