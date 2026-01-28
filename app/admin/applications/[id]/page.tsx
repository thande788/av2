import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ApplicationDetail } from './application-detail';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const application = await db.application.findUnique({
    where: { id },
    include: { job: { select: { title: true } } },
  });

  if (!application) {
    return { title: 'Application Not Found' };
  }

  return {
    title: `${application.firstName} ${application.lastName} - ${application.job.title} | Admin`,
  };
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  
  const application = await db.application.findUnique({
    where: { id },
    include: {
      job: true,
    },
  });

  if (!application) {
    notFound();
  }

  return <ApplicationDetail application={application} />;
}
