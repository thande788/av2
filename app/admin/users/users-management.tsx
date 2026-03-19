'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  updateUserAdminRole,
  inviteAdminUser,
  deactivateAdminUser,
  reactivateAdminUser,
  revokeInvitation,
  resendInvitation,
  type ClerkInvitation,
} from '@/app/actions/rbac';
import { ROLE_PERMISSIONS, type AdminRole } from '@/lib/rbac';
import { toast } from 'sonner';
import {
  UserPlus,
  Shield,
  Search,
  Pencil,
  UserX,
  UserCheck,
  Crown,
  Eye,
  Briefcase,
  Edit,
  Mail,
  Clock,
  CalendarDays,
  ShieldCheck,
  Send,
  XCircle,
  RotateCw,
  CheckCircle2,
} from 'lucide-react';
import { cn, formatDateUS } from '@/lib/utils';
import type { PortalUser, UserStatus } from '@prisma/client';

type AdminUser = PortalUser & { adminRole: AdminRole };

const roleLabels: Record<AdminRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  HR_MANAGER: 'HR Manager',
  CONTENT_MANAGER: 'Content Manager',
  VIEWER: 'Viewer',
};

const roleIcons: Record<AdminRole, React.ComponentType<{ className?: string }>> = {
  SUPER_ADMIN: Crown,
  HR_MANAGER: Briefcase,
  CONTENT_MANAGER: Edit,
  VIEWER: Eye,
};

const roleColors: Record<AdminRole, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  HR_MANAGER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  CONTENT_MANAGER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  VIEWER: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const statusColors: Record<UserStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  INACTIVE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  TERMINATED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const avatarColors = [
  'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500',
  'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500',
];

function getInitials(firstName: string | null, lastName: string | null) {
  return `${(firstName || '?')[0]}${(lastName || '?')[0]}`.toUpperCase();
}

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function UsersManagement({ users, invitations }: { users: AdminUser[]; invitations: ClerkInvitation[] }) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'INACTIVE'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | AdminRole>('all');

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (roleFilter !== 'all' && u.adminRole !== roleFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
        return fullName.includes(q) || u.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [users, statusFilter, roleFilter, search]);

  const roleSummary = useMemo(
    () =>
      (Object.keys(roleLabels) as AdminRole[]).map((role) => ({
        role,
        count: users.filter((user) => user.adminRole === role).length,
      })),
    [users]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/50 bg-card p-4 sm:p-5 md:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
              </div>
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {(Object.keys(roleLabels) as AdminRole[]).map((r) => (
                    <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <UserPlus className="mr-2 size-4" />
                  Invite User
                </Button>
              </DialogTrigger>
              <InviteDialog onClose={() => { setInviteOpen(false); router.refresh(); }} />
            </Dialog>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {roleSummary.map(({ role, count }) => {
              const Icon = roleIcons[role];
              const permissions = ROLE_PERMISSIONS[role];
              return (
                <div
                  key={role}
                  className="rounded-xl border border-border/50 bg-muted/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{roleLabels[role]}</p>
                      <p className="text-xs text-muted-foreground">
                        {permissions.includes('*') ? 'Full access' : `${permissions.length} permissions`}
                      </p>
                    </div>
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="size-4 text-primary" />
                    </div>
                  </div>
                  <p className="mt-3 text-2xl font-bold tracking-tight">{count}</p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <TabsList className="bg-transparent border border-border">
                <TabsTrigger value="all">
                  All
                  <Badge variant="secondary" className="ml-2 text-xs">{users.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="ACTIVE">
                  Active
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {users.filter((u) => u.status === 'ACTIVE').length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="INACTIVE">
                  Inactive
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {users.filter((u) => u.status === 'INACTIVE').length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Showing <span className="font-medium text-foreground">{filtered.length}</span> of{' '}
              <span className="font-medium text-foreground">{users.length}</span> admin users
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
        {filtered.map((user) => {
          const RoleIcon = roleIcons[user.adminRole];
          const initials = getInitials(user.firstName, user.lastName);
          const avatarBg = getAvatarColor(`${user.firstName}${user.lastName}`);
          return (
            <div
              key={user.id}
              className={cn(
                'relative overflow-hidden rounded-2xl border p-6 transition-all hover:shadow-md',
                user.status === 'ACTIVE'
                  ? 'border-border/50 bg-card'
                  : 'border-border/30 bg-muted/30 opacity-75',
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative space-y-4">
                {/* Header: Avatar + Info + Actions */}
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm',
                    avatarBg,
                  )}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      <Badge className={cn(statusColors[user.status], 'text-[10px] px-1.5 py-0')} variant="secondary">
                        {user.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                      <Mail className="size-3 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                  <Badge className={cn(statusColors[user.status], 'shrink-0 text-[10px] px-2 py-1')} variant="secondary">
                    {user.status}
                  </Badge>
                </div>

                {/* Role Badge + Permissions */}
                <div className="space-y-2">
                  <Badge className={roleColors[user.adminRole]} variant="secondary">
                    <RoleIcon className="mr-1 size-3" />
                    {roleLabels[user.adminRole]}
                  </Badge>
                  <div className="flex flex-wrap gap-1">
                    {ROLE_PERMISSIONS[user.adminRole].includes('*') ? (
                      <span className="text-[10px] rounded bg-purple-100/50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5">
                        Full access
                      </span>
                    ) : (
                      ROLE_PERMISSIONS[user.adminRole].slice(0, 4).map((perm) => (
                        <span
                          key={perm}
                          className="text-[10px] rounded bg-muted px-1.5 py-0.5 text-muted-foreground"
                        >
                          {perm}
                        </span>
                      ))
                    )}
                    {!ROLE_PERMISSIONS[user.adminRole].includes('*') &&
                      ROLE_PERMISSIONS[user.adminRole].length > 4 && (
                        <span className="text-[10px] rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                          +{ROLE_PERMISSIONS[user.adminRole].length - 4} more
                        </span>
                      )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid gap-2 border-t border-border/30 pt-3 text-xs text-muted-foreground sm:grid-cols-2">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="size-3" />
                    <span>Joined {formatDateUS(user.createdAt)}</span>
                  </div>
                  {user.lastLoginAt && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3" />
                      <span>Last login {formatDateUS(user.lastLoginAt)}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 border-t border-border/30 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingUser(user)}
                  >
                    <Pencil className="mr-1.5 size-3.5" />
                    Edit Role
                  </Button>
                  {user.status === 'ACTIVE' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-500/10 hover:text-red-700"
                      onClick={async () => {
                        try {
                          await deactivateAdminUser(user.clerkId);
                          toast.success(`${user.firstName} deactivated`);
                          router.refresh();
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : 'Failed to deactivate');
                        }
                      }}
                    >
                      <UserX className="mr-1.5 size-3.5" />
                      Deactivate
                    </Button>
                  ) : user.status === 'INACTIVE' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                      onClick={async () => {
                        try {
                          await reactivateAdminUser(user.clerkId);
                          toast.success(`${user.firstName} reactivated`);
                          router.refresh();
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : 'Failed to reactivate');
                        }
                      }}
                    >
                      <UserCheck className="mr-1.5 size-3.5" />
                      Reactivate
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Invitations Section */}
      <InvitationsSection invitations={invitations} />

      {/* Edit Role Dialog */}
      <Dialog
        open={editingUser !== null}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        {editingUser && (
          <EditRoleDialog
            user={editingUser}
            onClose={() => { setEditingUser(null); router.refresh(); }}
          />
        )}
      </Dialog>

      {/* Empty States */}
      {filtered.length === 0 && users.length > 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 p-12 text-center">
          <Search className="size-10 text-muted-foreground/30 mb-3" />
          <h3 className="text-lg font-semibold">No matching users</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filters.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => { setSearch(''); setStatusFilter('all'); setRoleFilter('all'); }}
          >
            Clear filters
          </Button>
        </div>
      )}

      {users.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 p-12 text-center">
          <Shield className="size-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold">No admin users found</h3>
          <p className="text-sm text-muted-foreground">
            Invite team members to get started.
          </p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Invite Dialog
// =============================================================================

function InviteDialog({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<AdminRole>('VIEWER');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !firstName || !lastName) {
      toast.error('All fields are required');
      return;
    }

    setLoading(true);
    try {
      await inviteAdminUser(email, firstName, lastName, role);
      toast.success(`Invitation sent to ${email}`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Invite Admin User</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="inv-first">First Name</Label>
            <Input
              id="inv-first"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jane"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inv-last">Last Name</Label>
            <Input
              id="inv-last"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="inv-email">Email Address</Label>
          <Input
            id="inv-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@angeltouch.services"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inv-role">Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as AdminRole)}>
            <SelectTrigger id="inv-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(roleLabels) as AdminRole[]).map((r) => (
                <SelectItem key={r} value={r}>
                  {roleLabels[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Permission Preview */}
        <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Permissions for {roleLabels[role]}:
          </p>
          <div className="flex flex-wrap gap-1">
            {ROLE_PERMISSIONS[role].includes('*') ? (
              <Badge variant="secondary" className="text-xs">Full access</Badge>
            ) : (
              ROLE_PERMISSIONS[role].map((perm) => (
                <Badge key={perm} variant="outline" className="text-[10px]">{perm}</Badge>
              ))
            )}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Sending...' : 'Send Invitation'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// =============================================================================
// Edit Role Dialog
// =============================================================================

function EditRoleDialog({
  user,
  onClose,
}: {
  user: AdminUser;
  onClose: () => void;
}) {
  const [role, setRole] = useState<AdminRole>(user.adminRole);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (role === user.adminRole) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      await updateUserAdminRole(user.clerkId, role);
      toast.success(`${user.firstName}'s role updated to ${roleLabels[role]}`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          Edit Role — {user.firstName} {user.lastName}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="edit-role">Admin Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as AdminRole)}>
            <SelectTrigger id="edit-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(roleLabels) as AdminRole[]).map((r) => (
                <SelectItem key={r} value={r}>
                  {roleLabels[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Permission Preview */}
        <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Permissions for {roleLabels[role]}:
          </p>
          <div className="flex flex-wrap gap-1">
            {ROLE_PERMISSIONS[role].includes('*') ? (
              <Badge variant="secondary" className="text-xs">Full access</Badge>
            ) : (
              ROLE_PERMISSIONS[role].map((perm) => (
                <Badge key={perm} variant="outline" className="text-[10px]">{perm}</Badge>
              ))
            )}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// =============================================================================
// Invitations Section
// =============================================================================

const invitationStatusConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  accepted: { label: 'Accepted', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
  revoked: { label: 'Revoked', icon: XCircle, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};

function InvitationsSection({ invitations }: { invitations: ClerkInvitation[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'revoked'>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return invitations;
    return invitations.filter((inv) => inv.status === filter);
  }, [invitations, filter]);

  const pendingCount = invitations.filter((i) => i.status === 'pending').length;

  const handleRevoke = async (id: string) => {
    setLoadingId(id);
    try {
      await revokeInvitation(id);
      toast.success('Invitation revoked');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to revoke');
    } finally {
      setLoadingId(null);
    }
  };

  const handleResend = async (id: string) => {
    setLoadingId(id);
    try {
      await resendInvitation(id);
      toast.success('Invitation resent');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend');
    } finally {
      setLoadingId(null);
    }
  };

  if (invitations.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Send className="size-4 text-primary" />
          <h3 className="text-lg font-semibold tracking-tight">Invitations</h3>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {pendingCount} pending
            </Badge>
          )}
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="bg-transparent border border-border">
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-1.5 text-xs">{invitations.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="revoked">Revoked</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/50">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">Sent</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map((inv) => {
              const statusInfo = invitationStatusConfig[inv.status] ?? invitationStatusConfig.pending;
              const StatusIcon = statusInfo.icon;
              const assignedRole = inv.publicMetadata?.adminRole as string | undefined;
              const isLoading = loadingId === inv.id;

              return (
                <tr key={inv.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate max-w-[200px]">{inv.emailAddress}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm hidden sm:table-cell">
                    {assignedRole && assignedRole in roleLabels ? (
                      <Badge className={roleColors[assignedRole as AdminRole]} variant="secondary">
                        {roleLabels[assignedRole as AdminRole]}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                    {formatDateUS(new Date(inv.createdAt))}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge className={cn(statusInfo.color, 'gap-1')} variant="secondary">
                      <StatusIcon className="size-3" />
                      {statusInfo.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {inv.status === 'pending' && (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isLoading}
                          onClick={() => handleResend(inv.id)}
                          className="text-primary hover:text-primary"
                        >
                          <RotateCw className={cn('mr-1 size-3.5', isLoading && 'animate-spin')} />
                          Resend
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isLoading}
                          onClick={() => handleRevoke(inv.id)}
                          className="text-red-600 hover:bg-red-500/10 hover:text-red-700"
                        >
                          <XCircle className="mr-1 size-3.5" />
                          Revoke
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 p-8 text-center">
          <Mail className="size-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No {filter === 'all' ? '' : filter} invitations found.</p>
        </div>
      )}
    </div>
  );
}
