import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { OnboardingStep } from '@/components/shared/onboarding-wizard';

export const familyOnboardingSteps: OnboardingStep[] = [
  {
    title: 'Welcome to the Family Portal',
    description:
      'This is your hub for managing your loved one\'s care. Here you can view schedules, communicate with caregivers, and manage billing.',
    icon: 'Heart',
    content: (
      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground space-y-2">
        <p>From your dashboard you can:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>View upcoming care visits and schedules</li>
          <li>See your assigned care team</li>
          <li>Track invoices and make payments</li>
          <li>Provide feedback on care quality</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Review Your Care Schedule',
    description:
      'Your care schedule shows all upcoming and past visits. You\'ll see the caregiver assigned, the time, and the type of care provided.',
    icon: 'Calendar',
    content: (
      <div className="flex justify-center">
        <Button variant="outline" size="sm" asChild>
          <Link href="/client/schedule">View Schedule →</Link>
        </Button>
      </div>
    ),
  },
  {
    title: 'Set Your Notification Preferences',
    description:
      'Choose how you\'d like to be notified about schedule changes, caregiver updates, and billing reminders.',
    icon: 'Bell',
    content: (
      <div className="flex justify-center">
        <Button variant="outline" size="sm" asChild>
          <Link href="/client/settings">Open Settings →</Link>
        </Button>
      </div>
    ),
  },
];

export const employeeOnboardingSteps: OnboardingStep[] = [
  {
    title: 'Welcome to the Employee Portal',
    description:
      'This is your central hub for managing shifts, tracking hours, and communicating with the care team.',
    icon: 'User',
    content: (
      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground space-y-2">
        <p>From your dashboard you can:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>View your upcoming shift schedule</li>
          <li>Clock in/out and track hours</li>
          <li>Submit shift notes and handoff reports</li>
          <li>Manage your availability</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Set Your Availability',
    description:
      'Let your coordinator know when you\'re available to work. This helps us match you with the right shifts.',
    icon: 'Calendar',
    content: (
      <div className="flex justify-center">
        <Button variant="outline" size="sm" asChild>
          <Link href="/employee/availability">Set Availability →</Link>
        </Button>
      </div>
    ),
  },
  {
    title: 'Complete Your Profile',
    description:
      'Ensure your skills, certifications, and contact information are all up to date for the best shift matching.',
    icon: 'Shield',
    content: (
      <div className="flex justify-center">
        <Button variant="outline" size="sm" asChild>
          <Link href="/employee/compliance">View Compliance →</Link>
        </Button>
      </div>
    ),
  },
];

export const adminOnboardingSteps: OnboardingStep[] = [
  {
    title: 'Welcome to the Admin Dashboard',
    description:
      'This is your command center for managing clients, caregivers, schedules, and operations. Let\'s walk through the key features.',
    icon: 'Shield',
    content: (
      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground space-y-2">
        <p>Your dashboard gives you an at-a-glance view of:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Active clients and caregivers</li>
          <li>Operations metrics and recent activity</li>
          <li>Pending approvals and alerts</li>
          <li>Satisfaction scores and trends</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Managing Clients',
    description:
      'Add new clients, update their care plans, and assign caregivers. The matching system helps you find the best caregiver-client fit.',
    icon: 'User',
    content: (
      <div className="flex justify-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/clients">View Clients →</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/matching">Matching →</Link>
        </Button>
      </div>
    ),
  },
  {
    title: 'Scheduling & Shifts',
    description:
      'Create and manage shifts, handle swap requests, and broadcast open shifts to available caregivers.',
    icon: 'Calendar',
    content: (
      <div className="flex justify-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/scheduling">Scheduling →</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/broadcast">Broadcasts →</Link>
        </Button>
      </div>
    ),
  },
];
