'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  IconCheck,
  IconLoader2,
  IconSend,
  IconDeviceFloppy,
  IconAlertCircle,
  IconUpload,
} from '@tabler/icons-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/shared/user-avatar';
import {
  MARKETING_SPECIALTY_OPTIONS,
  MARKETING_LANGUAGE_OPTIONS,
  MARKETING_CERTIFICATION_OPTIONS,
  type MarketingProfileData,
} from '@/lib/validation/worker-profile';
import {
  submitMarketingProfile,
  saveMarketingProfileDraft,
  uploadMarketingPhoto,
} from '@/app/actions/worker-profile';

interface MarketingProfileFormProps {
  initialData: {
    marketingBio: string | null;
    marketingPhotoUrl: string | null;
    marketingSpecialties: string[];
    marketingLanguages: string[];
    marketingCertifications: string[];
    yearsExperience: number | null;
    profileStatus: string;
    profileRejectionNote: string | null;
    isPublicProfile: boolean;
  };
}

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground',
  },
  PENDING_REVIEW: {
    label: 'Pending Review',
    className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-green-500/15 text-green-600 dark:text-green-400',
  },
  REJECTED: {
    label: 'Needs Revision',
    className: 'bg-red-500/15 text-red-600 dark:text-red-400',
  },
};

export function MarketingProfileForm({ initialData }: MarketingProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [bio, setBio] = React.useState(initialData.marketingBio || '');
  const [specialties, setSpecialties] = React.useState<string[]>(initialData.marketingSpecialties);
  const [languages, setLanguages] = React.useState<string[]>(initialData.marketingLanguages);
  const [certifications, setCertifications] = React.useState<string[]>(initialData.marketingCertifications);
  const [yearsExperience, setYearsExperience] = React.useState<number>(
    initialData.yearsExperience ?? 0
  );

  const isPendingOrApproved =
    initialData.profileStatus === 'PENDING_REVIEW' ||
    initialData.profileStatus === 'APPROVED';

  const canEdit =
    initialData.profileStatus === 'DRAFT' ||
    initialData.profileStatus === 'REJECTED';

  // Photo upload state
  const [photoUrl, setPhotoUrl] = React.useState(initialData.marketingPhotoUrl);
  const [isUploadingPhoto, setIsUploadingPhoto] = React.useState(false);
  const [photoError, setPhotoError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side pre-validation
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setPhotoError('Please upload a JPEG or PNG image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image must be under 5 MB.');
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoError(null);

    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadMarketingPhoto(formData);

    if (result.success && result.url) {
      setPhotoUrl(result.url);
      router.refresh();
    } else {
      setPhotoError(result.error ?? 'Upload failed');
    }

    setIsUploadingPhoto(false);
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const status = statusConfig[initialData.profileStatus] || statusConfig.DRAFT;

  const toggleItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    setList((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const data: MarketingProfileData = {
      marketingBio: bio,
      marketingSpecialties: specialties,
      marketingLanguages: languages,
      marketingCertifications: certifications,
      yearsExperience,
    };

    const result = await submitMarketingProfile(data);
    setIsSubmitting(false);

    if (result.success) {
      setSuccess('Profile submitted for review!');
      router.refresh();
    } else {
      setError(result.error || 'Failed to submit');
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const result = await saveMarketingProfileDraft({
      marketingBio: bio,
      marketingSpecialties: specialties,
      marketingLanguages: languages,
      marketingCertifications: certifications,
      yearsExperience,
    });
    setIsSaving(false);

    if (result.success) {
      setSuccess('Draft saved!');
      router.refresh();
    } else {
      setError(result.error || 'Failed to save draft');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Public Profile
              <Badge className={cn('font-medium', status.className)}>
                {status.label}
              </Badge>
              {initialData.isPublicProfile && (
                <Badge className="bg-primary/15 text-primary">
                  Visible on Website
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {canEdit
                ? 'Create your public profile that will appear on our website. An admin will review it before publishing.'
                : isPendingOrApproved
                  ? 'Your profile has been submitted. An admin will review it shortly.'
                  : 'Your profile information for the public caregivers page.'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rejection Note */}
        {initialData.profileStatus === 'REJECTED' && initialData.profileRejectionNote && (
          <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
            <IconAlertCircle className="size-5 text-red-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Admin Feedback
              </p>
              <p className="text-sm text-muted-foreground">
                {initialData.profileRejectionNote}
              </p>
            </div>
          </div>
        )}

        {/* Profile Photo */}
        <div className="space-y-2">
          <Label>Profile Photo</Label>
          <div className="flex items-center gap-4">
            <UserAvatar src={photoUrl} size="lg" />
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={!canEdit || isUploadingPhoto}
              />
              {canEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                >
                  {isUploadingPhoto ? (
                    <IconLoader2 className="mr-1.5 size-4 animate-spin" />
                  ) : (
                    <IconUpload className="mr-1.5 size-4" />
                  )}
                  {photoUrl ? 'Change Photo' : 'Upload Photo'}
                </Button>
              )}
              <p className="text-xs text-muted-foreground">JPEG or PNG, max 5 MB</p>
              {photoError && (
                <p className="text-xs text-destructive">{photoError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="marketing-bio">
            Bio <span className="text-muted-foreground text-xs">({bio.length}/1000)</span>
          </Label>
          <Textarea
            id="marketing-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell families about yourself, your caregiving philosophy, and what makes you passionate about helping others..."
            rows={5}
            maxLength={1000}
            disabled={!canEdit}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Minimum 50 characters. This will be visible to families browsing our caregivers.
          </p>
        </div>

        {/* Years of Experience */}
        <div className="space-y-2">
          <Label htmlFor="years-experience">Years of Experience</Label>
          <Input
            id="years-experience"
            type="number"
            min={0}
            max={50}
            value={yearsExperience}
            onChange={(e) => setYearsExperience(parseInt(e.target.value) || 0)}
            disabled={!canEdit}
            className="w-32"
          />
        </div>

        {/* Specialties */}
        <div className="space-y-2">
          <Label>Specialties</Label>
          <div className="flex flex-wrap gap-2">
            {MARKETING_SPECIALTY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                disabled={!canEdit}
                onClick={() => toggleItem(specialties, setSpecialties, option)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium transition-colors border',
                  specialties.includes(option)
                    ? 'bg-primary/15 text-primary border-primary/30'
                    : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted',
                  !canEdit && 'cursor-default opacity-60'
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-2">
          <Label>Languages</Label>
          <div className="flex flex-wrap gap-2">
            {MARKETING_LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                disabled={!canEdit}
                onClick={() => toggleItem(languages, setLanguages, option)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium transition-colors border',
                  languages.includes(option)
                    ? 'bg-primary/15 text-primary border-primary/30'
                    : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted',
                  !canEdit && 'cursor-default opacity-60'
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="space-y-2">
          <Label>Certifications</Label>
          <div className="flex flex-wrap gap-2">
            {MARKETING_CERTIFICATION_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                disabled={!canEdit}
                onClick={() => toggleItem(certifications, setCertifications, option)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium transition-colors border',
                  certifications.includes(option)
                    ? 'bg-primary/15 text-primary border-primary/30'
                    : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted',
                  !canEdit && 'cursor-default opacity-60'
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
            <IconCheck className="size-4" />
            {success}
          </p>
        )}

        {/* Actions */}
        {canEdit && (
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSubmit} disabled={isSubmitting || isSaving}>
              {isSubmitting ? (
                <IconLoader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <IconSend className="mr-2 size-4" />
              )}
              Submit for Review
            </Button>
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting || isSaving}>
              {isSaving ? (
                <IconLoader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <IconDeviceFloppy className="mr-2 size-4" />
              )}
              Save Draft
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
