import { redirect } from 'next/navigation';
import { isDemoEnabled } from '@/lib/feature-flags';
import { ClientSidebar } from '@/components/client/sidebar';
import { DemoBanner } from '@/components/demo/demo-banner';
import { LogoWatermark } from '@/components/shared/logo-watermark';

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate the client portal behind demo mode
  if (!isDemoEnabled()) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ClientSidebar />
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
