import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ServiceItemForm } from '../service-item-form';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const category = await db.serviceCategory.findUnique({ where: { id } });
  if (!category) return { title: 'Category Not Found' };
  return { title: `New Service | ${category.name} | Admin` };
}

export default async function NewServiceItemPage({ params }: Props) {
  const { id } = await params;
  const category = await db.serviceCategory.findUnique({ where: { id } });

  if (!category) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Add Service</h1>
        <p className="text-muted-foreground">
          Add a new service to {category.name}
        </p>
      </div>

      <ServiceItemForm categoryId={category.id} />
    </div>
  );
}
