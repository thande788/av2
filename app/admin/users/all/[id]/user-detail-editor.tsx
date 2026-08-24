'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconLoader2 } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updatePortalUserProfile } from '@/app/actions/rbac';

interface UserDetail {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'CAREGIVER' | 'CLIENT';
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'TERMINATED';
  clerkRole: string | null;
  clerkUsername: string | null;
  worker: { id: string } | null;
  client: { id: string } | null;
}

export function UserDetailEditor({ user }: { user: UserDetail }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [role, setRole] = useState<UserDetail['role']>(user.role);
  const [status, setStatus] = useState<UserDetail['status']>(user.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isDirty =
    firstName.trim() !== user.firstName ||
    lastName.trim() !== user.lastName ||
    role !== user.role ||
    status !== user.status;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updatePortalUserProfile({
        id: user.id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        status,
      });

      setSuccess('User profile updated.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={lastName} onChange={(event) => setLastName(event.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserDetail['role'])}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="MANAGER">MANAGER</SelectItem>
                  <SelectItem value="CAREGIVER">CAREGIVER</SelectItem>
                  <SelectItem value="CLIENT">CLIENT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as UserDetail['status'])}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                  <SelectItem value="TERMINATED">TERMINATED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={!isDirty || saving}>
              {saving && <IconLoader2 className="mr-2 size-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identity Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Clerk User ID</p>
            <p className="font-mono text-xs">{user.clerkId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Username</p>
            <Badge variant="secondary">{user.clerkUsername || 'none'}</Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Clerk Metadata Role</p>
            <Badge variant="secondary">{user.clerkRole || 'none'}</Badge>
          </div>

          {user.worker && (
            <div>
              <p className="text-muted-foreground">Worker Profile</p>
              <Button asChild variant="link" className="h-auto px-0">
                <Link href={`/admin/workers/${user.worker.id}`}>Open worker detail</Link>
              </Button>
            </div>
          )}

          {user.client && (
            <div>
              <p className="text-muted-foreground">Client Profile</p>
              <Button asChild variant="link" className="h-auto px-0">
                <Link href={`/admin/clients/${user.client.id}`}>Open client detail</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
