'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, type Column } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDateUS } from '@/lib/utils';
import type { Testimonial } from '@prisma/client';
import { updateTestimonialStatus, deleteTestimonial } from './actions';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  UserCircle,
  ShieldCheck,
  Video,
  Search,
} from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: typeof Clock }
> = {
  REQUESTED: {
    label: 'Requested',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: Clock,
  },
  SUBMITTED: {
    label: 'Submitted',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    icon: Clock,
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    icon: Search,
  },
  PUBLISHED: {
    label: 'Published',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: CheckCircle,
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: XCircle,
  },
};

export function TestimonialsTable({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (
    id: string,
    status: 'SUBMITTED' | 'UNDER_REVIEW' | 'PUBLISHED' | 'REJECTED'
  ) => {
    await updateTestimonialStatus(id, status);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteTestimonial(deleteId);
      router.refresh();
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: Column<Testimonial>[] = [
    {
      key: 'name',
      header: 'Name',
      mobileTitle: true,
      render: (t) => (
        <div className="flex items-center gap-2">
          <div>
            <p className="font-medium">{t.name}</p>
            {t.role && <p className="text-sm text-muted-foreground">{t.role}</p>}
          </div>
          {t.videoUrl && (
            <Video className="size-4 text-primary shrink-0" />
          )}
        </div>
      ),
    },
    {
      key: 'submittedById',
      header: 'Source',
      render: (t) =>
        t.submittedById ? (
          <Badge variant="outline" className="text-xs gap-1">
            <UserCircle className="size-3" />
            Client Portal
          </Badge>
        ) : t.requestEmail ? (
          <Badge variant="outline" className="text-xs gap-1 border-blue-300">
            <Clock className="size-3" />
            Requested
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs gap-1">
            <ShieldCheck className="size-3" />
            Admin
          </Badge>
        ),
    },
    {
      key: 'content',
      header: 'Testimonial',
      className: 'max-w-md',
      hideOnMobile: true,
      render: (t) => (
        <p className="truncate text-muted-foreground">
          {t.content || <span className="italic">Awaiting response...</span>}
        </p>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (t) =>
        t.rating ? (
          <div className="flex items-center gap-1">
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star
                key={i}
                className="size-4 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => {
        const config = STATUS_CONFIG[t.status] || STATUS_CONFIG.SUBMITTED;
        const StatusIcon = config.icon;
        return (
          <Badge className={`${config.className} gap-1`}>
            <StatusIcon className="size-3" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      hideOnMobile: true,
      render: (t) => formatDateUS(t.createdAt),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (t) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/testimonials/${t.id}`}>
                <Edit className="size-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {t.status !== 'UNDER_REVIEW' && (
              <DropdownMenuItem
                onClick={() => handleStatusChange(t.id, 'UNDER_REVIEW')}
              >
                <Search className="size-4 mr-2" />
                Mark Under Review
              </DropdownMenuItem>
            )}
            {t.status !== 'PUBLISHED' && (
              <DropdownMenuItem
                onClick={() => handleStatusChange(t.id, 'PUBLISHED')}
              >
                <Eye className="size-4 mr-2" />
                Publish
              </DropdownMenuItem>
            )}
            {t.status !== 'REJECTED' && (
              <DropdownMenuItem
                onClick={() => handleStatusChange(t.id, 'REJECTED')}
              >
                <XCircle className="size-4 mr-2" />
                Reject
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteId(t.id)}
            >
              <Trash2 className="size-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={testimonials}
        columns={columns}
        searchKeys={['name', 'content']}
        emptyMessage="No testimonials yet. Add your first testimonial."
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Requested', value: 'REQUESTED' },
              { label: 'Submitted', value: 'SUBMITTED' },
              { label: 'Under Review', value: 'UNDER_REVIEW' },
              { label: 'Published', value: 'PUBLISHED' },
              { label: 'Rejected', value: 'REJECTED' },
            ],
          },
        ]}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              testimonial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
