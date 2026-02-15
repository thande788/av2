import { db } from '@/lib/db';
import { serialize } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IconAlertCircle,
  IconFileInvoice,
  IconCreditCard,
  IconDownload,
  IconCheck,
} from '@tabler/icons-react';
import { format } from 'date-fns';

export const metadata = {
  title: 'Invoices | Family Portal',
  description: 'View and pay your invoices',
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
  SENT: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  PAID: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  OVERDUE: 'bg-red-500/15 text-red-600 dark:text-red-400',
  CANCELLED: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  SENT: 'Pending',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
};

export default async function InvoicesPage() {
  const demoClient = await db.client.findFirst({
    where: {
      user: { status: 'ACTIVE' },
    },
    include: {
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!demoClient) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <IconAlertCircle className="size-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">No Client Data</h2>
        <p className="text-muted-foreground">Please contact your administrator.</p>
      </div>
    );
  }

  const invoices = serialize(demoClient.invoices);
  const pendingInvoices = invoices.filter((i) => i.status === 'SENT' || i.status === 'OVERDUE');
  const paidInvoices = invoices.filter((i) => i.status === 'PAID');

  // Calculate totals
  const totalPending = pendingInvoices.reduce((sum, i) => sum + Number(i.total), 0);
  const totalPaid = paidInvoices.reduce((sum, i) => sum + Number(i.total), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
        <p className="text-muted-foreground">View and manage your billing</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${totalPending > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-900/30'}`}>
                <IconFileInvoice className={`size-5 ${totalPending > 0 ? 'text-amber-600' : 'text-slate-600'}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Outstanding Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
                <IconCheck className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Total Paid (YTD)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Invoices */}
      {pendingInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCreditCard className="size-5" />
              Pending Payment
            </CardTitle>
            <CardDescription>
              Invoices awaiting payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      Invoice #{invoice.invoiceNumber}
                    </span>
                    <Badge className={statusColors[invoice.status]}>
                      {statusLabels[invoice.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Due: {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-semibold">
                    ${Number(invoice.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <Button size="sm" disabled>
                    Pay Now
                  </Button>
                </div>
              </div>
            ))}
            <p className="text-center text-sm text-muted-foreground pt-2">
              Online payments coming soon. Please contact us for payment options.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>All invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="py-12 text-center">
              <IconFileInvoice className="mx-auto size-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No invoices yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-4">
                    <IconFileInvoice className="size-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Invoice #{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(invoice.periodStart), 'MMM d')} - {format(new Date(invoice.periodEnd), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={statusColors[invoice.status]}>
                      {statusLabels[invoice.status]}
                    </Badge>
                    <p className="w-24 text-right font-medium">
                      ${Number(invoice.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <Button variant="ghost" size="icon" disabled>
                      <IconDownload className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Options */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Options</CardTitle>
          <CardDescription>How to pay your invoice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Check:</strong> Make payable to "Angel Touch Homecare Services" and mail to our office.
          </p>
          <p>
            <strong>Phone:</strong> Call (978) 555-1234 to pay by credit card.
          </p>
          <p>
            <strong>Online:</strong> Coming soon! We&apos;re working on online payment options.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
