'use client';

import * as React from 'react';
import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  completeWorkerProfile,
  type CompleteProfileState,
} from '@/app/actions/complete-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
   IconStethoscope,
  IconCalendar,
  IconMapPin,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconLoader2,
} from '@tabler/icons-react';

interface WorkerProfileFormProps {
  userName?: string;
  userEmail?: string;
  skillOptions: string[];
}

// Steps: Skills → Availability → Address → Agreements
const STEPS = [
  {
    id: 'skills',
    title: 'Skills & Experience',
    icon: IconStethoscope,
    description: 'Tell us about your caregiving experience',
  },
  {
    id: 'availability',
    title: 'Availability',
    icon: IconCalendar,
    description: 'When can you work?',
  },
  {
    id: 'address',
    title: 'Address',
    icon: IconMapPin,
    description: 'Your home address',
  },
  {
    id: 'agreements',
    title: 'Agreements',
    icon: IconCheck,
    description: 'Review and consent',
  },
];

const CERTIFICATION_OPTIONS = [
  { value: 'cna', label: 'CNA (Certified Nursing Assistant)' },
  { value: 'hha', label: 'HHA (Home Health Aide)' },
  { value: 'cpr', label: 'CPR Certified' },
  { value: 'first-aid', label: 'First Aid Certified' },
  { value: 'dementia-certified', label: 'Dementia Care Certified' },
];

const LANGUAGE_OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'khmer', label: 'Khmer' },
  { value: 'vietnamese', label: 'Vietnamese' },
  { value: 'mandarin', label: 'Mandarin' },
  { value: 'cantonese', label: 'Cantonese' },
];

const SHIFT_OPTIONS = [
  { value: 'morning', label: 'Morning (6am - 12pm)' },
  { value: 'afternoon', label: 'Afternoon (12pm - 6pm)' },
  { value: 'evening', label: 'Evening (6pm - 12am)' },
  { value: 'overnight', label: 'Overnight (12am - 6am)' },
  { value: 'weekends', label: 'Weekends' },
];

const initialState: CompleteProfileState = {
  success: false,
  message: '',
};

export function WorkerProfileForm({ userName, userEmail, skillOptions }: WorkerProfileFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [state, formAction, isPending] = useActionState(completeWorkerProfile, initialState);

  // Form data state
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(['english']);
  const [yearsExperience, setYearsExperience] = useState('');
  const [shiftsAvailable, setShiftsAvailable] = useState<string[]>([]);
  const [hoursPerWeek, setHoursPerWeek] = useState('');
  const [startDate, setStartDate] = useState('');
  const [transportation, setTransportation] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [addressState, setAddressState] = useState('MA');
  const [zip, setZip] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToBackgroundCheck, setAgreeToBackgroundCheck] = useState(false);

  // Handle successful submission
  useEffect(() => {
    if (state.success) {
      // Redirect to employee dashboard after success
      setTimeout(() => {
        router.push('/employee');
      }, 2000);
    }
  }, [state.success, router]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const toggleSelection = (
    value: string,
    current: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  // Validate current step
  const isStepValid = (): boolean => {
    switch (STEPS[currentStep].id) {
      case 'skills':
        return skills.length > 0 && yearsExperience !== '' && phone.length >= 10;
      case 'availability':
        return shiftsAvailable.length > 0 && hoursPerWeek !== '';
      case 'address':
        return street !== '' && city !== '' && addressState !== '' && zip.length >= 5;
      case 'agreements':
        return agreeToTerms && agreeToBackgroundCheck;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'skills':
        return (
          <div className="space-y-6">
            {/* Phone (required for SMS notifications) */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(978) 555-0123"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                We&apos;ll send shift notifications via SMS
              </p>
            </div>

            {/* Skills */}
            <div className="space-y-3">
              <Label>Skills & Services *</Label>
              <p className="text-sm text-muted-foreground">
                Select all skills you can provide
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {skillOptions.map((skill) => (
                  <label
                    key={skill}
                    className={cn(
                      'flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-colors',
                      skills.includes(skill)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <Checkbox
                      checked={skills.includes(skill)}
                      onCheckedChange={() =>
                        toggleSelection(skill, skills, setSkills)
                      }
                    />
                    <span className="text-sm">{skill}</span>
                    <input type="hidden" name="skills" value={skill} disabled={!skills.includes(skill)} />
                  </label>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-3">
              <Label>Certifications</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {CERTIFICATION_OPTIONS.map((cert) => (
                  <label
                    key={cert.value}
                    className={cn(
                      'flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-colors',
                      certifications.includes(cert.value)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <Checkbox
                      checked={certifications.includes(cert.value)}
                      onCheckedChange={() =>
                        toggleSelection(cert.value, certifications, setCertifications)
                      }
                    />
                    <span className="text-sm">{cert.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-3">
              <Label>Languages</Label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <label
                    key={lang.value}
                    className={cn(
                      'flex cursor-pointer items-center space-x-2 rounded-full border px-4 py-2 transition-colors',
                      languages.includes(lang.value)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <Checkbox
                      checked={languages.includes(lang.value)}
                      onCheckedChange={() =>
                        toggleSelection(lang.value, languages, setLanguages)
                      }
                      className="sr-only"
                    />
                    <span className="text-sm">{lang.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <Label>Years of Experience *</Label>
              <Select value={yearsExperience} onValueChange={setYearsExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">Less than 1 year</SelectItem>
                  <SelectItem value="1-3">1-3 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5+">5+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'availability':
        return (
          <div className="space-y-6">
            {/* Shift Availability */}
            <div className="space-y-3">
              <Label>Shift Availability *</Label>
              <p className="text-sm text-muted-foreground">
                When are you available to work?
              </p>
              <div className="grid gap-2">
                {SHIFT_OPTIONS.map((shift) => (
                  <label
                    key={shift.value}
                    className={cn(
                      'flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-colors',
                      shiftsAvailable.includes(shift.value)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <Checkbox
                      checked={shiftsAvailable.includes(shift.value)}
                      onCheckedChange={() =>
                        toggleSelection(shift.value, shiftsAvailable, setShiftsAvailable)
                      }
                    />
                    <span className="text-sm">{shift.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hours per Week */}
            <div className="space-y-2">
              <Label>Desired Hours per Week *</Label>
              <Select value={hoursPerWeek} onValueChange={setHoursPerWeek}>
                <SelectTrigger>
                  <SelectValue placeholder="Select hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10-20">10-20 hours</SelectItem>
                  <SelectItem value="20-30">20-30 hours</SelectItem>
                  <SelectItem value="30-40">30-40 hours</SelectItem>
                  <SelectItem value="40+">40+ hours (full-time)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Earliest Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Transportation */}
            <label className="flex cursor-pointer items-start space-x-3 rounded-lg border p-4">
              <Checkbox
                checked={transportation}
                onCheckedChange={(checked) => setTransportation(checked as boolean)}
                className="mt-0.5"
              />
              <div>
                <span className="font-medium">I have reliable transportation</span>
                <p className="text-sm text-muted-foreground">
                  You can travel to client homes in the service area
                </p>
              </div>
            </label>
          </div>
        );

      case 'address':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                name="street"
                placeholder="123 Main Street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Lowell"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select value={addressState} onValueChange={setAddressState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MA">Massachusetts</SelectItem>
                    <SelectItem value="NH">New Hampshire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code *</Label>
              <Input
                id="zip"
                name="zip"
                placeholder="01852"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                maxLength={10}
                required
              />
            </div>
          </div>
        );

      case 'agreements':
        return (
          <div className="space-y-6">
            {userName && (
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  You&apos;re completing this profile as:
                </p>
                <p className="font-medium">{userName}</p>
                {userEmail && (
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                )}
              </div>
            )}

            <label className="flex cursor-pointer items-start space-x-3 rounded-lg border p-4">
              <Checkbox
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                className="mt-0.5"
              />
              <div>
                <span className="font-medium">
                  I agree to the Terms of Service and Privacy Policy *
                </span>
                <p className="text-sm text-muted-foreground">
                  By checking this box, you agree to our{' '}
                  <a href="/terms" className="text-primary underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-primary underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start space-x-3 rounded-lg border p-4">
              <Checkbox
                checked={agreeToBackgroundCheck}
                onCheckedChange={(checked) =>
                  setAgreeToBackgroundCheck(checked as boolean)
                }
                className="mt-0.5"
              />
              <div>
                <span className="font-medium">
                  I consent to a background check *
                </span>
                <p className="text-sm text-muted-foreground">
                  Angel Touch Homecare Services requires background checks for all
                  caregivers. This helps ensure the safety of our clients.
                </p>
              </div>
            </label>

            {state.message && !state.success && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
                {state.message}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Success state
  if (state.success) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <CardContent className="pt-10 pb-10">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <IconCheck className="size-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Profile Completed!</h2>
          <p className="mb-6 text-muted-foreground">{state.message}</p>
          <p className="text-sm text-muted-foreground">
            Redirecting to your dashboard...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => (isComplete ? setCurrentStep(index) : undefined)}
                disabled={!isComplete && !isActive}
                className={cn(
                  'flex flex-col items-center gap-1',
                  isComplete && 'cursor-pointer'
                )}
              >
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full border-2 transition-colors',
                    isActive && 'border-primary bg-primary/10 text-primary',
                    isComplete &&
                      'border-green-500 bg-green-500/10 text-green-600',
                    !isActive &&
                      !isComplete &&
                      'border-muted bg-muted text-muted-foreground'
                  )}
                >
                  {isComplete ? (
                    <IconCheck className="size-5" />
                  ) : (
                    <Icon className="size-5" />
                  )}
                </div>
                <span
                  className={cn(
                    'hidden text-xs font-medium sm:block',
                    isActive && 'text-primary',
                    isComplete && 'text-green-600',
                    !isActive && !isComplete && 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-12 flex-shrink-0',
                    index < currentStep ? 'bg-green-500' : 'bg-muted'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep].title}</CardTitle>
          <CardDescription>{STEPS[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            {/* Hidden inputs for form submission */}
            <input type="hidden" name="phone" value={phone} />
            {skills.map((s) => (
              <input key={s} type="hidden" name="skills" value={s} />
            ))}
            {certifications.map((c) => (
              <input key={c} type="hidden" name="certifications" value={c} />
            ))}
            {languages.map((l) => (
              <input key={l} type="hidden" name="languages" value={l} />
            ))}
            <input type="hidden" name="yearsExperience" value={yearsExperience} />
            {shiftsAvailable.map((s) => (
              <input key={s} type="hidden" name="shiftsAvailable" value={s} />
            ))}
            <input type="hidden" name="hoursPerWeek" value={hoursPerWeek} />
            <input type="hidden" name="startDate" value={startDate} />
            <input type="hidden" name="transportation" value={transportation.toString()} />
            <input type="hidden" name="street" value={street} />
            <input type="hidden" name="city" value={city} />
            <input type="hidden" name="state" value={addressState} />
            <input type="hidden" name="zip" value={zip} />
            <input type="hidden" name="agreeToTerms" value={agreeToTerms.toString()} />
            <input type="hidden" name="agreeToBackgroundCheck" value={agreeToBackgroundCheck.toString()} />

            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <IconChevronLeft className="size-4" />
                Back
              </Button>

              {currentStep < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="gap-2"
                >
                  Next
                  <IconChevronRight className="size-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={!isStepValid() || isPending}>
                  {isPending ? (
                    <>
                      <IconLoader2 className="mr-2 size-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Complete Profile
                      <IconCheck className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
