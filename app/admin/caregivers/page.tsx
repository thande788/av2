import { db } from '@/lib/db';
import { serialize } from '@/lib/utils';
import { maybeSignBlobReadUrl } from '@/lib/azure-blob';
import { CaregiverProfiles } from './caregiver-profiles';

export const metadata = {
  title: 'Caregiver Profiles',
  description: 'Review, publish, and manage caregiver marketing profiles',
};

export default async function CaregiverProfilesPage() {
  const workers = await db.worker.findMany({
    where: {
      marketingBio: { not: null },
    },
    orderBy: [
      { profileStatus: 'asc' }, // PENDING_REVIEW first
      { updatedAt: 'desc' },
    ],
    include: {
      user: true,
    },
  });

  const workersWithSignedPhotos = await Promise.all(
    workers.map(async (worker) => ({
      ...worker,
      marketingPhotoUrl: await maybeSignBlobReadUrl(worker.marketingPhotoUrl),
    })),
  );

  const serialized = serialize(workersWithSignedPhotos);

  const pending = serialized.filter((w) => w.profileStatus === 'PENDING_REVIEW').length;
  const approved = serialized.filter((w) => w.profileStatus === 'APPROVED').length;
  const published = serialized.filter((w) => w.isPublicProfile).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Caregiver Profiles</h1>
        <p className="text-muted-foreground">
          Review, approve, and control which profiles appear on the public website.
        </p>
      </div>

      <CaregiverProfiles
        workers={serialized}
        counts={{ pending, approved, published }}
      />
    </div>
  );
}
