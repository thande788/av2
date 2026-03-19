'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconCheck,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import type { Worker, PortalUser } from '@prisma/client';

import { cn, type Serialized } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UserAvatar } from '@/components/shared/user-avatar';
import {
  approveWorkerProfile,
  rejectWorkerProfile,
  togglePublicProfile,
} from '@/app/actions/workers';

type WorkerWithUser = Serialized<Worker & { user: PortalUser }>;

interface CaregiverProfilesProps {
  workers: WorkerWithUser[];
  counts: { pending: number; approved: number; published: number };
}

const statusBadge: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  PENDING_REVIEW: { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' },
  APPROVED: { label: 'Approved', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500' },
};

export function CaregiverProfiles({ workers, counts }: CaregiverProfilesProps) {
  const defaultTab = counts.pending > 0 ? 'pending' : 'all';

  const pending = workers.filter((w) => w.profileStatus === 'PENDING_REVIEW');
  const approved = workers.filter((w) => w.profileStatus === 'APPROVED');
  const published = workers.filter((w) => w.isPublicProfile);

  return (
    <Tabs defaultValue={defaultTab} className="space-y-4">
      <TabsList className="bg-transparent border border-border">
        <TabsTrigger value="all">
          All
          <Badge variant="secondary" className="ml-2">{workers.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="pending">
          Pending Review
          {counts.pending > 0 && (
            <Badge variant="destructive" className="ml-2">{counts.pending}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="approved">
          Approved
          <Badge variant="secondary" className="ml-2">{counts.approved}</Badge>
        </TabsTrigger>
        <TabsTrigger value="published">
          Published
          <Badge variant="secondary" className="ml-2">{counts.published}</Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <ProfileGrid workers={workers} />
      </TabsContent>
      <TabsContent value="pending">
        {pending.length === 0 ? (
          <EmptyState message="No profiles pending review." />
        ) : (
          <ProfileGrid workers={pending} />
        )}
      </TabsContent>
      <TabsContent value="approved">
        {approved.length === 0 ? (
          <EmptyState message="No approved profiles yet." />
        ) : (
          <ProfileGrid workers={approved} />
        )}
      </TabsContent>
      <TabsContent value="published">
        {published.length === 0 ? (
          <EmptyState message="No published profiles yet." />
        ) : (
          <ProfileGrid workers={published} />
        )}
      </TabsContent>
    </Tabs>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <IconUser className="mx-auto size-10 text-muted-foreground/40" />
        <p className="mt-3 text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

function ProfileGrid({ workers }: { workers: WorkerWithUser[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {workers.map((w) => (
        <ProfileCard key={w.id} worker={w} />
      ))}
    </div>
  );
}

function ProfileCard({ worker }: { worker: WorkerWithUser }) {
  const router = useRouter();
  const [rejectionNote, setRejectionNote] = React.useState('');
  const [isApproving, setIsApproving] = React.useState(false);
  const [isRejecting, setIsRejecting] = React.useState(false);
  const [isToggling, setIsToggling] = React.useState(false);
  const [showRejectField, setShowRejectField] = React.useState(false);

  const badge = statusBadge[worker.profileStatus] ?? statusBadge.DRAFT;

  async function handleApprove() {
    setIsApproving(true);
    await approveWorkerProfile(worker.id);
    router.refresh();
    setIsApproving(false);
  }

  async function handleReject() {
    if (!rejectionNote.trim()) return;
    setIsRejecting(true);
    await rejectWorkerProfile(worker.id, rejectionNote.trim());
    router.refresh();
    setIsRejecting(false);
    setShowRejectField(false);
    setRejectionNote('');
  }

  async function handleToggle() {
    setIsToggling(true);
    await togglePublicProfile(worker.id, !worker.isPublicProfile);
    router.refresh();
    setIsToggling(false);
  }

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-md">
      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

      <CardHeader className="relative pb-3">
        <div className="flex items-start gap-4">
          {/* Profile photo or initials */}
          <UserAvatar
            src={worker.marketingPhotoUrl}
            name={`${worker.user.firstName} ${worker.user.lastName}`}
            size="md"
          />

          <div className="min-w-0 flex-1">
            <CardTitle className="text-base">
              <Link
                href={`/admin/workers/${worker.id}`}
                className="hover:text-primary hover:underline"
              >
                {worker.user.firstName} {worker.user.lastName}
              </Link>
            </CardTitle>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge className={cn('text-xs font-medium', badge.className)}>
                {badge.label}
              </Badge>
              {worker.isPublicProfile && (
                <Badge className="bg-primary/15 text-primary text-xs">Public</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-3">
        {/* Bio preview */}
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {worker.marketingBio}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {worker.yearsExperience != null && (
            <span>{worker.yearsExperience} yrs exp.</span>
          )}
          {worker.marketingSpecialties.length > 0 && (
            <span>{worker.marketingSpecialties.length} specialties</span>
          )}
          {worker.marketingLanguages.length > 0 && (
            <span>{worker.marketingLanguages.join(', ')}</span>
          )}
        </div>

        {/* Specialties */}
        {worker.marketingSpecialties.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {worker.marketingSpecialties.slice(0, 4).map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
            ))}
            {worker.marketingSpecialties.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{worker.marketingSpecialties.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 border-t pt-3">
          {worker.profileStatus === 'PENDING_REVIEW' && (
            <>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleApprove} disabled={isApproving || isRejecting}>
                  {isApproving ? <IconLoader2 className="mr-1 size-3.5 animate-spin" /> : <IconCheck className="mr-1 size-3.5" />}
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => setShowRejectField(!showRejectField)}
                  disabled={isApproving || isRejecting}
                >
                  <IconX className="mr-1 size-3.5" />
                  Reject
                </Button>
              </div>

              {showRejectField && (
                <div className="space-y-2">
                  <Label htmlFor={`reject-${worker.id}`} className="text-xs">
                    Rejection feedback
                  </Label>
                  <Textarea
                    id={`reject-${worker.id}`}
                    value={rejectionNote}
                    onChange={(e) => setRejectionNote(e.target.value)}
                    placeholder="What needs to change..."
                    rows={2}
                    className="resize-none text-sm"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleReject}
                    disabled={!rejectionNote.trim() || isRejecting}
                  >
                    {isRejecting && <IconLoader2 className="mr-1 size-3.5 animate-spin" />}
                    Confirm Reject
                  </Button>
                </div>
              )}
            </>
          )}

          {worker.profileStatus === 'APPROVED' && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleToggle}
              disabled={isToggling}
            >
              {isToggling ? (
                <IconLoader2 className="mr-1 size-3.5 animate-spin" />
              ) : worker.isPublicProfile ? (
                <IconEyeOff className="mr-1 size-3.5" />
              ) : (
                <IconEye className="mr-1 size-3.5" />
              )}
              {worker.isPublicProfile ? 'Unpublish' : 'Publish to Website'}
            </Button>
          )}

          {worker.profileStatus === 'REJECTED' && worker.profileRejectionNote && (
            <p className="text-xs text-red-600 dark:text-red-400">
              <span className="font-medium">Rejection note:</span> {worker.profileRejectionNote}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
