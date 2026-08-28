import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { IconArrowLeft } from '@tabler/icons-react';

import { InvoicePaymentCard } from '@/components/client/invoice-payment-card';
import { ClientSetupNeeded } from '@/components/client/client-setup-needed';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { db } from '@/lib/db';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { getCurrentClient } from '@/lib/auth';
import { serialize } from '@/lib/utils';

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Invoice Details',
  description: 'Review invoice details and complete payment',
};

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  if (!isFeatureEnabled('invoicePayments')) {
    redirect('/client/invoices');
  }

  const currentClient = await getCurrentClient();

  if (!currentClient) {
    return <ClientSetupNeeded />;
  }

  const { id } = await params;

  const invoice = await db.invoice.findFirst({
    where: {
      id,
      clientId: currentClient.id,
    },
    include: {
      lineItems: {
        orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/client/invoices" aria-label="Back to invoices">
            <IconArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoice #{invoice.invoiceNumber}</h1>
          <p className="text-sm text-muted-foreground">Review line items and complete payment securely.</p>
        </div>
      </div>

      <InvoicePaymentCard invoice={serialize(invoice)} />

      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Need help with billing? Call us at <a className="font-medium text-foreground underline" href="tel:+19785551234">(978) 555-1234</a>.
        </CardContent>
      </Card>
    </div>
  );
}
