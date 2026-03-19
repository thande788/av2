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
import type { FAQ } from '@prisma/client';
import { toggleFAQPublished, deleteFAQ } from './actions';
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export function FAQsTable({ faqs }: { faqs: FAQ[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    await toggleFAQPublished(id, !currentStatus);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteFAQ(deleteId);
      router.refresh();
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: Column<FAQ>[] = [
    {
      key: 'sortOrder',
      header: '#',
      sortable: true,
      className: 'w-16',
      render: (f) => (
        <span className="text-muted-foreground font-mono text-xs">{f.sortOrder}</span>
      ),
    },
    {
      key: 'question',
      header: 'Question',
      mobileTitle: true,
      render: (f) => (
        <p className="font-medium line-clamp-2">{f.question}</p>
      ),
    },
    {
      key: 'answer',
      header: 'Answer',
      hideOnMobile: true,
      className: 'max-w-sm',
      render: (f) => (
        <p className="truncate text-muted-foreground">{f.answer}</p>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (f) =>
        f.category ? (
          <Badge variant="outline" className="text-xs">
            {f.category}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      key: 'isPublished',
      header: 'Status',
      render: (f) =>
        f.isPublished ? (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Published
          </Badge>
        ) : (
          <Badge variant="secondary">Draft</Badge>
        ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (f) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/faqs/${f.id}`}>
                <Edit className="size-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleTogglePublish(f.id, f.isPublished)}
            >
              {f.isPublished ? (
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
              onClick={() => setDeleteId(f.id)}
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
        data={faqs}
        columns={columns}
        searchKeys={['question', 'answer', 'category']}
        emptyMessage="No FAQs yet. Add your first FAQ."
        filters={[
          {
            key: 'isPublished',
            label: 'Status',
            options: [
              { label: 'Published', value: 'true' },
              { label: 'Draft', value: 'false' },
            ],
          },
        ]}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the FAQ.
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
