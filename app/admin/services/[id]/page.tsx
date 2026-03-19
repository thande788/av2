import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus } from 'lucide-react';
import { getServiceIcon } from '@/lib/icons';
import { ServiceItemsTable } from './service-items-table';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const category = await db.serviceCategory.findUnique({ where: { id } });
  if (!category) return { title: 'Category Not Found' };
  return { title: `${category.name} | Services | Admin` };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { id } = await params;

  const category = await db.serviceCategory.findUnique({
    where: { id },
    include: {
      services: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!category) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/services">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5">
              {getServiceIcon(category.icon, 'size-5 text-primary')}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                {category.name}
                {category.isActive ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-sm">Inactive</Badge>
                )}
              </h1>
              <p className="text-muted-foreground">{category.description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/services/${category.id}/edit`}>Edit Category</Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/services/${category.id}/items/new`}>
              <Plus className="size-4 mr-2" />
              Add Service
            </Link>
          </Button>
        </div>
      </div>

      <ServiceItemsTable items={category.services} categoryId={category.id} />
    </div>
  );
}
