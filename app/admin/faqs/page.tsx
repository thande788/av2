import { db } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { FAQsTable } from './faqs-table';

export const metadata = {
  title: 'FAQs | Admin Dashboard',
  description: 'Manage frequently asked questions',
};

export default async function FAQsPage() {
  const faqs = await db.fAQ.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQs</h1>
          <p className="text-muted-foreground">
            Manage frequently asked questions displayed on the public site
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/faqs/new">
            <Plus className="size-4 mr-2" />
            Add FAQ
          </Link>
        </Button>
      </div>

      <FAQsTable faqs={faqs} />
    </div>
  );
}
