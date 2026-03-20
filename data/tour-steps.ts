import type { TourStep } from '@/components/shared/feature-tour';

export const clientDashboardTour: TourStep[] = [
  {
    target: '[data-tour="client-stats"]',
    title: 'Your Quick Stats',
    description:
      'See your upcoming visits, care team size, and pending invoices at a glance.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="client-visits"]',
    title: 'Upcoming Visits',
    description:
      'This section shows your scheduled care visits with caregiver names and times. Click "View All" for the full schedule.',
    placement: 'top',
  },
  {
    target: '[data-tour="client-care-team"]',
    title: 'Your Care Team',
    description:
      'Here you can see all the caregivers assigned to your loved one and leave reviews.',
    placement: 'top',
  },
];

export const employeeDashboardTour: TourStep[] = [
  {
    target: '[data-tour="employee-stats"]',
    title: 'Your Performance Summary',
    description:
      'Track your upcoming shifts, pending requests, hours worked, and earnings this month.',
    placement: 'bottom',
  },
];

export const adminDashboardTour: TourStep[] = [
  {
    target: '[data-tour="admin-header"]',
    title: 'Dashboard & Quick Actions',
    description:
      'Access common tasks like adding clients, creating shifts, and broadcasting from the quick actions menu.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="admin-operations"]',
    title: 'Operations Overview',
    description:
      'Key metrics about active clients, caregivers, hours billed, and satisfaction scores.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="admin-intake"]',
    title: 'Intake Pipeline',
    description:
      'Track new applications, referrals, and inquiries as they move through your intake process.',
    placement: 'top',
  },
  {
    target: '[data-tour="admin-activity"]',
    title: 'Recent Activity',
    description:
      'Review the latest applications, messages, and escalations requiring your attention.',
    placement: 'top',
  },
];
