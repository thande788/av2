import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertTriangle, ArrowLeft, CheckCircle2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getAllPortalUsersWithRoleDiagnostics,
  getCurrentAdminRole,
  type PortalUserRoleDiagnostic,
} from '@/app/actions/rbac';

export const metadata = {
  title: 'All Portal Users',
  description: 'View all portal users and role metadata diagnostics',
};

function mismatchBadge(user: PortalUserRoleDiagnostic) {
  if (user.mismatchType === 'none') {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
        <CheckCircle2 className="mr-1 size-3" />
        Synced
      </Badge>
    );
  }

  const labels: Record<Exclude<PortalUserRoleDiagnostic['mismatchType'], 'none'>, string> = {
    'missing-clerk-user': 'Missing in Clerk',
    'missing-clerk-role': 'Missing Clerk role',
    'role-mismatch': 'Role mismatch',
  };

  return (
    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
      <AlertTriangle className="mr-1 size-3" />
      {labels[user.mismatchType as Exclude<PortalUserRoleDiagnostic['mismatchType'], 'none'>]}
    </Badge>
  );
}

export default async function AllUsersPage() {
  const currentRole = await getCurrentAdminRole();

  if (currentRole !== 'SUPER_ADMIN') {
    redirect('/admin');
  }

  const users = await getAllPortalUsersWithRoleDiagnostics();
  const mismatchedCount = users.filter((user) => user.mismatchType !== 'none').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Portal Users</h1>
          <p className="text-muted-foreground">
            Includes admin, manager, caregiver, and client accounts with Clerk role diagnostics.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 size-4" />
            Back to Admin Users
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Portal Users</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <span className="text-3xl font-bold tracking-tight">{users.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Role Metadata Mismatches</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-600" />
            <span className="text-3xl font-bold tracking-tight">{mismatchedCount}</span>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/50">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">DB Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Clerk Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Diagnostic</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {users.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-muted/20">
                <td className="px-4 py-3 text-sm">
                  <Link href={`/admin/users/all/${user.id}`} className="font-medium text-primary hover:underline">
                    {user.firstName} {user.lastName}
                  </Link>
                  <p className="text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Username: {user.clerkUsername || 'none'}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge variant="outline">{user.role}</Badge>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge variant="secondary">{user.clerkRole || 'none'}</Badge>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge variant="outline">{user.status}</Badge>
                </td>
                <td className="px-4 py-3 text-sm">{mismatchBadge(user)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
