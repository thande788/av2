import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { ShiftDetail } from './shift-detail';

export const metadata = {
  title: 'Shift Details | Admin',
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

  return (
    <ShiftDetail 
      shift={shift}
      availableWorkers={availableWorkers}
    />
  );
}
