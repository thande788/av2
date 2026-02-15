import type { Metadata } from 'next';
import Link from 'next/link';
import {
  IconUsers,
  IconUserHeart,
  IconShieldCheck,
  IconCalendar,
  IconClock,
  IconFileDescription,
  IconArrowRight,
} from '@tabler/icons-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { isDemoEnabled } from '@/lib/feature-flags';

export const metadata: Metadata = {
  title: 'Portals | Angel Touch Homecare',
  description: 'Access the Angel Touch Homecare client portal or employee portal for scheduling, care updates, and account management.',
};

const clientFeatures = [
  { icon: IconCalendar, label: 'View care schedule' },
  { icon: IconUserHeart, label: 'Meet your caregivers' },
  { icon: IconFileDescription, label: 'Access care notes' },
  { icon: IconShieldCheck, label: 'Manage billing' },
];

const employeeFeatures = [
  { icon: IconCalendar, label: 'View & accept shifts' },
  { icon: IconClock, label: 'Submit timesheets' },
  { icon: IconFileDescription, label: 'Upload compliance docs' },
  { icon: IconShieldCheck, label: 'Track earnings' },
];

export default function PortalsPage() {
  const demoMode = isDemoEnabled();

  return (
    <div className="container py-16">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Access Your Portal
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose your portal to manage scheduling, view care updates, and access your account.
        </p>
      </div>

      {/* Portal Cards */}
      <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
        {/* Client Portal */}
        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-primary/10" />
          <CardHeader className="relative">
            <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-primary/10">
              <IconUsers className="size-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Client Portal</CardTitle>
            <CardDescription>
              For families and care recipients to view schedules and manage care
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <ul className="space-y-3">
              {clientFeatures.map((feature) => (
                <li key={feature.label} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <feature.icon className="size-5 text-primary" />
                  {feature.label}
                </li>
              ))}
            </ul>
            <Button asChild className="w-full">
              <Link href="/client-portal">
                Access Client Portal
                <IconArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Employee Portal */}
        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-emerald-500/10" />
          {demoMode && (
            <Badge className="absolute right-4 top-4 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500">
              Demo Available
            </Badge>
          )}
          <CardHeader className="relative">
            <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-emerald-500/10">
              <IconUserHeart className="size-7 text-emerald-600 dark:text-emerald-500" />
            </div>
            <CardTitle className="text-2xl">Employee Portal</CardTitle>
            <CardDescription>
              For caregivers to manage shifts, timesheets, and compliance
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <ul className="space-y-3">
              {employeeFeatures.map((feature) => (
                <li key={feature.label} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <feature.icon className="size-5 text-emerald-600 dark:text-emerald-500" />
                  {feature.label}
                </li>
              ))}
            </ul>
            <Button 
              asChild 
              variant={demoMode ? 'default' : 'secondary'}
              className={demoMode ? 'w-full bg-emerald-600 hover:bg-emerald-700' : 'w-full'}
              disabled={!demoMode}
            >
              <Link href={demoMode ? '/employee' : '#'}>
                {demoMode ? 'Access Employee Portal' : 'Coming Soon'}
                {demoMode && <IconArrowRight className="ml-2 size-4" />}
              </Link>
            </Button>
            {!demoMode && (
              <p className="text-center text-xs text-muted-foreground">
                Employee portal launching soon
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <div className="mx-auto mt-16 max-w-2xl text-center">
        <h2 className="text-lg font-semibold text-foreground">Need Help?</h2>
        <p className="mt-2 text-muted-foreground">
          If you&apos;re having trouble accessing your portal or need to set up your account,{' '}
          <Link href="/contact" className="text-primary hover:underline">
            contact us
          </Link>{' '}
          and we&apos;ll be happy to assist.
        </p>
      </div>
    </div>
  );
}
