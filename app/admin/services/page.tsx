import { db } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { ServicesTable } from './services-table';

export const metadata = {
  title: 'Services',
  description: 'Manage service categories and offerings',
};

export default async function ServicesPage() {
  const categories = await db.serviceCategory.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { services: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Services
            <Badge variant="secondary" className="text-sm">
              {categories.length} categories
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            Manage service categories and individual services displayed on the
            public site
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/services/new">
            <Plus className="size-4 mr-2" />
            Add Category
          </Link>
        </Button>
      </div>

      <ServicesTable categories={categories} />
    </div>
  );
}
