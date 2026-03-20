import { db } from '@/lib/db';
import { InquiriesTable } from './inquiries-table';
import { CaregiverRequestsCard } from './caregiver-requests';

export const metadata = {
  title: 'Service Inquiries',
  description: 'View and manage service inquiries',
};

export default async function InquiriesPage() {
  const [inquiries, caregiverRequests] = await Promise.all([
    db.serviceInquiry.findMany({
      orderBy: { submittedAt: 'desc' },
    }),
    db.contactSubmission.findMany({
      where: { preferredCaregiverId: { not: null } },
      orderBy: { submittedAt: 'desc' },
      include: {
        preferredCaregiver: {
          select: { id: true, user: { select: { firstName: true, lastName: true } } },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Service Inquiries</h1>
        <p className="text-muted-foreground">
          View and manage care service inquiries
        </p>
      </div>

      {caregiverRequests.length > 0 && (
        <CaregiverRequestsCard requests={caregiverRequests} />
      )}

      <InquiriesTable inquiries={inquiries} />
    </div>
  );
}
