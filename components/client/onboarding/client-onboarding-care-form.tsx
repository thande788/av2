'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { IconLoader2 } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { saveCurrentClientOnboardingBasics } from '@/app/actions/client-profile';

const RELATIONSHIP_OPTIONS = [
  'Self',
  'Spouse',
  'Daughter',
  'Son',
  'Sibling',
  'Parent',
  'Guardian',
] as const;

function sanitizePhoneInput(value: string) {
  return value.replace(/[^0-9()+\-\s.]/g, '');
}

function isRelationshipPreset(value: string) {
  return RELATIONSHIP_OPTIONS.includes(value as (typeof RELATIONSHIP_OPTIONS)[number]);
}

interface ClientOnboardingCareFormProps {
  initialValues?: {
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

export function ClientOnboardingCareForm({ initialValues }: ClientOnboardingCareFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [phone, setPhone] = useState(initialValues?.phone ?? '');
  const [type, setType] = useState<'SELF' | 'FAMILY' | 'FACILITY'>(initialValues?.type ?? 'FAMILY');
  const initialRelationshipValue = (initialValues?.relationship ?? '').trim();
  const [relationshipSelection, setRelationshipSelection] = useState(
    initialRelationshipValue && isRelationshipPreset(initialRelationshipValue)
      ? initialRelationshipValue
      : '__other__'
  );
  const [relationshipOther, setRelationshipOther] = useState(
    initialRelationshipValue && !isRelationshipPreset(initialRelationshipValue)
      ? initialRelationshipValue
      : ''
  );
  const [careRecipientName, setCareRecipientName] = useState(initialValues?.careRecipientName ?? '');
  const [careRecipientDOB, setCareRecipientDOB] = useState(initialValues?.careRecipientDOB ?? '');
  const [street, setStreet] = useState(initialValues?.street === 'Address pending' ? '' : (initialValues?.street ?? ''));
  const [city, setCity] = useState(initialValues?.city ?? '');
  const [state, setState] = useState(initialValues?.state ?? 'MA');
  const [zip, setZip] = useState(initialValues?.zip ?? '');
  const [emergencyName, setEmergencyName] = useState(initialValues?.emergencyName ?? '');
  const [emergencyPhone, setEmergencyPhone] = useState(initialValues?.emergencyPhone ?? '');
  const [emergencyRelation, setEmergencyRelation] = useState(initialValues?.emergencyRelation ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const steps = ['Contact', 'Care Recipient', 'Address & Emergency'] as const;
  const isLastStep = currentStep === steps.length - 1;
  const relationshipValue =
    relationshipSelection === '__other__'
      ? relationshipOther.trim()
      : relationshipSelection;
  const shouldShowRelationship = type === 'FAMILY';
  const relationshipForSave = shouldShowRelationship ? relationshipValue : '';

  const handleSave = () => {
    setError(null);
    setSaved(false);

    startTransition(async () => {
      try {
        await saveCurrentClientOnboardingBasics({
          type,
          phone: phone.trim() || null,
          relationship: relationshipForSave || null,
          careRecipientName: careRecipientName.trim() || null,
          careRecipientDOB: careRecipientDOB || null,
          street: street.trim(),
          city: city.trim(),
          state: state.trim().toUpperCase(),
          zip: zip.trim(),
          emergencyName: emergencyName.trim() || null,
          emergencyPhone: emergencyPhone.trim() || null,
          emergencyRelation: emergencyRelation.trim() || null,
        });
        setSaved(true);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save care setup details.');
      }
    });
  };

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
      <p className="text-sm text-muted-foreground">
        Add your core care details now. You can update everything later in Settings.
      </p>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
          Care details saved.
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <span className={index === currentStep ? 'font-semibold text-foreground' : ''}>
              {index + 1}. {step}
            </span>
            {index < steps.length - 1 && <span>•</span>}
          </div>
        ))}
      </div>

      {currentStep === 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="onboarding-phone">Your Phone *</Label>
            <Input
              id="onboarding-phone"
              value={phone}
              onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
              inputMode="tel"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="onboarding-client-type">Account Type *</Label>
            <Select value={type} onValueChange={(value) => setType(value as 'SELF' | 'FAMILY' | 'FACILITY')}>
              <SelectTrigger id="onboarding-client-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SELF">Self (single care recipient)</SelectItem>
                <SelectItem value="FAMILY">Family (multiple care recipients)</SelectItem>
                <SelectItem value="FACILITY">Facility (multiple care recipients)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {shouldShowRelationship && (
            <div className="space-y-1.5">
              <Label htmlFor="onboarding-relationship">Relationship to the care recipient</Label>
              <Select value={relationshipSelection} onValueChange={setRelationshipSelection}>
                <SelectTrigger id="onboarding-relationship" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                  <SelectItem value="__other__">Other</SelectItem>
                </SelectContent>
              </Select>
              {relationshipSelection === '__other__' && (
                <Input
                  id="onboarding-relationship-other"
                  value={relationshipOther}
                  onChange={(e) => setRelationshipOther(e.target.value)}
                  placeholder="Describe your relationship"
                />
              )}
            </div>
          )}
        </div>
      )}

      {currentStep === 1 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="onboarding-care-recipient">Care Recipient Name *</Label>
            <Input
              id="onboarding-care-recipient"
              value={careRecipientName}
              onChange={(e) => setCareRecipientName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="onboarding-care-recipient-dob">Care Recipient Date of Birth</Label>
            <Input
              id="onboarding-care-recipient-dob"
              type="date"
              value={careRecipientDOB}
              onChange={(e) => setCareRecipientDOB(e.target.value)}
            />
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="onboarding-street">Care Address *</Label>
            <Input id="onboarding-street" value={street} onChange={(e) => setStreet(e.target.value)} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="onboarding-city">City *</Label>
              <Input id="onboarding-city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="onboarding-state">State *</Label>
              <Input
                id="onboarding-state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                maxLength={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="onboarding-zip">ZIP *</Label>
              <Input id="onboarding-zip" value={zip} onChange={(e) => setZip(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="onboarding-emergency-name">Recipient Emergency Contact Name *</Label>
              <Input
                id="onboarding-emergency-name"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="onboarding-emergency-phone">Recipient Emergency Contact Phone *</Label>
              <Input
                id="onboarding-emergency-phone"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(sanitizePhoneInput(e.target.value))}
                inputMode="tel"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="onboarding-emergency-relation">Recipient Emergency Contact Relation</Label>
              <Input
                id="onboarding-emergency-relation"
                value={emergencyRelation}
                onChange={(e) => setEmergencyRelation(e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      <div className="flex items-center justify-between">
        <Button
          size="sm"
          type="button"
          variant="outline"
          onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
          disabled={currentStep === 0 || isPending}
        >
          Back
        </Button>

        {!isLastStep ? (
          <Button
            size="sm"
            type="button"
            onClick={() => setCurrentStep((step) => Math.min(steps.length - 1, step + 1))}
            disabled={isPending}
          >
            Next
          </Button>
        ) : (
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            {isPending && <IconLoader2 className="mr-2 size-4 animate-spin" />}
            Save Care Details
          </Button>
        )}
      </div>
    </div>
  );
}
