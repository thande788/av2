'use client';

import { useState, useTransition } from 'react';
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
import { updateCurrentClientProfile } from '@/app/actions/client-profile';

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

interface ProfileSettingsFormProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  relationship: string | null;
  type: 'SELF' | 'FAMILY' | 'FACILITY';
}

export function ProfileSettingsForm({
  firstName: initialFirstName,
  lastName: initialLastName,
  email,
  phone: initialPhone,
  relationship: initialRelationship,
  type: initialType,
}: ProfileSettingsFormProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phone, setPhone] = useState(initialPhone ?? '');
  const initialRelationshipValue = (initialRelationship ?? '').trim();
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
  const [type, setType] = useState<ProfileSettingsFormProps['type']>(initialType);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const relationshipValue =
    relationshipSelection === '__other__'
      ? relationshipOther.trim()
      : relationshipSelection;
  const shouldShowRelationship = type === 'FAMILY';
  const relationshipForSave = shouldShowRelationship ? relationshipValue : '';

  const isDirty =
    firstName.trim() !== initialFirstName ||
    lastName.trim() !== initialLastName ||
    phone.trim() !== (initialPhone ?? '') ||
    relationshipForSave !== (initialRelationship ?? '') ||
    type !== initialType;

  const handleSave = () => {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        await updateCurrentClientProfile({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || null,
          relationship: relationshipForSave || null,
          type,
        });
        setMessage('Profile details updated.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to update profile.');
      }
    });
  };

  return (
    <div id="profile-edit" className="space-y-4">
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client-first-name">First Name *</Label>
          <Input id="client-first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-last-name">Last Name *</Label>
          <Input id="client-last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client-email">Email</Label>
          <Input id="client-email" value={email} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-phone">Phone *</Label>
          <Input
            id="client-phone"
            value={phone}
            onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
            placeholder="(978) 555-1234"
            inputMode="tel"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client-type">Account Type *</Label>
          <Select value={type} onValueChange={(value) => setType(value as ProfileSettingsFormProps['type'])}>
            <SelectTrigger id="client-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SELF">Self</SelectItem>
              <SelectItem value="FAMILY">Family</SelectItem>
              <SelectItem value="FACILITY">Facility</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {shouldShowRelationship && (
          <div className="space-y-2">
            <Label htmlFor="client-relationship">Relationship to Care Recipient *</Label>
            <Select value={relationshipSelection} onValueChange={setRelationshipSelection}>
              <SelectTrigger id="client-relationship" className="w-full">
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
                id="client-relationship-other"
                value={relationshipOther}
                onChange={(e) => setRelationshipOther(e.target.value)}
                placeholder="Describe your relationship"
              />
            )}
          </div>
        )}
      </div>

      <Button onClick={handleSave} disabled={!isDirty || isPending}>
        {isPending && <IconLoader2 className="mr-2 size-4 animate-spin" />}
        Edit Profile
      </Button>
    </div>
  );
}
