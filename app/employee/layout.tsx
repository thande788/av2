import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { isDemoEnabled } from '@/lib/feature-flags';
import { DemoBanner } from '@/components/demo/demo-banner';
import { EmployeeSidebar } from '@/components/employee/sidebar';
import { LogoWatermark } from '@/components/shared/logo-watermark';

export const metadata: Metadata = {
  title: {
    default: 'Employee Portal',
    template: '%s | Employee Portal',
  },
  description: 'Angel Touch Homecare employee portal',
};

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
    <div className="flex min-h-screen bg-background">
      <EmployeeSidebar />
      <main className="relative min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        <LogoWatermark />
        <div className="app-shell relative z-10 py-5 s375:py-6 md:py-8 lg:py-10">
          {children}
        </div>
      </main>
      <DemoBanner />
    </div>
  );
}
