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
import { AdminDashboardTour } from '@/components/admin/dashboard-tour';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <AdminDashboardTour />
      <div data-tour="admin-header">
        <DashboardHeader />
      </div>

      <div data-tour="admin-operations">
        <Suspense fallback={<DashboardMetricsSkeleton />}>
          <OperationsOverviewSection />
        </Suspense>
      </div>

      <div data-tour="admin-intake">
        <Suspense fallback={<DashboardMetricsSkeleton />}>
          <IntakeOverviewSection />
        </Suspense>
      </div>

      <div data-tour="admin-activity">
        <Suspense fallback={<DashboardPanelsSkeleton columns={3} />}>
          <RecentActivitySection />
        </Suspense>
      </div>

      <Suspense fallback={<DashboardPanelsSkeleton columns={2} />}>
        <OperationsWidgetsSection />
      </Suspense>
    </div>
  );
}