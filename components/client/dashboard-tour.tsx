'use client';

import { FeatureTour, TourTrigger } from '@/components/shared/feature-tour';
import { clientDashboardTour } from '@/data/tour-steps';
import { IconHelp } from '@tabler/icons-react';

export function ClientDashboardTour() {
  return (
    <>
      <FeatureTour
        steps={clientDashboardTour}
        storageKey="client-dashboard-tour"
        startDelay={1200}
      />
      <TourTrigger
        storageKey="client-dashboard-tour"
        className="fixed bottom-20 right-4 z-40 gap-1.5 rounded-full shadow-md sm:right-6"
      >
        <IconHelp className="size-4" />
        <span className="sr-only sm:not-sr-only">Tour</span>
      </TourTrigger>
    </>
  );
}
