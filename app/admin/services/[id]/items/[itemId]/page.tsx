import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ServiceItemForm } from '../service-item-form';

interface Props {
  params: Promise<{ id: string; itemId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { itemId } = await params;
  const item = await db.serviceItem.findUnique({ where: { id: itemId } });
  if (!item) return { title: 'Service Not Found' };
  return { title: `Edit ${item.title} | Admin` };
}

export default async function EditServiceItemPage({ params }: Props) {
  const { id, itemId } = await params;

  const item = await db.serviceItem.findUnique({ where: { id: itemId } });
  if (!item) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Edit Service</h1>
        <p className="text-muted-foreground">Update {item.title}</p>
      </div>

      <ServiceItemForm item={item} categoryId={id} />
    </div>
  );
}
