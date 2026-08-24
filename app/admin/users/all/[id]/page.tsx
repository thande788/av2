import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPortalUserById } from '@/app/actions/rbac';
import { UserDetailEditor } from './user-detail-editor';

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  const user = await getPortalUserById(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Details</h1>
          <p className="text-muted-foreground">Review and update core portal profile settings.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/users/all">
            <ArrowLeft className="mr-2 size-4" />
            Back to All Users
          </Link>
        </Button>
      </div>

      <UserDetailEditor user={user} />
    </div>
  );
}
