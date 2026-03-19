'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  IconEdit,
  IconLoader2,
  IconCheck,
  IconX,
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconCertificate,
  IconLanguage,
  IconShieldCheck,
} from '@tabler/icons-react';

import { cn, formatDateUS } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/shared/user-avatar';
import {
  updatePersonalProfile,
  type PersonalProfileData,
} from '@/app/actions/worker-profile';
import { MARKETING_LANGUAGE_OPTIONS } from '@/lib/validation/worker-profile';

const SKILL_OPTIONS = [
  'Personal Care',
  'Companionship',
  'Dementia Care',
  "Alzheimer's Care",
  'Meal Preparation',
  'Light Housekeeping',
  'Medication Reminders',
  'Transportation',
  'Post-Surgery Care',
  'Mobility Assistance',
  'Hoyer Lift',
  'Hospice Support',
  'Respite Care',
  'Live-In Care',
] as const;

const complianceStatusColors: Record<string, string> = {
  COMPLIANT: 'bg-green-500/15 text-green-600 dark:text-green-400',
  PENDING: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  INCOMPLETE: 'bg-red-500/15 text-red-600 dark:text-red-400',
  EXPIRED: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  employeeId: string | null;
  complianceStatus: string;
  hireDate: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  skills: string[];
  languages: string[];
}

interface EditableProfileSectionProps {
  data: ProfileData;
}

export function EditableProfileSection({ data }: EditableProfileSectionProps) {
  const router = useRouter();
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Editable fields
  const [phone, setPhone] = React.useState(data.phone ?? '');
  const [city, setCity] = React.useState(data.city ?? '');
  const [state, setState] = React.useState(data.state ?? '');
  const [zip, setZip] = React.useState(data.zip ?? '');
  const [skills, setSkills] = React.useState<string[]>(data.skills);
  const [languages, setLanguages] = React.useState<string[]>(data.languages);

  function resetForm() {
    setPhone(data.phone ?? '');
    setCity(data.city ?? '');
    setState(data.state ?? '');
    setZip(data.zip ?? '');
    setSkills(data.skills);
    setLanguages(data.languages);
    setError(null);
  }

  function handleCancel() {
    resetForm();
    setEditing(false);
  }

  function toggleItem(list: string[], item: string): string[] {
    return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const payload: PersonalProfileData = {
      phone,
      city,
      state: state.toUpperCase(),
      zip,
      skills,
      languages,
    };

    const result = await updatePersonalProfile(payload);

    if (result.success) {
      setEditing(false);
      router.refresh();
    } else {
      setError(result.error ?? 'Something went wrong');
    }

    setSaving(false);
  }

  return (
    <>
      {/* Header row with Edit / Save / Cancel buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">
            View and manage your profile information
          </p>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                <IconX className="size-4 mr-1.5" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <IconLoader2 className="size-4 mr-1.5 animate-spin" />
                ) : (
                  <IconCheck className="size-4 mr-1.5" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <IconEdit className="size-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Profile Card */}
        <Card className={cn('lg:col-span-2', editing && 'ring-2 ring-primary/20')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="size-5" />
              Personal Information
              {editing && (
                <Badge variant="outline" className="ml-2 text-xs font-normal text-primary">
                  Editing
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <UserAvatar
                name={`${data.firstName} ${data.lastName}`}
                size="lg"
              />
              <div>
                <h2 className="text-xl font-semibold">
                  {data.firstName} {data.lastName}
                </h2>
                {data.employeeId && (
                  <p className="text-sm text-muted-foreground">
                    Employee ID: {data.employeeId}
                  </p>
                )}
                <Badge
                  variant="secondary"
                  className={complianceStatusColors[data.complianceStatus]}
                >
                  {data.complianceStatus === 'COMPLIANT' && (
                    <IconShieldCheck className="size-3 mr-1" />
                  )}
                  {data.complianceStatus}
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Email — read-only always */}
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <IconMail className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{data.email}</p>
                </div>
              </div>

              {/* Phone — editable */}
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <IconPhone className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  {editing ? (
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="mt-0.5 h-8 text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium">
                      {data.phone || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>

              {/* Location — editable */}
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <IconMapPin className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Location</p>
                  {editing ? (
                    <div className="mt-0.5 flex gap-2">
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="h-8 text-sm"
                      />
                      <Input
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="MA"
                        maxLength={2}
                        className="h-8 w-16 text-sm"
                      />
                      <Input
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        placeholder="01852"
                        maxLength={10}
                        className="h-8 w-24 text-sm"
                      />
                    </div>
                  ) : (
                    <p className="text-sm font-medium">
                      {data.city && data.state
                        ? `${data.city}, ${data.state} ${data.zip}`
                        : 'Not provided'}
                    </p>
                  )}
                </div>
              </div>

              {/* Hire Date — read-only always */}
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <IconCalendar className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hire Date</p>
                  <p className="text-sm font-medium">
                    {data.hireDate
                      ? formatDateUS(new Date(data.hireDate))
                      : 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills & Languages sidebar */}
        <div className="space-y-6">
          <Card className={cn(editing && 'ring-2 ring-primary/20')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <IconCertificate className="size-4" />
                Skills & Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((skill) => {
                    const selected = skills.includes(skill);
                    return (
                      <Badge
                        key={skill}
                        variant={selected ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer select-none transition-colors',
                          !selected && 'opacity-60 hover:opacity-100'
                        )}
                        onClick={() => setSkills(toggleItem(skills, skill))}
                        role="checkbox"
                        aria-checked={selected}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSkills(toggleItem(skills, skill));
                          }
                        }}
                      >
                        {skill}
                      </Badge>
                    );
                  })}
                </div>
              ) : data.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No skills listed</p>
              )}
            </CardContent>
          </Card>

          <Card className={cn(editing && 'ring-2 ring-primary/20')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <IconLanguage className="size-4" />
                Languages
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="flex flex-wrap gap-2">
                  {MARKETING_LANGUAGE_OPTIONS.map((lang) => {
                    const selected = languages.includes(lang);
                    return (
                      <Badge
                        key={lang}
                        variant={selected ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer select-none transition-colors',
                          !selected && 'opacity-60 hover:opacity-100'
                        )}
                        onClick={() => setLanguages(toggleItem(languages, lang))}
                        role="checkbox"
                        aria-checked={selected}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setLanguages(toggleItem(languages, lang));
                          }
                        }}
                      >
                        {lang}
                      </Badge>
                    );
                  })}
                </div>
              ) : data.languages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.languages.map((lang) => (
                    <Badge key={lang} variant="outline">
                      {lang}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No languages listed</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
