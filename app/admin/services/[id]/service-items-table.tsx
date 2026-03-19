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
import { toggleServiceItemActive, deleteServiceItem } from '../actions';
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type ServiceItemData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  features: string[];
  icon: string;
  priceFrom: number | null;
  sortOrder: number;
  isActive: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

export function ServiceItemsTable({
  items,
  categoryId,
}: {
  items: ServiceItemData[];
  categoryId: string;
}) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleActive = async (id: string, current: boolean) => {
    await toggleServiceItemActive(id, !current);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteServiceItem(deleteId);
      router.refresh();
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
        <p className="text-muted-foreground mb-4">No services in this category yet.</p>
        <Button asChild>
          <Link href={`/admin/services/${categoryId}/items/new`}>
            Add your first service
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground w-12">#</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Service</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Features</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Price</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    'border-b border-border/30 last:border-0 transition-colors hover:bg-accent/30',
                    !item.isActive && 'opacity-60'
                  )}
                >
                  <td className="py-3 px-4 text-sm text-muted-foreground font-mono">
                    {item.sortOrder}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded bg-primary/10 p-1.5">
                        {getServiceIcon(item.icon, 'size-4 text-primary')}
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {item.features.slice(0, 3).map((f) => (
                        <Badge key={f} variant="outline" className="text-xs">
                          {f}
                        </Badge>
                      ))}
                      {item.features.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.features.length - 3}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {item.priceFrom ? `$${item.priceFrom}/hr` : '—'}
                  </td>
                  <td className="py-3 px-4">
                    {item.isActive ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/services/${categoryId}/items/${item.id}`}>
                              <Edit className="size-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(item.id, item.isActive)}
                          >
                            {item.isActive ? (
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
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="size-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service?</AlertDialogTitle>
            <AlertDialogDescription>
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
