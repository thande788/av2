'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  IconArrowLeft,
  IconBriefcase,
  IconCalendar,
  IconCertificate,
  IconCertificate2,
  IconCheck,
  IconClock,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconId,
  IconLanguage,
  IconLoader2,
  IconMail,
  IconMapPin,
  IconPhone,
  IconSend,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import {
  Worker,
  PortalUser,
  ComplianceDoc,
  Availability,
  ShiftBooking,
  CareShift,
  Client,
  UserStatus,
  ComplianceStatus,
  ProfileStatus,
} from '@prisma/client';

import { cn, type Serialized } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { approveWorker, rejectWorker, updateWorkerStatus, updateWorker, approveWorkerProfile, rejectWorkerProfile, togglePublicProfile } from '@/app/actions/workers';

type WorkerWithRelations = Worker & {
  user: PortalUser;
  complianceDocs: ComplianceDoc[];
  availabilities: Availability[];
  shiftBookings: (ShiftBooking & {
    shift: CareShift & {
      client: Client & {
        user: PortalUser;
      };
    };
  })[];
};

interface WorkerDetailProps {
  worker: Serialized<WorkerWithRelations>;
}

const statusColors: Record<UserStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
  INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  TERMINATED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
};

const complianceColors: Record<ComplianceStatus, string> = {
  INCOMPLETE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  COMPLIANT: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
  EXPIRED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
};

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function WorkerDetail({ worker }: WorkerDetailProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = React.useState(false);
  const [isRejecting, setIsRejecting] = React.useState(false);
  const [isEditingId, setIsEditingId] = React.useState(false);
  const [editEmployeeId, setEditEmployeeId] = React.useState(worker.employeeId || '');
  const [editError, setEditError] = React.useState<string | null>(null);
  const [isSavingId, setIsSavingId] = React.useState(false);

  // Marketing profile review state
  const [isApprovingProfile, setIsApprovingProfile] = React.useState(false);
  const [isRejectingProfile, setIsRejectingProfile] = React.useState(false);
  const [profileRejectionNote, setProfileRejectionNote] = React.useState('');
  const [isTogglingPublic, setIsTogglingPublic] = React.useState(false);

  const handleSaveEmployeeId = async () => {
    if (!editEmployeeId.trim()) {
      setEditError('Employee ID cannot be empty');
      return;
    }
    setIsSavingId(true);
    setEditError(null);
    const result = await updateWorker(worker.id, { employeeId: editEmployeeId.trim() });
    setIsSavingId(false);
    if (result.success) {
      setIsEditingId(false);
      router.refresh();
    } else {
      setEditError(result.error || 'Failed to update employee ID');
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    const result = await approveWorker(worker.id);
    setIsApproving(false);
    if (result.success) {
      router.refresh();
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    const result = await rejectWorker(worker.id);
    setIsRejecting(false);
    if (result.success) {
      router.refresh();
    }
  };

  const handleSuspend = async () => {
    const result = await updateWorkerStatus(worker.id, 'INACTIVE');
    if (result.success) {
      router.refresh();
    }
  };

  const handleReactivate = async () => {
    const result = await updateWorkerStatus(worker.id, 'ACTIVE');
    if (result.success) {
      router.refresh();
    }
  };

  const handleApproveProfile = async () => {
    setIsApprovingProfile(true);
    const result = await approveWorkerProfile(worker.id);
    setIsApprovingProfile(false);
    if (result.success) {
      router.refresh();
    }
  };

  const handleRejectProfile = async () => {
    if (!profileRejectionNote.trim()) return;
    setIsRejectingProfile(true);
    const result = await rejectWorkerProfile(worker.id, profileRejectionNote.trim());
    setIsRejectingProfile(false);
    if (result.success) {
      setProfileRejectionNote('');
      router.refresh();
    }
  };

  const handleTogglePublic = async () => {
    setIsTogglingPublic(true);
    const result = await togglePublicProfile(worker.id, !worker.isPublicProfile);
    setIsTogglingPublic(false);
    if (result.success) {
      router.refresh();
    }
  };

  const isPending = worker.user.status === 'PENDING';
  const isActive = worker.user.status === 'ACTIVE';
  const isInactive = worker.user.status === 'INACTIVE';
  const profileNeedsReview = worker.profileStatus === ProfileStatus.PENDING_REVIEW;

  // Parse skills and languages from JSON strings
  const skills = worker.skills || [];
  const languages = worker.languages || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/workers">
              <IconArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {worker.user.firstName} {worker.user.lastName}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge className={cn('font-medium', statusColors[worker.user.status])}>
                {worker.user.status}
              </Badge>
              <Badge className={cn('font-medium', complianceColors[worker.complianceStatus])}>
                {worker.complianceStatus}
              </Badge>
              <Dialog open={isEditingId} onOpenChange={setIsEditingId}>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <IconId className="size-3.5" />
                    {worker.employeeId || 'No ID assigned'}
                    <IconEdit className="ml-1 size-3 opacity-50" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Edit Employee ID</DialogTitle>
                    <DialogDescription>
                      Update the employee ID for {worker.user.firstName} {worker.user.lastName}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input
                        id="employeeId"
                        value={editEmployeeId}
                        onChange={(e) => setEditEmployeeId(e.target.value)}
                        placeholder="EMP-0001"
                      />
                      {editError && (
                        <p className="text-sm text-destructive">{editError}</p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditingId(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEmployeeId} disabled={isSavingId}>
                      {isSavingId && <IconLoader2 className="mr-2 size-4 animate-spin" />}
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {profileNeedsReview && (
            <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
              Profile Needs Review
            </Badge>
          )}
          {isPending && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 hover:text-red-700">
                    <IconX className="mr-2 size-4" />
                    Reject
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Worker Application?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reject {worker.user.firstName} {worker.user.lastName}&apos;s
                      application. They will be notified of this decision.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReject}
                      disabled={isRejecting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isRejecting ? (
                        <IconLoader2 className="mr-2 size-4 animate-spin" />
                      ) : null}
                      Reject Application
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button onClick={handleApprove} disabled={isApproving}>
                {isApproving ? (
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <IconCheck className="mr-2 size-4" />
                )}
                Approve Worker
              </Button>
            </>
          )}

          {isActive && (
            <>
              {worker.user.email && (
                <Button variant="outline" asChild>
                  <a href={`mailto:${worker.user.email}`}>
                    <IconSend className="mr-2 size-4" />
                    Email Worker
                  </a>
                </Button>
              )}
              <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-yellow-600 hover:text-yellow-700">
                  Suspend
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Suspend Worker?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will temporarily suspend {worker.user.firstName} {worker.user.lastName}.
                    They will not be able to receive new shift assignments.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSuspend} className="bg-yellow-600 hover:bg-yellow-700">
                    Suspend Worker
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            </>
          )}

          {isInactive && (
            <Button onClick={handleReactivate}>
              <IconCheck className="mr-2 size-4" />
              Reactivate
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="size-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <IconMail className="size-4 text-muted-foreground" />
              <a href={`mailto:${worker.user.email}`} className="text-primary hover:underline">
                {worker.user.email}
              </a>
            </div>
            {worker.user.phone && (
              <div className="flex items-center gap-3 text-sm">
                <IconPhone className="size-4 text-muted-foreground" />
                <a href={`tel:${worker.user.phone}`} className="text-foreground">
                  {worker.user.phone}
                </a>
              </div>
            )}
            {(worker.city || worker.state) && (
              <div className="flex items-center gap-3 text-sm">
                <IconMapPin className="size-4 text-muted-foreground" />
                <span className="text-foreground">
                  {[worker.city, worker.state].filter(Boolean).join(', ')}
                  {worker.zip && ` ${worker.zip}`}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBriefcase className="size-5" />
              Employment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {worker.employeeId && (
              <div className="flex items-center gap-3 text-sm">
                <IconId className="size-4 text-muted-foreground" />
                <span className="text-foreground">Employee ID: {worker.employeeId}</span>
              </div>
            )}
            {worker.hireDate && (
              <div className="flex items-center gap-3 text-sm">
                <IconCalendar className="size-4 text-muted-foreground" />
                <span className="text-foreground">
                  Hired: {new Date(worker.hireDate).toLocaleDateString('en-US')}
                </span>
              </div>
            )}
            {worker.payRate && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">Pay Rate:</span>
                <span className="font-medium text-foreground">
                  ${Number(worker.payRate).toFixed(2)}/{worker.payType === 'HOURLY' ? 'hr' : worker.payType.toLowerCase()}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">Created:</span>
              <span className="text-foreground">
                {new Date(worker.user.createdAt).toLocaleDateString('en-US')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Skills & Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCertificate className="size-5" />
              Skills & Languages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {skills.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {languages.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Languages</p>
                <div className="flex flex-wrap gap-1">
                  {languages.map((lang: string) => (
                    <Badge key={lang} variant="outline" className="text-xs">
                      <IconLanguage className="mr-1 size-3" />
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {skills.length === 0 && languages.length === 0 && (
              <p className="text-sm text-muted-foreground">No skills or languages specified</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Marketing Profile Review */}
      {worker.marketingBio && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <IconUser className="size-5" />
                Marketing Profile
                <Badge
                  className={cn(
                    'font-medium',
                    worker.profileStatus === 'APPROVED'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'
                      : worker.profileStatus === 'PENDING_REVIEW'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500'
                        : worker.profileStatus === 'REJECTED'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  )}
                >
                  {worker.profileStatus === 'PENDING_REVIEW' ? 'Pending Review' : worker.profileStatus}
                </Badge>
                {worker.isPublicProfile && (
                  <Badge className="bg-primary/15 text-primary">
                    Public
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {worker.profileStatus === 'APPROVED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTogglePublic}
                    disabled={isTogglingPublic}
                  >
                    {isTogglingPublic ? (
                      <IconLoader2 className="mr-2 size-4 animate-spin" />
                    ) : worker.isPublicProfile ? (
                      <IconEyeOff className="mr-2 size-4" />
                    ) : (
                      <IconEye className="mr-2 size-4" />
                    )}
                    {worker.isPublicProfile ? 'Hide from Website' : 'Show on Website'}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Photo */}
            {worker.marketingPhotoUrl ? (
              <div className="flex items-center gap-4">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-full border-2 border-primary/20">
                  <Image
                    src={worker.marketingPhotoUrl}
                    alt={`${worker.user.firstName} ${worker.user.lastName} profile photo`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <p className="text-sm text-muted-foreground">Profile photo</p>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground">
                  {worker.user.firstName[0]}{worker.user.lastName[0]}
                </div>
                <p className="text-sm text-muted-foreground">No profile photo uploaded</p>
              </div>
            )}

            {/* Bio */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Bio</p>
              <p className="text-sm whitespace-pre-wrap">{worker.marketingBio}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Experience */}
              {worker.yearsExperience != null && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Experience</p>
                  <p className="text-sm">{worker.yearsExperience} years</p>
                </div>
              )}

              {/* Specialties */}
              {worker.marketingSpecialties.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Specialties</p>
                  <div className="flex flex-wrap gap-1">
                    {worker.marketingSpecialties.map((s: string) => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {worker.marketingLanguages.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Languages</p>
                  <div className="flex flex-wrap gap-1">
                    {worker.marketingLanguages.map((l: string) => (
                      <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {worker.marketingCertifications.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Certifications</p>
                  <div className="flex flex-wrap gap-1">
                    {worker.marketingCertifications.map((c: string) => (
                      <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Approval actions */}
            {worker.profileStatus === 'PENDING_REVIEW' && (
              <div className="border-t pt-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="rejection-note">Rejection Note (required to reject)</Label>
                  <Textarea
                    id="rejection-note"
                    value={profileRejectionNote}
                    onChange={(e) => setProfileRejectionNote(e.target.value)}
                    placeholder="Provide feedback on what needs to be changed..."
                    rows={2}
                    className="resize-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={handleApproveProfile} disabled={isApprovingProfile || isRejectingProfile}>
                    {isApprovingProfile ? (
                      <IconLoader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <IconCheck className="mr-2 size-4" />
                    )}
                    Approve Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={handleRejectProfile}
                    disabled={isApprovingProfile || isRejectingProfile || !profileRejectionNote.trim()}
                  >
                    {isRejectingProfile ? (
                      <IconLoader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <IconX className="mr-2 size-4" />
                    )}
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Compliance Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCertificate2 className="size-5" />
            Compliance Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {worker.complianceDocs.length > 0 ? (
            <div className="space-y-3">
              {worker.complianceDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Expires: {doc.expiresAt ? new Date(doc.expiresAt).toLocaleDateString('en-US') : 'N/A'}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      'font-medium',
                      doc.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500'
                    )}
                  >
                    {doc.status === 'APPROVED' ? 'Verified' : 'Pending Review'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No compliance documents uploaded</p>
          )}
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconClock className="size-5" />
            Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          {worker.availabilities.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {worker.availabilities.map((avail) => (
                <div
                  key={avail.id}
                  className="rounded-lg border bg-muted/50 p-3"
                >
                  <p className="font-medium text-foreground">{dayNames[avail.dayOfWeek]}</p>
                  <p className="text-sm text-muted-foreground">
                    {avail.startTime} - {avail.endTime}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No availability set</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Shifts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCalendar className="size-5" />
            Recent Shifts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {worker.shiftBookings.length > 0 ? (
            <div className="space-y-3">
              {worker.shiftBookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {booking.shift.client.user.firstName} {booking.shift.client.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.shift.date).toLocaleDateString('en-US')} •{' '}
                      {booking.shift.startTime} - {booking.shift.endTime}
                    </p>
                  </div>
                  <Badge
                    variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'}
                  >
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No shifts assigned</p>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {worker.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{worker.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
