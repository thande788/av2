import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ClientOnboardingCareForm } from '@/components/client/onboarding/client-onboarding-care-form';

interface ClientCareOnboardingGateProps {
  completedFields: number;
  totalFields: number;
  percentComplete: number;
  initialValues: {
    phone: string | null;
    type: 'SELF' | 'FAMILY' | 'FACILITY';
    relationship: string | null;
    careRecipientName: string | null;
    careRecipientDOB: string | null;
    street: string;
    city: string;
    state: string;
    zip: string;
    emergencyName: string | null;
    emergencyPhone: string | null;
    emergencyRelation: string | null;
  };
}

export function ClientCareOnboardingGate({
  completedFields,
  totalFields,
  percentComplete,
  initialValues,
}: ClientCareOnboardingGateProps) {
  return (
    <Card className="mx-auto max-w-3xl border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle>Complete Your Care Setup</CardTitle>
        <CardDescription>
          Add care recipient, address, and emergency contact details before continuing to Family
          Portal setup.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-lg border border-border/60 bg-background p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Care profile completion</span>
            <span className="font-medium">
              {completedFields}/{totalFields}
            </span>
          </div>
          <Progress value={percentComplete} aria-label="Care setup completion" />
        </div>

        <ClientOnboardingCareForm initialValues={initialValues} />
      </CardContent>
    </Card>
  );
}
