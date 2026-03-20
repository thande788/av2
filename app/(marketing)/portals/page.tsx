import type { Metadata } from 'next';
import Image from 'next/image';
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
  IconCheck,
  IconSparkles,
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Portal Access | Angel Touch Homecare',
  description:
    'Sign in to your Angel Touch Homecare portal. Clients can view care schedules and invoices. Employees can manage shifts, timesheets, and compliance documents.',
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
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
        {/* Multi-layer background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.06] via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(var(--color-primary)/0.15),transparent)]" />
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.border/0.03)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        {/* Floating decorative elements */}
        <div className="absolute left-1/4 top-20 size-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-10 size-56 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Logo watermark behind heading */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04] select-none">
            <div className="size-[300px] overflow-hidden sm:size-[400px]">
              <Image
                src="/angel_pink.png"
                alt=""
                width={650}
                height={731}
                className="size-full object-contain"
                priority={false}
              />
            </div>
          </div>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur-sm sm:mb-7 sm:text-sm">
            <IconLock className="size-3.5 sm:size-4" />
            Secure Portal Access
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Welcome to Your
            <span className="mt-2 block bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent sm:mt-3">
              Care Portal
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-7 sm:text-lg md:text-xl">
            Access your personalized dashboard to manage care schedules, view
            documents, and stay connected with your care team.
          </p>

          {/* Trust indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground sm:mt-10 sm:gap-x-8 sm:text-sm">
            <span className="flex items-center gap-1.5">
              <IconCheck className="size-4 text-emerald-500" />
              256-bit encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <IconCheck className="size-4 text-emerald-500" />
              HIPAA-compliant
            </span>
            <span className="flex items-center gap-1.5">
              <IconCheck className="size-4 text-emerald-500" />
              24/7 access
            </span>
          </div>
        </div>
      </section>

      {/* Portal Cards */}
      <section className="flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:py-20">
        <div className="mx-auto grid max-w-5xl gap-8 sm:gap-10 md:grid-cols-2">
          {/* Client Portal Card */}
          <div className="group relative">
            {/* Glow effect on hover */}
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-xl group-hover:shadow-primary/5">
              {/* Card header gradient strip */}
              <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/80 to-primary/40" />
              {/* Decorative radial gradient */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(var(--color-primary)/0.08),transparent_60%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(var(--color-primary)/0.04),transparent_60%)]" />

              <div className="relative flex flex-1 flex-col p-6 sm:p-8">
                {/* Icon + badge row */}
                <div className="mb-5 flex items-center justify-between sm:mb-6">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10 sm:size-16">
                    <IconUsers className="size-7 text-primary sm:size-8" />
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Families & Clients
                  </span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Client Portal
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  For families and care recipients managing their home care
                  services
                </p>

                {/* Divider */}
                <div className="my-5 h-px bg-gradient-to-r from-transparent via-border to-transparent sm:my-6" />

                {/* Feature list */}
                <ul className="flex-1 space-y-3 sm:space-y-4">
                  {clientFeatures.map((feature) => (
                    <li
                      key={feature.label}
                      className="flex items-center gap-3 text-sm text-muted-foreground transition-colors group-hover:text-foreground/80 sm:text-base"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:size-9">
                        <feature.icon className="size-4 text-primary sm:size-[18px]" />
                      </div>
                      <span>{feature.label}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  asChild
                  size="lg"
                  className="mt-6 h-12 w-full text-sm font-semibold shadow-md shadow-primary/10 transition-all hover:shadow-lg hover:shadow-primary/20 sm:mt-8 sm:h-13 sm:text-base"
                >
                  <Link href="/client">
                    Sign In to Client Portal
                    <IconArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5 sm:size-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Employee Portal Card */}
          <div className="group relative">
            {/* Glow effect on hover */}
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 group-hover:border-emerald-500/40 group-hover:shadow-xl group-hover:shadow-emerald-500/5">
              {/* Card header gradient strip */}
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-emerald-500/80 to-emerald-500/40" />
              {/* Decorative radial gradient */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.08),transparent_60%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(16,185,129,0.04),transparent_60%)]" />

              <div className="relative flex flex-1 flex-col p-6 sm:p-8">
                {/* Icon + badge row */}
                <div className="mb-5 flex items-center justify-between sm:mb-6">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 ring-1 ring-emerald-500/10 sm:size-16">
                    <IconUserHeart className="size-7 text-emerald-600 dark:text-emerald-500 sm:size-8" />
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    Caregivers & Staff
                  </span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Employee Portal
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  For caregivers to manage shifts, timesheets, and compliance
                </p>

                {/* Divider */}
                <div className="my-5 h-px bg-gradient-to-r from-transparent via-border to-transparent sm:my-6" />

                {/* Feature list */}
                <ul className="flex-1 space-y-3 sm:space-y-4">
                  {employeeFeatures.map((feature) => (
                    <li
                      key={feature.label}
                      className="flex items-center gap-3 text-sm text-muted-foreground transition-colors group-hover:text-foreground/80 sm:text-base"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 sm:size-9">
                        <feature.icon className="size-4 text-emerald-600 dark:text-emerald-500 sm:size-[18px]" />
                      </div>
                      <span>{feature.label}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  asChild
                  size="lg"
                  className="mt-6 h-12 w-full bg-emerald-600 text-sm font-semibold shadow-md shadow-emerald-600/10 transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 sm:mt-8 sm:h-13 sm:text-base"
                >
                  <Link href="/employee">
                    Sign In to Employee Portal
                    <IconArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5 sm:size-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="mt-auto border-t bg-gradient-to-b from-muted/40 to-muted/10">
        <div className="px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm sm:p-8">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-emerald-500/[0.03] pointer-events-none" />
              <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10 sm:size-16">
                  <IconHeadset className="size-7 text-primary sm:size-8" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <h2 className="text-lg font-semibold text-foreground sm:text-xl">
                    Need Help Accessing Your Portal?
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Our team is here to help you get set up or answer any
                    questions about your account.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 shadow-sm sm:h-11"
                  >
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
        </div>
      </section>

      {/* Admin Link (subtle) */}
      <section className="border-t border-border/40 px-4 py-5 sm:py-6">
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
          <IconSparkles className="size-3.5 text-primary/50" />
          Staff administrator?{' '}
          <Link
            href="/admin"
            className="font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
          >
            Access Admin Dashboard
          </Link>
        </p>
      </section>
    </div>
  );
}
