import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { WorkerDetail } from './worker-detail';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const worker = await db.worker.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!worker) {
    return { title: 'Worker Not Found' };
  }

  return {
    title: `${worker.user.firstName} ${worker.user.lastName} | Admin`,
  };
}

export default async function WorkerDetailPage({ params }: Props) {
  const { id } = await params;
  
  const worker = await db.worker.findUnique({
    where: { id },
    include: {
      user: true,
      complianceDocs: {
        orderBy: { createdAt: 'desc' },
      },
      availabilities: {
        orderBy: { dayOfWeek: 'asc' },
      },
      shiftBookings: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          shift: {
            include: {
              client: {
                include: { user: true },
              },
            },
          },
        },
      },
    },
  });

  if (!worker) {
    notFound();
  }

  return <WorkerDetail worker={worker} />;
}
