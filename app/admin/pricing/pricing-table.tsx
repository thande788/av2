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
import { togglePricingTierActive, deletePricingTier } from './actions';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  DollarSign,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type PricingTierRow = {
  id: string;
  slug: string;
  title: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  ctaText: string | null;
  ctaHref: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const periodLabels: Record<string, string> = {
  hour: '/hr',
  day: '/day',
  week: '/wk',
  month: '/mo',
};

export function PricingTable({ tiers }: { tiers: PricingTierRow[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleActive = async (id: string, current: boolean) => {
    await togglePricingTierActive(id, !current);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deletePricingTier(deleteId);
      router.refresh();
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  if (tiers.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
        <p className="text-muted-foreground mb-4">No pricing tiers yet.</p>
        <Button asChild>
          <Link href="/admin/pricing/new">Create your first pricing tier</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={cn(
              'relative overflow-hidden rounded-xl border p-5 transition-all hover:shadow-md',
              tier.isActive
                ? 'border-primary/40 bg-primary/5 hover:bg-primary/10'
                : 'border-border/50 bg-muted/30 opacity-70'
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative flex items-center gap-4">
              {/* Icon */}
              <div className="rounded-lg bg-primary/10 p-3 shrink-0">
                <DollarSign className="size-6 text-primary" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{tier.title}</h3>
                  {tier.isPopular && (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs">
                      <Star className="size-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  {tier.isActive ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {tier.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground text-sm">
                    ${tier.price}
                    {periodLabels[tier.period] ?? `/${tier.period}`}
                  </span>
                  <span>
                    {tier.features.length} feature
                    {tier.features.length !== 1 ? 's' : ''}
                  </span>
                  <span>Order: {tier.sortOrder}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/pricing/${tier.id}/edit`}>
                        <Edit className="size-4 mr-2" />
                        Edit Tier
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleToggleActive(tier.id, tier.isActive)
                      }
                    >
                      {tier.isActive ? (
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
                      onClick={() => setDeleteId(tier.id)}
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
            <AlertDialogTitle>Delete Pricing Tier?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the pricing tier. This action cannot
              be undone.
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
