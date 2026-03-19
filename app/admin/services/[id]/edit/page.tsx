import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { CategoryForm } from '../../category-form';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const category = await db.serviceCategory.findUnique({ where: { id } });
  if (!category) return { title: 'Category Not Found' };
  return { title: `Edit ${category.name} | Admin` };
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await db.serviceCategory.findUnique({ where: { id } });

  if (!category) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Edit Category</h1>
        <p className="text-muted-foreground">Update {category.name}</p>
      </div>

      <CategoryForm category={category} />
    </div>
  );
}
