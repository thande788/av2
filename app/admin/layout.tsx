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
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl py-8 px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
