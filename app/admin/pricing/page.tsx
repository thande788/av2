import { db } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { PricingTable } from './pricing-table';

export const metadata = {
  title: 'Pricing',
  description: 'Manage pricing tiers displayed on the services page',
};

export default async function PricingPage() {
  const tiers = await db.pricingTier.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Pricing Tiers
            <Badge variant="secondary" className="text-sm">
              {tiers.length} tiers
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            Manage pricing tiers displayed on the public services page
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/pricing/new">
            <Plus className="size-4 mr-2" />
            Add Tier
          </Link>
        </Button>
      </div>

      <PricingTable tiers={tiers} />
    </div>
  );
}
