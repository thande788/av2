import { getAdminUsers, getCurrentAdminRole, getInvitations } from '@/app/actions/rbac';
import { redirect } from 'next/navigation';
import { UsersManagement } from './users-management';
import { StatCard } from '@/components/admin/stat-card';
import {
  Users,
  ShieldCheck,
  UserX,
  Crown,
  Briefcase,
  Edit,
  Eye,
  Shield,
  Sparkles,
} from 'lucide-react';
import type { AdminRole } from '@/lib/rbac';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'User Management',
  description: 'Manage admin users and roles',
};

const roleStatConfig: Record<AdminRole, { label: string; icon: typeof Crown }> = {
  SUPER_ADMIN: { label: 'Super Admins', icon: Crown },
  HR_MANAGER: { label: 'HR Managers', icon: Briefcase },
  CONTENT_MANAGER: { label: 'Content Managers', icon: Edit },
  VIEWER: { label: 'Viewers', icon: Eye },
};

export default async function UsersPage() {
  const currentRole = await getCurrentAdminRole();

  if (currentRole !== 'SUPER_ADMIN') {
    redirect('/admin');
  }

  const [users, invitations] = await Promise.all([
    getAdminUsers(),
    getInvitations(),
  ]);

  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const inactiveCount = users.filter((u) => u.status === 'INACTIVE').length;
  const roleCounts = users.reduce<Record<AdminRole, number>>(
    (acc, u) => {
      acc[u.adminRole] = (acc[u.adminRole] || 0) + 1;
      return acc;
    },
    { SUPER_ADMIN: 0, HR_MANAGER: 0, CONTENT_MANAGER: 0, VIEWER: 0 }
  );

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-primary/40 bg-primary/5 p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/80 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
              <Shield className="size-3.5" />
              Super Admin controls
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                User Management
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Control admin access, assign operational responsibility, and keep
                role coverage balanced across recruiting, content, and oversight.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/users/all">View All Portal Users</Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
            <div className="rounded-xl border border-border/50 bg-background/80 p-4 backdrop-blur">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="size-4 text-primary" />
                Access posture
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight">{users.length}</p>
              <p className="text-xs text-muted-foreground">
                admin accounts under active governance
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/80 p-4 backdrop-blur">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Crown className="size-4 text-primary" />
                Role coverage
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight">
                {Object.values(roleCounts).filter((c) => c > 0).length}/4
              </p>
              <p className="text-xs text-muted-foreground">
                admin roles currently assigned
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Overview</h2>
          <p className="text-sm text-muted-foreground">
            High-level access and account health across the admin team.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Admins"
          value={users.length}
          icon={Users}
          description={`${activeCount} active, ${inactiveCount} inactive`}
        />
        <StatCard
          title="Active Users"
          value={activeCount}
          icon={ShieldCheck}
        />
        <StatCard
          title="Inactive Users"
          value={inactiveCount}
          icon={UserX}
        />
        <StatCard
          title="Roles in Use"
          value={Object.values(roleCounts).filter((c) => c > 0).length}
          icon={Crown}
          description={`of 4 available`}
        />
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Role Distribution</h2>
          <p className="text-sm text-muted-foreground">
            Keep permissions deliberate and avoid concentrating operational access in a single role.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(roleStatConfig) as AdminRole[]).map((role) => {
          const { label, icon: Icon } = roleStatConfig[role];
          const count = roleCounts[role];
          return (
            <div
              key={role}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 transition-colors hover:bg-muted/30"
            >
              <div className="rounded-lg bg-primary/10 p-2">
                <Icon className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{count}</p>
              </div>
            </div>
          );
        })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Team Directory</h2>
          <p className="text-sm text-muted-foreground">
            Search, filter, invite, and update admin accounts from a single workspace.
          </p>
        </div>
        <UsersManagement users={users} invitations={invitations} />
      </section>
    </div>
  );
}
