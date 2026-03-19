'use client';

import { useTransition } from 'react';
import { cn, formatDateUS } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle, Clock, AlertTriangle, Download } from 'lucide-react';
import { createInvoiceCheckoutSession } from '@/app/actions/payments';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string | Date;
  dueDate: string | Date;
  periodStart: string | Date;
  periodEnd: string | Date;
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  status: string;
  pdfUrl: string | null;
  lineItems: Array<{
    id: string;
    description: string;
    date: string | Date | null;
    hours: number | null;
    rate: number;
    amount: number;
  }>;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  SENT: { label: 'Awaiting Payment', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  VIEWED: { label: 'Viewed', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  PAID: { label: 'Paid', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
  PARTIAL: { label: 'Partially Paid', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
  OVERDUE: { label: 'Overdue', color: 'bg-red-500/10 text-red-700 dark:text-red-400' },
  CANCELLED: { label: 'Cancelled', color: 'bg-muted text-muted-foreground' },
};

export function InvoicePaymentCard({ invoice }: { invoice: Invoice }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const remaining = invoice.total - invoice.paidAmount;
  const isPaid = invoice.status === 'PAID';
  const canPay = ['SENT', 'VIEWED', 'OVERDUE', 'PARTIAL'].includes(invoice.status);
  const status = statusConfig[invoice.status] || statusConfig.DRAFT;

  const handlePay = () => {
    startTransition(async () => {
      const result = await createInvoiceCheckoutSession(invoice.id);
      if (result.success && result.url) {
        // For demo mode (relative URL), use router
        if (result.url.startsWith('/')) {
          router.push(result.url);
        } else {
          window.location.href = result.url;
        }
      } else {
        toast.error(result.error || 'Failed to initiate payment');
      }
    });
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-sky-500/40 hover:shadow-md">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
            <p className="text-xs text-muted-foreground">
              {formatDateUS(invoice.periodStart, 'medium')} – {formatDateUS(invoice.periodEnd, 'medium')}
            </p>
          </div>
          <Badge className={cn('text-xs', status.color)}>{status.label}</Badge>
        </div>

        {/* Line items */}
        <div className="mb-4 space-y-1.5">
          {invoice.lineItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.description}</span>
              <span className="font-medium">${item.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mb-4 space-y-1 border-t border-border/50 pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.tax > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>${invoice.tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
          {invoice.paidAmount > 0 && !isPaid && (
            <>
              <div className="flex justify-between text-emerald-600">
                <span>Paid</span>
                <span>-${invoice.paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Balance Due</span>
                <span>${remaining.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {canPay && (
            <Button
              onClick={handlePay}
              disabled={isPending}
              className="flex-1"
            >
              <CreditCard className="mr-2 size-4" />
              {isPending ? 'Processing…' : `Pay $${remaining.toFixed(2)}`}
            </Button>
          )}
          {isPaid && (
            <div className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500/10 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle className="size-4" />
              Paid in Full
            </div>
          )}
          {invoice.pdfUrl && (
            <Button variant="outline" size="icon" asChild>
              <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer" aria-label="Download PDF">
                <Download className="size-4" />
              </a>
            </Button>
          )}
        </div>

        {/* Due date warning */}
        {invoice.status === 'OVERDUE' && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-400">
            <AlertTriangle className="size-3.5" />
            Payment was due {formatDateUS(invoice.dueDate, 'medium')}
          </div>
        )}
        {invoice.status === 'SENT' && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            Due by {formatDateUS(invoice.dueDate, 'medium')}
          </div>
        )}
      </div>
    </div>
  );
}
