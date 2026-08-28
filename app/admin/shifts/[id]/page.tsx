import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { serialize } from '@/lib/utils';
import { getServiceTypeOptions } from '@/lib/service-types';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { ShiftDetail } from './shift-detail';

export const metadata = {
  title: 'Shift Details',
  description: 'View and manage shift details',
};

interface ShiftDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ShiftDetailPage({ params }: ShiftDetailPageProps) {
  const { id } = await params;
  
  const shift = await db.careShift.findUnique({
    where: { id },
    include: {
      client: {
        include: {
          user: true,
        },
      },
      bookings: {
        include: {
          worker: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!shift) {
    notFound();
  }

  // Get available workers for assignment
  const availableWorkers = await db.worker.findMany({
    where: {
      user: {
        status: 'ACTIVE',
      },
      complianceStatus: 'COMPLIANT',
    },
    include: {
      user: true,
    },
    take: 20,
  });

  const clients = await db.client.findMany({
    where: {
      user: {
        status: 'ACTIVE',
      },
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      user: {
        lastName: 'asc',
      },
    },
  });

  const serviceTypes = await getServiceTypeOptions({ includeInactive: true });
  const enableShiftBroadcast = isFeatureEnabled('shiftBroadcast');
  const enableShiftNotes = isFeatureEnabled('shiftNotes');

  const [broadcastFilterOptions, notes, handoffNotes] = await Promise.all([
    enableShiftBroadcast
      ? (async () => {
          const workers = await db.worker.findMany({
            where: { user: { status: 'ACTIVE' } },
            select: { skills: true, city: true, languages: true },
          });

          const skills = new Set<string>();
          const cities = new Set<string>();
          const languages = new Set<string>();

          for (const worker of workers) {
            worker.skills.forEach((skill) => skills.add(skill));
            if (worker.city) cities.add(worker.city);
            worker.languages.forEach((language) => languages.add(language));
          }

          return {
            skills: [...skills].sort(),
            cities: [...cities].sort(),
            languages: [...languages].sort(),
          };
        })()
      : Promise.resolve(null),
    enableShiftNotes
      ? db.shiftNote.findMany({
          where: { shiftId: shift.id },
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        })
      : Promise.resolve([]),
    enableShiftNotes
      ? db.shiftNote.findMany({
          where: {
            isPinned: true,
            shift: {
              clientId: shift.clientId,
              date: { lt: shift.date },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        })
      : Promise.resolve([]),
  ]);

  return (
    <ShiftDetail 
      shift={serialize(shift)}
      availableWorkers={serialize(availableWorkers)}
      clients={serialize(clients)}
      serviceTypes={serviceTypes}
      enableShiftBroadcast={enableShiftBroadcast}
      enableShiftNotes={enableShiftNotes}
      broadcastFilterOptions={broadcastFilterOptions}
      notes={serialize(notes)}
      handoffNotes={serialize(handoffNotes)}
    />
  );
}
