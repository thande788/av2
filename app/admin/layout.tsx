import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/sidebar';

export const metadata = {
  title: 'Admin Dashboard | Angel Touch Homecare',
  description: 'Admin dashboard for managing applications, contacts, and content.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Optional: Check if user has admin role
  // const user = await clerkClient.users.getUser(userId);
  // if (!user.publicMetadata.isAdmin) redirect('/');

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
