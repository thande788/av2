'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { IconLoader2 } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { updateClientByAdmin } from '@/app/actions/client-profile';

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

interface ClientEditData {
  id: string;
  type: 'SELF' | 'FAMILY' | 'FACILITY';
  relationship: string | null;
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
  billingRate: number;
  billingEmail: string | null;
  preferredTimes: string[];
  specialNeeds: string[];
  careNotes: string | null;
  accessNotes: string | null;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'TERMINATED';
  };
}

export function ClientEditForm({ client }: { client: ClientEditData }) {
  const [firstName, setFirstName] = useState(client.user.firstName);
  const [lastName, setLastName] = useState(client.user.lastName);
  const [phone, setPhone] = useState(client.user.phone ?? '');
  const [status, setStatus] = useState(client.user.status);
  const [type, setType] = useState(client.type);
  const initialRelationshipValue = (client.relationship ?? '').trim();
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
  const [careRecipientName, setCareRecipientName] = useState(client.careRecipientName ?? '');
  const [careRecipientDOB, setCareRecipientDOB] = useState(client.careRecipientDOB ?? '');
  const [serviceLevel, setServiceLevel] = useState(client.serviceLevel);
  const [street, setStreet] = useState(client.street);
  const [city, setCity] = useState(client.city);
  const [state, setState] = useState(client.state);
  const [zip, setZip] = useState(client.zip);
  const [emergencyName, setEmergencyName] = useState(client.emergencyName ?? '');
  const [emergencyPhone, setEmergencyPhone] = useState(client.emergencyPhone ?? '');
  const [emergencyRelation, setEmergencyRelation] = useState(client.emergencyRelation ?? '');
  const [billingRate, setBillingRate] = useState(client.billingRate.toString());
  const [billingEmail, setBillingEmail] = useState(client.billingEmail ?? '');
  const [preferredTimes, setPreferredTimes] = useState(client.preferredTimes.join(', '));
  const [specialNeeds, setSpecialNeeds] = useState(client.specialNeeds.join(', '));
  const [careNotes, setCareNotes] = useState(client.careNotes ?? '');
  const [accessNotes, setAccessNotes] = useState(client.accessNotes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const shouldShowRelationship = type === 'FAMILY';
  const relationshipValue =
    relationshipSelection === '__other__'
      ? relationshipOther.trim()
      : relationshipSelection;

  const handleSave = () => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        await updateClientByAdmin({
          clientId: client.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || null,
          status,
          type,
          relationship: (shouldShowRelationship ? relationshipValue : '') || null,
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
          billingRate: Number(billingRate),
          billingEmail: billingEmail.trim() || null,
          preferredTimes: preferredTimes.split(',').map((value) => value.trim()).filter(Boolean),
          specialNeeds: specialNeeds.split(',').map((value) => value.trim()).filter(Boolean),
          careNotes: careNotes.trim() || null,
          accessNotes: accessNotes.trim() || null,
        });
        setSuccess('Client profile updated successfully.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to save client changes.');
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Client</h1>
          <p className="text-muted-foreground">Update account details, care info, and billing setup.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/admin/clients/${client.id}`}>Back to Client</Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={client.user.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-phone">Phone</Label>
              <Input
                id="account-phone"
                value={phone}
                onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
                inputMode="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as ClientEditData['user']['status'])}>
                <SelectTrigger id="account-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                  <SelectItem value="TERMINATED">TERMINATED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Care Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client-type">Client Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as ClientEditData['type'])}>
                <SelectTrigger id="client-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SELF">SELF</SelectItem>
                  <SelectItem value="FAMILY">FAMILY</SelectItem>
                  <SelectItem value="FACILITY">FACILITY</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {shouldShowRelationship && (
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship to Care Recipient</Label>
                <Select value={relationshipSelection} onValueChange={setRelationshipSelection}>
                  <SelectTrigger id="relationship" className="w-full">
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
                    id="relationship-other"
                    value={relationshipOther}
                    onChange={(e) => setRelationshipOther(e.target.value)}
                    placeholder="Describe relationship"
                  />
                )}
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="care-recipient">Care Recipient Name</Label>
              <Input id="care-recipient" value={careRecipientName} onChange={(e) => setCareRecipientName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="care-recipient-dob">Care Recipient DOB</Label>
              <Input id="care-recipient-dob" type="date" value={careRecipientDOB} onChange={(e) => setCareRecipientDOB(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-level">Service Level</Label>
            <Select value={serviceLevel} onValueChange={(value) => setServiceLevel(value as ClientEditData['serviceLevel'])}>
              <SelectTrigger id="service-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPANION">COMPANION</SelectItem>
                <SelectItem value="PERSONAL">PERSONAL</SelectItem>
                <SelectItem value="SKILLED">SKILLED</SelectItem>
                <SelectItem value="LIVE_IN">LIVE_IN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Street</Label>
            <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={state} onChange={(e) => setState(e.target.value)} maxLength={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP</Label>
              <Input id="zip" value={zip} onChange={(e) => setZip(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency, Billing, and Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="emergency-name">Emergency Name</Label>
              <Input id="emergency-name" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency-phone">Emergency Phone</Label>
              <Input
                id="emergency-phone"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(sanitizePhoneInput(e.target.value))}
                inputMode="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency-relation">Emergency Relation</Label>
              <Input id="emergency-relation" value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="billing-rate">Billing Rate</Label>
              <Input id="billing-rate" type="number" min="0" step="0.01" value={billingRate} onChange={(e) => setBillingRate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-email">Billing Email</Label>
              <Input id="billing-email" value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="preferred-times">Preferred Times (comma separated)</Label>
              <Input id="preferred-times" value={preferredTimes} onChange={(e) => setPreferredTimes(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="special-needs">Special Needs (comma separated)</Label>
              <Input id="special-needs" value={specialNeeds} onChange={(e) => setSpecialNeeds(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="care-notes">Care Notes</Label>
              <Textarea id="care-notes" value={careNotes} onChange={(e) => setCareNotes(e.target.value)} rows={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="access-notes">Access Notes</Label>
              <Textarea id="access-notes" value={accessNotes} onChange={(e) => setAccessNotes(e.target.value)} rows={5} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isPending}>
        {isPending && <IconLoader2 className="mr-2 size-4 animate-spin" />}
        Save Client Changes
      </Button>
    </div>
  );
}
