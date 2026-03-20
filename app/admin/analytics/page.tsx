import { getAnalyticsSummary } from '@/app/actions/analytics';
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';

export const metadata = {
  title: 'Analytics',
  description: 'View application and inquiry analytics',
};

export default async function AnalyticsPage() {
  const data = await getAnalyticsSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Application trends, conversion funnel, and submission patterns
        </p>
      </div>

      <AnalyticsDashboard data={data} />
    </div>
  );
}
