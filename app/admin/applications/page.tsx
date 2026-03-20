import { db } from '@/lib/db';
import { ApplicationsView } from './applications-view';

export const metadata = {
  title: 'Applications',
  description: 'Manage job applications',
};

export default async function ApplicationsPage() {
  const applications = await db.application.findMany({
    orderBy: { submittedAt: 'desc' },
    include: {
      job: {
        select: {
          title: true,
          department: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-muted-foreground">
          Manage and review job applications
        </p>
      </div>

      <ApplicationsView applications={applications} />
    </div>
  );
}
