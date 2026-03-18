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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import type { Testimonial } from '@prisma/client';
import { togglePublishStatus, deleteTestimonial } from './actions';
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff, Star, UserCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function TestimonialsTable({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    await togglePublishStatus(id, !currentStatus);
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
        <div>
          <p className="font-medium">{t.name}</p>
          {t.role && <p className="text-sm text-muted-foreground">{t.role}</p>}
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
        <p className="truncate text-muted-foreground">{t.content}</p>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (t) => (
        <div className="flex items-center gap-1">
          {Array.from({ length: t.rating || 5 }).map((_, i) => (
            <Star
              key={i}
              className="size-4 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>
      ),
    },
    {
      key: 'isPublished',
      header: 'Status',
      render: (t) =>
        t.isPublished ? (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Published
          </Badge>
        ) : (
          <Badge variant="secondary">Draft</Badge>
        ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      hideOnMobile: true,
      render: (t) => format(t.createdAt, 'MMM d, yyyy'),
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
            <DropdownMenuItem
              onClick={() => handleTogglePublish(t.id, t.isPublished)}
            >
              {t.isPublished ? (
                <>
                  <EyeOff className="size-4 mr-2" />
                  Unpublish
                </>
              ) : (
                <>
                  <Eye className="size-4 mr-2" />
                  Publish
                </>
              )}
            </DropdownMenuItem>
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
