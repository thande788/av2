import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { isDemoEnabled } from '@/lib/feature-flags';
import { DemoBanner } from '@/components/demo/demo-banner';
import { EmployeeSidebar } from '@/components/employee/sidebar';

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
      {isDemoEnabled() && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <DemoBanner />
        </div>
      )}
      <EmployeeSidebar />
      <main className="flex-1 overflow-auto">
        <div className={`container max-w-7xl py-8 px-6 lg:px-8 ${isDemoEnabled() ? 'mt-10' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
