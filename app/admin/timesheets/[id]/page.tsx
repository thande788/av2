import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { serialize } from '@/lib/utils';
import { TimesheetDetail } from './timesheet-detail';

export const metadata = {
  title: 'Timesheet Details',
  description: 'View and approve timesheet',
};

interface TimesheetDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TimesheetDetailPage({ params }: TimesheetDetailPageProps) {
  const { id } = await params;
  
  const timesheet = await db.timesheet.findUnique({
    where: { id },
    include: {
      worker: {
        include: {
          user: true,
        },
      },
      entries: {
        orderBy: { date: 'asc' },
      },
    },
  });

  if (!timesheet) {
    notFound();
  }

  return <TimesheetDetail timesheet={serialize(timesheet)} />;
}
