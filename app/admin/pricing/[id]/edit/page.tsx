import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { PricingTierForm } from '../../pricing-tier-form';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const tier = await db.pricingTier.findUnique({ where: { id } });
  if (!tier) return { title: 'Tier Not Found' };
  return { title: `Edit ${tier.title} | Pricing | Admin` };
}

export default async function EditPricingTierPage({ params }: Props) {
  const { id } = await params;
  const tier = await db.pricingTier.findUnique({ where: { id } });

  if (!tier) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Edit: {tier.title}
        </h1>
        <p className="text-muted-foreground">
          Update pricing tier details
        </p>
      </div>
      <PricingTierForm tier={tier} />
    </div>
  );
}
