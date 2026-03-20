import type { Metadata } from 'next';
import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { AdminSidebarShell } from '@/components/admin/sidebar-shell';
import { DemoBanner } from '@/components/demo/demo-banner';
import { LogoWatermark } from '@/components/shared/logo-watermark';
import { Toaster } from '@/components/ui/sonner';
import { CommandPalette } from '@/components/admin/command-palette';
import { AdminShortcuts } from '@/components/admin/keyboard-shortcuts';
import { OnboardingGate } from '@/components/shared/onboarding-gate';
import { adminOnboardingSteps } from '@/components/shared/onboarding-steps';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | Admin Dashboard',
  },
  description: 'Admin dashboard for managing applications, contacts, and content.',
};

/**
 * Check if user is an admin/manager via Clerk metadata or database
 * Also creates PortalUser record on-demand for admin users
 */
async function isAdmin(userId: string): Promise<boolean> {
  // Check Clerk publicMetadata first
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = (user.publicMetadata as { role?: string })?.role;
    if (role === 'admin' || role === 'manager') {
      // Ensure PortalUser exists for admin
      await ensureAdminPortalUser(userId);
      return true;
    }
  } catch {
    // Continue to database check
  }

  // Check database PortalUser role
  const portalUser = await db.portalUser.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  return portalUser?.role === 'ADMIN' || portalUser?.role === 'MANAGER';
}

/**
 * Create PortalUser record for admin if it doesn't exist
 */
async function ensureAdminPortalUser(clerkId: string): Promise<void> {
  const existing = await db.portalUser.findUnique({
    where: { clerkId },
  });

  if (!existing) {
    const user = await currentUser();
    if (user) {
      const primaryEmail = user.emailAddresses.find(
        e => e.id === user.primaryEmailAddressId
      )?.emailAddress || user.emailAddresses[0]?.emailAddress;

      if (primaryEmail) {
        await db.portalUser.create({
          data: {
            clerkId,
            email: primaryEmail,
            firstName: user.firstName || 'Admin',
            lastName: user.lastName || 'User',
            role: 'ADMIN',
            status: 'ACTIVE',
          },
        });
      }
    }
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Verify admin/manager role
  const hasAdminAccess = await isAdmin(userId);
  if (!hasAdminAccess) {
    redirect('/employee');
  }

  return (
    <div className="flex min-h-screen flex-col bg-background lg:h-screen lg:overflow-hidden lg:flex-row">
      <AdminSidebarShell />
      <main className="relative min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        <LogoWatermark />
        <div className="relative z-10 mx-auto w-full max-w-[160rem] px-5 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-10 lg:py-10">
          <OnboardingGate steps={adminOnboardingSteps} portalName="Admin" accentColor="primary">
            {children}
          </OnboardingGate>
        </div>
      </main>
      <DemoBanner />
      <CommandPalette />
      <AdminShortcuts />
      <Toaster position="top-right" richColors />
    </div>
  );
}
