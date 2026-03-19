'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { getServiceIcon } from '@/lib/icons';
import { toggleCategoryActive, deleteServiceCategory } from './actions';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type CategoryWithCount = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: { services: number };
};

export function ServicesTable({
  categories,
}: {
  categories: CategoryWithCount[];
}) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleActive = async (id: string, current: boolean) => {
    await toggleCategoryActive(id, !current);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteServiceCategory(deleteId);
      router.refresh();
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
        <p className="text-muted-foreground mb-4">No service categories yet.</p>
        <Button asChild>
          <Link href="/admin/services/new">Create your first category</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className={cn(
              'relative overflow-hidden rounded-xl border p-5 transition-all hover:shadow-md',
              category.isActive
                ? 'border-primary/40 bg-primary/5 hover:bg-primary/10'
                : 'border-border/50 bg-muted/30 opacity-70'
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative flex items-center gap-4">
              {/* Icon */}
              <div className="rounded-lg bg-primary/10 p-3 shrink-0">
                {getServiceIcon(category.icon, 'size-6 text-primary')}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  {category.isActive ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {category.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Layers className="size-3.5" />
                    {category._count.services} service{category._count.services !== 1 ? 's' : ''}
                  </span>
                  <span>Order: {category.sortOrder}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/services/${category.id}`}>
                    Manage
                    <ChevronRight className="size-4 ml-1" />
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/services/${category.id}/edit`}>
                        <Edit className="size-4 mr-2" />
                        Edit Category
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleToggleActive(category.id, category.isActive)
                      }
                    >
                      {category.isActive ? (
                        <>
                          <EyeOff className="size-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="size-4 mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteId(category.id)}
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category and all its services.
              This action cannot be undone.
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
