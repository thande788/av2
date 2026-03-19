'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { IconSend, IconLoader2, IconCheck, IconUser } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { submitCareInquiry, type CareInquiryFormState } from '@/app/actions/care-inquiry';

const initialState: CareInquiryFormState = {
  success: false,
  message: '',
};

const serviceTypes = [
  { value: 'personal-care', label: 'Personal Care' },
  { value: 'companionship', label: 'Companionship' },
  { value: 'meal-preparation', label: 'Meal Preparation' },
  { value: 'light-housekeeping', label: 'Light Housekeeping' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'medication-reminders', label: 'Medication Reminders' },
  { value: 'respite-care', label: 'Respite Care' },
  { value: 'live-in-care', label: 'Live-In Care' },
  { value: 'other', label: 'Other' },
];

export function CareInquiryForm() {
  const searchParams = useSearchParams();
  const caregiverId = searchParams.get('caregiver');
  const caregiverName = searchParams.get('caregiverName');

  const [state, formAction, isPending] = useActionState(submitCareInquiry, initialState);

  if (state.success) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30 mb-4">
            <IconCheck className="size-6 text-emerald-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Inquiry Submitted!</h3>
          <p className="text-muted-foreground max-w-md">{state.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request a Care Consultation</CardTitle>
        <CardDescription>
          Tell us about your care needs and we&apos;ll contact you within 24 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {/* Hidden field for caregiver tracking */}
          {caregiverId && (
            <input type="hidden" name="caregiverId" value={caregiverId} />
          )}

          {/* Caregiver request banner */}
          {caregiverName && (
            <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <IconUser className="size-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Requesting Caregiver</p>
                <p className="text-sm text-muted-foreground">{caregiverName}</p>
              </div>
              <Badge className="ml-auto bg-primary/10 text-primary">Preferred</Badge>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inquiry-name">Full Name *</Label>
              <Input id="inquiry-name" name="name" required placeholder="Your full name" />
              {state.errors?.name && (
                <p className="text-sm text-red-600">{state.errors.name[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="inquiry-email">Email *</Label>
              <Input id="inquiry-email" name="email" type="email" required placeholder="you@example.com" />
              {state.errors?.email && (
                <p className="text-sm text-red-600">{state.errors.email[0]}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inquiry-phone">Phone *</Label>
              <Input id="inquiry-phone" name="phone" type="tel" required placeholder="(978) 555-0000" />
              {state.errors?.phone && (
                <p className="text-sm text-red-600">{state.errors.phone[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="inquiry-service">Service Type *</Label>
              <Select name="serviceType" required>
                <SelectTrigger id="inquiry-service">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((st) => (
                    <SelectItem key={st.value} value={st.value}>
                      {st.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.serviceType && (
                <p className="text-sm text-red-600">{state.errors.serviceType[0]}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inquiry-recipient">Care Recipient Name</Label>
              <Input id="inquiry-recipient" name="careRecipient" placeholder="Who is the care for?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inquiry-hours">Hours Needed Per Week</Label>
              <Input id="inquiry-hours" name="hoursNeeded" type="number" min="1" max="168" placeholder="e.g. 20" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inquiry-message">Additional Details</Label>
            <Textarea
              id="inquiry-message"
              name="message"
              rows={3}
              placeholder="Tell us about your care needs, schedule preferences, or any questions..."
              maxLength={2000}
            />
          </div>

          {state.message && !state.success && (
            <p className="text-sm text-red-600">{state.message}</p>
          )}

          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? (
              <IconLoader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <IconSend className="mr-2 size-4" />
            )}
            Submit Care Inquiry
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
