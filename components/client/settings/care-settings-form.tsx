'use client';

import { useState, useTransition } from 'react';
import { IconLoader2 } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
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
import { updateCurrentClientCareInfo } from '@/app/actions/client-profile';

function sanitizePhoneInput(value: string) {
  return value.replace(/[^0-9()+\-\s.]/g, '');
}

interface CareSettingsFormProps {
  careRecipientName: string | null;
  careRecipientDOB: string | null;
  serviceLevel: 'COMPANION' | 'PERSONAL' | 'SKILLED' | 'LIVE_IN';
  street: string;
  city: string;
  state: string;
  zip: string;
  emergencyName: string | null;
  emergencyPhone: string | null;
  emergencyRelation: string | null;
  billingEmail: string | null;
  preferredTimes: string[];
  specialNeeds: string[];
  careNotes: string | null;
  accessNotes: string | null;
}

export function CareSettingsForm({
  careRecipientName: initialCareRecipientName,
  careRecipientDOB: initialCareRecipientDOB,
  serviceLevel: initialServiceLevel,
  street: initialStreet,
  city: initialCity,
  state: initialState,
  zip: initialZip,
  emergencyName: initialEmergencyName,
  emergencyPhone: initialEmergencyPhone,
  emergencyRelation: initialEmergencyRelation,
  billingEmail: initialBillingEmail,
  preferredTimes: initialPreferredTimes,
  specialNeeds: initialSpecialNeeds,
  careNotes: initialCareNotes,
  accessNotes: initialAccessNotes,
}: CareSettingsFormProps) {
  const [careRecipientName, setCareRecipientName] = useState(initialCareRecipientName ?? '');
  const [careRecipientDOB, setCareRecipientDOB] = useState(initialCareRecipientDOB ?? '');
  const [serviceLevel, setServiceLevel] = useState(initialServiceLevel);
  const [street, setStreet] = useState(initialStreet);
  const [city, setCity] = useState(initialCity);
  const [state, setState] = useState(initialState);
  const [zip, setZip] = useState(initialZip);
  const [emergencyName, setEmergencyName] = useState(initialEmergencyName ?? '');
  const [emergencyPhone, setEmergencyPhone] = useState(initialEmergencyPhone ?? '');
  const [emergencyRelation, setEmergencyRelation] = useState(initialEmergencyRelation ?? '');
  const [billingEmail, setBillingEmail] = useState(initialBillingEmail ?? '');
  const [preferredTimes, setPreferredTimes] = useState(initialPreferredTimes.join(', '));
  const [specialNeeds, setSpecialNeeds] = useState(initialSpecialNeeds.join(', '));
  const [careNotes, setCareNotes] = useState(initialCareNotes ?? '');
  const [accessNotes, setAccessNotes] = useState(initialAccessNotes ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isDirty =
    careRecipientName.trim() !== (initialCareRecipientName ?? '') ||
    careRecipientDOB !== (initialCareRecipientDOB ?? '') ||
    serviceLevel !== initialServiceLevel ||
    street.trim() !== initialStreet ||
    city.trim() !== initialCity ||
    state.trim().toUpperCase() !== initialState ||
    zip.trim() !== initialZip ||
    emergencyName.trim() !== (initialEmergencyName ?? '') ||
    emergencyPhone.trim() !== (initialEmergencyPhone ?? '') ||
    emergencyRelation.trim() !== (initialEmergencyRelation ?? '') ||
    billingEmail.trim() !== (initialBillingEmail ?? '') ||
    preferredTimes.trim() !== initialPreferredTimes.join(', ') ||
    specialNeeds.trim() !== initialSpecialNeeds.join(', ') ||
    careNotes.trim() !== (initialCareNotes ?? '') ||
    accessNotes.trim() !== (initialAccessNotes ?? '');

  const handleSave = () => {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        await updateCurrentClientCareInfo({
          careRecipientName: careRecipientName.trim() || null,
          careRecipientDOB: careRecipientDOB || null,
          serviceLevel,
          street: street.trim(),
          city: city.trim(),
          state: state.trim().toUpperCase(),
          zip: zip.trim(),
          emergencyName: emergencyName.trim() || null,
          emergencyPhone: emergencyPhone.trim() || null,
          emergencyRelation: emergencyRelation.trim() || null,
          billingEmail: billingEmail.trim() || null,
          preferredTimes: preferredTimes
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
          specialNeeds: specialNeeds
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
          careNotes: careNotes.trim() || null,
          accessNotes: accessNotes.trim() || null,
        });
        setMessage('Care information updated.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to update care information.');
      }
    });
  };

  return (
    <div id="care-edit" className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          {message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="care-recipient-name">Care Recipient Name *</Label>
          <Input
            id="care-recipient-name"
            value={careRecipientName}
            onChange={(e) => setCareRecipientName(e.target.value)}
            placeholder="Name of person receiving care"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="care-recipient-dob">Care Recipient Date of Birth</Label>
          <Input
            id="care-recipient-dob"
            type="date"
            value={careRecipientDOB}
            onChange={(e) => setCareRecipientDOB(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="care-service-level">Service Level *</Label>
          <Select value={serviceLevel} onValueChange={(value) => setServiceLevel(value as CareSettingsFormProps['serviceLevel'])}>
            <SelectTrigger id="care-service-level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COMPANION">Companion</SelectItem>
              <SelectItem value="PERSONAL">Personal</SelectItem>
              <SelectItem value="SKILLED">Skilled</SelectItem>
              <SelectItem value="LIVE_IN">Live In</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="billing-email">Billing Email</Label>
        <Input
          id="billing-email"
          value={billingEmail}
          onChange={(e) => setBillingEmail(e.target.value)}
          placeholder="billing@example.com"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="care-street">Care Address *</Label>
          <Input id="care-street" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Street address" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="care-city">City *</Label>
          <Input id="care-city" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="care-state">State *</Label>
            <Input id="care-state" value={state} onChange={(e) => setState(e.target.value)} maxLength={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="care-zip">ZIP *</Label>
            <Input id="care-zip" value={zip} onChange={(e) => setZip(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="emergency-name">Recipient Emergency Contact Name *</Label>
          <Input id="emergency-name" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergency-phone">Recipient Emergency Contact Phone *</Label>
          <Input
            id="emergency-phone"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(sanitizePhoneInput(e.target.value))}
            inputMode="tel"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergency-relation">Recipient Emergency Contact Relation</Label>
          <Input id="emergency-relation" value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="preferred-times">Preferred Times (comma separated)</Label>
          <Input
            id="preferred-times"
            value={preferredTimes}
            onChange={(e) => setPreferredTimes(e.target.value)}
            placeholder="Morning, Afternoon"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="special-needs">Special Needs (comma separated)</Label>
          <Input
            id="special-needs"
            value={specialNeeds}
            onChange={(e) => setSpecialNeeds(e.target.value)}
            placeholder="Wheelchair, Dementia"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="care-notes">Care Notes</Label>
          <Textarea id="care-notes" value={careNotes} onChange={(e) => setCareNotes(e.target.value)} rows={4} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="access-notes">Access Notes</Label>
          <Textarea id="access-notes" value={accessNotes} onChange={(e) => setAccessNotes(e.target.value)} rows={4} />
        </div>
      </div>

      <Button onClick={handleSave} disabled={!isDirty || isPending}>
        {isPending && <IconLoader2 className="mr-2 size-4 animate-spin" />}
        Update Care Information
      </Button>
    </div>
  );
}
