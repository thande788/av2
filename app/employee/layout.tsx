import type { Metadata } from 'next';
import Link from 'next/link';
import {
  IconCalendar,
  IconClock,
  IconHome,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';

import { isDemoEnabled } from '@/lib/feature-flags';
import { DemoBanner } from '@/components/demo/demo-banner';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: {
    default: 'Employee Portal',
    template: '%s | Employee Portal',
  },
  description: 'Angel Touch Homecare employee portal',
};

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/employee', icon: IconHome },
  { label: 'My Shifts', href: '/employee/shifts', icon: IconCalendar },
  { label: 'Timesheets', href: '/employee/timesheets', icon: IconClock },
  { label: 'Profile', href: '/employee/profile', icon: IconUser },
  { label: 'Settings', href: '/employee/settings', icon: IconSettings },
];

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate behind demo mode
  if (!isDemoEnabled()) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {isDemoEnabled() && <DemoBanner />}
      
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/employee" className="font-bold text-foreground">
              Employee Portal
            </Link>
            <nav className="hidden md:flex md:gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {/* Profile dropdown would go here */}
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
              <IconUser className="size-5 text-primary" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container flex-1 py-8">{children}</main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card md:hidden">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
