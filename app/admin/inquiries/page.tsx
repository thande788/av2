import { db } from '@/lib/db';
import { InquiriesTable } from './inquiries-table';

export const metadata = {
  title: 'Service Inquiries | Admin Dashboard',
  description: 'View and manage service inquiries',
};

export default async function InquiriesPage() {
  const inquiries = await db.serviceInquiry.findMany({
    orderBy: { submittedAt: 'desc' },
    include: {
      preferredCaregiver: { include: { user: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Service Inquiries</h1>
        <p className="text-muted-foreground">
          View and manage care service inquiries
        </p>
      </div>

      <InquiriesTable inquiries={inquiries} />
    </div>
  );
}
