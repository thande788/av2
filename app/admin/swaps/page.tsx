import type { Metadata } from 'next';
import { getPendingSwapRequests } from '@/app/actions/shift-swaps';
import { serialize } from '@/lib/utils';
import { SwapReviewQueue } from './swap-review-queue';

export const metadata: Metadata = {
  title: 'Shift Swaps',
};

export default async function SwapsPage() {
  const swaps = await getPendingSwapRequests();
  const serialized = serialize(swaps);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Shift Swaps</h1>
        <p className="mt-1 text-muted-foreground">
          Review and approve shift swap requests from employees.
        </p>
      </div>
      <SwapReviewQueue swaps={serialized} />
    </div>
  );
}
