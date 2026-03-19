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
    <div className="flex min-h-screen flex-col bg-background lg:h-screen lg:overflow-hidden lg:flex-row">
      <ClientSidebar />
      <main className="relative min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        <LogoWatermark />
        <div className="relative z-10 mx-auto w-full max-w-[160rem] px-5 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
      <DemoBanner />
    </div>
  );
}
