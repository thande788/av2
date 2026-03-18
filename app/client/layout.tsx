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
      <main className="relative flex-1 overflow-y-auto">
        <LogoWatermark />
        <div className="container relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <DemoBanner />
    </div>
  );
}
