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
  IconHeadset,
  IconLock,
  IconPhone,
} from '@tabler/icons-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Portal Access | Angel Touch Homecare',
  description: 'Sign in to your Angel Touch Homecare portal. Clients can view care schedules and invoices. Employees can manage shifts, timesheets, and compliance documents.',
};

const clientFeatures = [
  { icon: IconCalendar, label: 'View your care schedule' },
  { icon: IconUserHeart, label: 'Meet your care team' },
  { icon: IconFileDescription, label: 'Access invoices & statements' },
  { icon: IconShieldCheck, label: 'Update care preferences' },
];

const employeeFeatures = [
  { icon: IconCalendar, label: 'View & accept available shifts' },
  { icon: IconClock, label: 'Submit weekly timesheets' },
  { icon: IconFileDescription, label: 'Upload compliance documents' },
  { icon: IconShieldCheck, label: 'Track hours & earnings' },
];

export default function PortalsPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary sm:mb-6 sm:px-4 sm:py-1.5 sm:text-sm">
            <IconLock className="size-3.5 sm:size-4" />
            Secure Portal Access
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            Welcome to Your
            <span className="mt-1 block text-primary sm:mt-2">Care Portal</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:mt-6 sm:text-lg md:text-xl">
            Access your personalized dashboard to manage care schedules, 
            view documents, and stay connected.
          </p>
        </div>
      </section>

      {/* Portal Cards */}
      <section className="flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <div className="mx-auto grid max-w-5xl gap-6 sm:gap-8 md:grid-cols-2">
          {/* Client Portal */}
          <Card className="group relative flex flex-col overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
            <div className="absolute -right-16 -top-16 size-32 rounded-full bg-primary/10 transition-transform duration-300 group-hover:scale-125 sm:size-40" />
            <CardHeader className="relative flex-none pb-2 sm:pb-4">
              <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/10 sm:mb-4 sm:size-14 sm:rounded-2xl sm:ring-4">
                <IconUsers className="size-6 text-primary sm:size-7" />
              </div>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl">Client Portal</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                For families and care recipients managing their home care services
              </CardDescription>
            </CardHeader>
            <CardContent className="relative flex flex-1 flex-col space-y-4 sm:space-y-6">
              <ul className="flex-1 space-y-2 sm:space-y-3">
                {clientFeatures.map((feature) => (
                  <li key={feature.label} className="flex items-center gap-2.5 text-sm text-muted-foreground sm:gap-3 sm:text-base">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 sm:size-8 sm:rounded-lg">
                      <feature.icon className="size-3.5 text-primary sm:size-4" />
                    </div>
                    <span>{feature.label}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="h-11 w-full text-sm font-semibold sm:h-12 sm:text-base">
                <Link href="/client">
                  Sign In to Client Portal
                  <IconArrowRight className="ml-2 size-4 sm:size-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Employee Portal */}
          <Card className="group relative flex flex-col overflow-hidden border-2 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-xl">
            <div className="absolute -right-16 -top-16 size-32 rounded-full bg-emerald-500/10 transition-transform duration-300 group-hover:scale-125 sm:size-40" />
            <CardHeader className="relative flex-none pb-2 sm:pb-4">
              <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 ring-2 ring-emerald-500/10 sm:mb-4 sm:size-14 sm:rounded-2xl sm:ring-4">
                <IconUserHeart className="size-6 text-emerald-600 dark:text-emerald-500 sm:size-7" />
              </div>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl">Employee Portal</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                For caregivers to manage shifts, timesheets, and compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="relative flex flex-1 flex-col space-y-4 sm:space-y-6">
              <ul className="flex-1 space-y-2 sm:space-y-3">
                {employeeFeatures.map((feature) => (
                  <li key={feature.label} className="flex items-center gap-2.5 text-sm text-muted-foreground sm:gap-3 sm:text-base">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 sm:size-8 sm:rounded-lg">
                      <feature.icon className="size-3.5 text-emerald-600 dark:text-emerald-500 sm:size-4" />
                    </div>
                    <span>{feature.label}</span>
                  </li>
                ))}
              </ul>
              <Button 
                asChild 
                size="lg" 
                className="h-11 w-full bg-emerald-600 text-sm font-semibold hover:bg-emerald-700 sm:h-12 sm:text-base"
              >
                <Link href="/employee">
                  Sign In to Employee Portal
                  <IconArrowRight className="ml-2 size-4 sm:size-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Help Section */}
      <section className="mt-auto border-t bg-muted/30">
        <div className="px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-6 sm:text-left">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 sm:size-16">
                <IconHeadset className="size-7 text-primary sm:size-8" />
              </div>
              <div className="flex-1 space-y-1">
                <h2 className="text-lg font-semibold text-foreground sm:text-xl">Need Help Accessing Your Portal?</h2>
                <p className="text-sm text-muted-foreground sm:text-base">
                  Our team is here to help you get set up or answer any questions.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3">
                <Button asChild variant="outline" className="h-10 sm:h-11">
                  <Link href="/contact">
                    <IconHeadset className="mr-2 size-4" />
                    Contact Support
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="h-10 sm:h-11">
                  <a href="tel:+19784551241">
                    <IconPhone className="mr-2 size-4" />
                    (978) 455-1241
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Link (subtle) */}
      <section className="border-t px-4 py-4 sm:py-6">
        <p className="text-center text-xs text-muted-foreground sm:text-sm">
          Staff administrator?{' '}
          <Link href="/admin" className="font-medium text-primary hover:underline">
            Access Admin Dashboard
          </Link>
        </p>
      </section>
    </div>
  );
}
