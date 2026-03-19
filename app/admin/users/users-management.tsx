'use client';

import { useState } from 'react';
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
import {
  updateUserAdminRole,
  inviteAdminUser,
  deactivateAdminUser,
  reactivateAdminUser,
} from '@/app/actions/rbac';
import { ROLE_PERMISSIONS, type AdminRole } from '@/lib/rbac';
import { toast } from 'sonner';
import {
  UserPlus,
  Shield,
  ShieldCheck,
  Edit,
  Pencil,
  UserX,
  UserCheck,
  Crown,
  Eye,
  Briefcase,
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

export function UsersManagement({ users }: { users: AdminUser[] }) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {users.length} admin {users.length === 1 ? 'user' : 'users'}
          </Badge>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 size-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <InviteDialog onClose={() => { setInviteOpen(false); router.refresh(); }} />
        </Dialog>
      </div>

      {/* Role Legend */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-border/50 bg-muted/20 p-4">
        <span className="text-sm font-medium text-muted-foreground">Roles:</span>
        {(Object.keys(roleLabels) as AdminRole[]).map((role) => {
          const Icon = roleIcons[role];
          const perms = ROLE_PERMISSIONS[role];
          const permCount = perms.includes('*') ? 'Full access' : `${perms.length} permissions`;
          return (
            <div key={role} className="flex items-center gap-1.5">
              <Badge className={roleColors[role]} variant="secondary">
                <Icon className="mr-1 size-3" />
                {roleLabels[role]}
              </Badge>
              <span className="text-xs text-muted-foreground">({permCount})</span>
            </div>
          );
        })}
      </div>

      {/* Users Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => {
          const RoleIcon = roleIcons[user.adminRole];
          return (
            <div
              key={user.id}
              className="relative overflow-hidden rounded-xl border p-5 transition-all hover:shadow-md border-border/50 bg-card"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative space-y-4">
                {/* User Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="font-semibold">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge className={statusColors[user.status]} variant="secondary">
                    {user.status}
                  </Badge>
                </div>

                {/* Role */}
                <div className="flex items-center gap-2">
                  <Badge className={roleColors[user.adminRole]} variant="secondary">
                    <RoleIcon className="mr-1 size-3" />
                    {roleLabels[user.adminRole]}
                  </Badge>
                </div>

                {/* Meta */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Joined: {formatDateUS(user.createdAt)}</p>
                  {user.lastLoginAt && (
                    <p>Last login: {formatDateUS(user.lastLoginAt)}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                  <Dialog
                    open={editingUser?.id === user.id}
                    onOpenChange={(open) => !open && setEditingUser(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                      >
                        <Pencil className="mr-1 size-3.5" />
                        Edit Role
                      </Button>
                    </DialogTrigger>
                    {editingUser?.id === user.id && (
                      <EditRoleDialog
                        user={editingUser}
                        onClose={() => { setEditingUser(null); router.refresh(); }}
                      />
                    )}
                  </Dialog>

                  {user.status === 'ACTIVE' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-500/10"
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
                      <UserX className="mr-1 size-3.5" />
                      Deactivate
                    </Button>
                  ) : user.status === 'INACTIVE' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
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
                      <UserCheck className="mr-1 size-3.5" />
                      Reactivate
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {users.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 p-12 text-center">
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
            placeholder="jane@angeltouchhomecare.com"
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
