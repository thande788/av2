'use client';

import { FeatureTour, TourTrigger } from '@/components/shared/feature-tour';
import { employeeDashboardTour } from '@/data/tour-steps';
import { IconHelp } from '@tabler/icons-react';

export function EmployeeDashboardTour() {
  return (
    <>
      <FeatureTour
        steps={employeeDashboardTour}
        storageKey="employee-dashboard-tour"
        startDelay={1200}
      />
      <TourTrigger
        storageKey="employee-dashboard-tour"
        className="fixed bottom-20 right-4 z-40 gap-1.5 rounded-full shadow-md sm:right-6"
      >
        <IconHelp className="size-4" />
        <span className="sr-only sm:not-sr-only">Tour</span>
      </TourTrigger>
    </>
  );
}
