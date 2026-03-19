import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { FAQForm } from '../faq-form';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const faq = await db.fAQ.findUnique({ where: { id } });

  if (!faq) {
    return { title: 'FAQ Not Found' };
  }

  return {
    title: `Edit FAQ | Admin`,
  };
}

export default async function EditFAQPage({ params }: Props) {
  const { id } = await params;
  const faq = await db.fAQ.findUnique({ where: { id } });

  if (!faq) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Edit FAQ</h1>
        <p className="text-muted-foreground">Update FAQ details</p>
      </div>

      <FAQForm faq={faq} />
    </div>
  );
}
