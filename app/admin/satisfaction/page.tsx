import type { Metadata } from 'next';
import { getSatisfactionMetrics } from '@/app/actions/satisfaction';
import { SatisfactionDashboard } from './satisfaction-dashboard';

export const metadata: Metadata = {
  title: 'Satisfaction',
};

export default async function SatisfactionPage() {
  const metrics = await getSatisfactionMetrics(30);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Client Satisfaction</h1>
        <p className="mt-1 text-muted-foreground">
          Track care quality through post-shift surveys and client feedback.
        </p>
      </div>
      <SatisfactionDashboard metrics={metrics} />
    </div>
  );
}
