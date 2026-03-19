import { getAdminUsers, getCurrentAdminRole } from '@/app/actions/rbac';
import { redirect } from 'next/navigation';
import { UsersManagement } from './users-management';

export const metadata = {
  title: 'User Management | Admin Dashboard',
  description: 'Manage admin users and roles',
};

export default async function UsersPage() {
  const currentRole = await getCurrentAdminRole();

  // Only Super Admins can access user management
  if (currentRole !== 'SUPER_ADMIN') {
    redirect('/admin');
  }

  const users = await getAdminUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage admin users, roles, and permissions
        </p>
      </div>

      <UsersManagement users={users} />
    </div>
  );
}
