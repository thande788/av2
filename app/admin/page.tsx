import { Suspense } from 'react';
import {
  DashboardHeader,
  DashboardMetricsSkeleton,
  DashboardPanelsSkeleton,
  IntakeOverviewSection,
  OperationsOverviewSection,
  OperationsWidgetsSection,
  RecentActivitySection,
} from '@/components/admin/dashboard-sections';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <DashboardHeader />

      <Suspense fallback={<DashboardMetricsSkeleton />}>
        <OperationsOverviewSection />
      </Suspense>

      <Suspense fallback={<DashboardMetricsSkeleton />}>
        <IntakeOverviewSection />
      </Suspense>

      <Suspense fallback={<DashboardPanelsSkeleton columns={3} />}>
        <RecentActivitySection />
      </Suspense>

      <Suspense fallback={<DashboardPanelsSkeleton columns={2} />}>
        <OperationsWidgetsSection />
      </Suspense>
    </div>
  );
}