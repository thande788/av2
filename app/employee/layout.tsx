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
      <main className="relative flex-1 overflow-auto">
        <LogoWatermark />
        <div className="container relative z-10 max-w-7xl py-8 px-6 lg:px-8">
          {children}
        </div>
      </main>
      <DemoBanner />
    </div>
  );
}
