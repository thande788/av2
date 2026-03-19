'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { IconEdit, IconLoader2 } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  updatePersonalProfile,
  type PersonalProfileData,
} from '@/app/actions/worker-profile';
import {
  MARKETING_LANGUAGE_OPTIONS,
} from '@/lib/validation/worker-profile';

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

interface EditProfileDialogProps {
  initialData: {
    phone: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    skills: string[];
    languages: string[];
  };
}

export function EditProfileDialog({ initialData }: EditProfileDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [phone, setPhone] = React.useState(initialData.phone ?? '');
  const [city, setCity] = React.useState(initialData.city ?? '');
  const [state, setState] = React.useState(initialData.state ?? '');
  const [zip, setZip] = React.useState(initialData.zip ?? '');
  const [skills, setSkills] = React.useState<string[]>(initialData.skills);
  const [languages, setLanguages] = React.useState<string[]>(initialData.languages);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setPhone(initialData.phone ?? '');
      setCity(initialData.city ?? '');
      setState(initialData.state ?? '');
      setZip(initialData.zip ?? '');
      setSkills(initialData.skills);
      setLanguages(initialData.languages);
      setError(null);
    }
  }, [open, initialData]);

  function toggleItem(list: string[], item: string): string[] {
    return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const data: PersonalProfileData = {
      phone,
      city,
      state: state.toUpperCase(),
      zip,
      skills,
      languages,
    };

    const result = await updatePersonalProfile(data);

    if (result.success) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result.error ?? 'Something went wrong');
    }

    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <IconEdit className="size-4 mr-2" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your contact info, location, skills, and languages.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Phone</Label>
            <Input
              id="edit-phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Location */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Location</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-1 space-y-1">
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  placeholder="Lowell"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-state">State</Label>
                <Input
                  id="edit-state"
                  placeholder="MA"
                  maxLength={2}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-zip">ZIP</Label>
                <Input
                  id="edit-zip"
                  placeholder="01852"
                  maxLength={10}
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
              </div>
            </div>
          </fieldset>

          {/* Skills */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Skills</legend>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => {
                const selected = skills.includes(skill);
                return (
                  <Badge
                    key={skill}
                    variant={selected ? 'default' : 'outline'}
                    className="cursor-pointer select-none"
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
          </fieldset>

          {/* Languages */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Languages</legend>
            <div className="flex flex-wrap gap-2">
              {MARKETING_LANGUAGE_OPTIONS.map((lang) => {
                const selected = languages.includes(lang);
                return (
                  <Badge
                    key={lang}
                    variant={selected ? 'default' : 'outline'}
                    className="cursor-pointer select-none"
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
          </fieldset>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <IconLoader2 className="size-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
