import { db } from '@/lib/db';
import { ContactsTable } from './contacts-table';

export const metadata = {
  title: 'Contacts | Admin Dashboard',
  description: 'View and manage contact form submissions',
};

export default async function ContactsPage() {
  const contacts = await db.contactSubmission.findMany({
    orderBy: { submittedAt: 'desc' },
    include: {
      preferredCaregiver: {
        select: { id: true, user: { select: { firstName: true, lastName: true } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact Messages</h1>
        <p className="text-muted-foreground">
          View and manage contact form submissions
        </p>
      </div>

      <ContactsTable contacts={contacts} />
    </div>
  );
}
