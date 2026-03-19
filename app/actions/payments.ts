'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

/**
 * Stripe integration for invoice payments.
 *
 * In production, install `stripe` package and configure:
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
 *
 * For demo mode, payments are stubbed.
 */

const isStripeConfigured = () => !!process.env.STRIPE_SECRET_KEY;

/**
 * Create a Stripe Checkout Session for an invoice.
 * Returns a URL to redirect the client to for payment.
 */
export async function createInvoiceCheckoutSession(
  invoiceId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: { include: { user: true } },
        lineItems: true,
      },
    });

    if (!invoice) return { success: false, error: 'Invoice not found' };
    if (invoice.status === 'PAID') return { success: false, error: 'Invoice already paid' };
    if (invoice.status === 'CANCELLED') return { success: false, error: 'Invoice is cancelled' };

    const remainingAmount = Number(invoice.total) - Number(invoice.paidAmount);
    if (remainingAmount <= 0) return { success: false, error: 'No balance due' };

    if (isStripeConfigured()) {
      // Real Stripe integration
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const stripe = require('stripe') as (key: string) => { checkout: { sessions: { create: (opts: Record<string, unknown>) => Promise<{ id: string; url: string }> } } };
      const stripeClient = stripe(process.env.STRIPE_SECRET_KEY!);

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Invoice ${invoice.invoiceNumber}`,
                description: `Angel Touch Homecare - Care services`,
              },
              unit_amount: Math.round(remainingAmount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/client/invoices/${invoiceId}?payment=success`,
        cancel_url: `${baseUrl}/client/invoices/${invoiceId}?payment=cancelled`,
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          clientId: invoice.clientId,
        },
        customer_email: invoice.client.billingEmail || invoice.client.user.email,
      }) as { id: string; url: string };

      // Save session ID
      await db.invoice.update({
        where: { id: invoiceId },
        data: { stripeCheckoutSessionId: session.id },
      });

      return { success: true, url: session.url! };
    } else {
      // Demo/stubbed payment
      console.log(`[Stripe Stub] Would create checkout for invoice ${invoice.invoiceNumber}`);
      console.log(`  Amount: $${remainingAmount.toFixed(2)}`);
      console.log(`  Client: ${invoice.client.user.email}`);

      // Simulate payment success in demo mode
      await db.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'PAID',
          paidAmount: invoice.total,
          paidAt: new Date(),
          stripePaymentIntentId: `demo_pi_${Date.now()}`,
        },
      });

      revalidatePath(`/client/invoices/${invoiceId}`);
      revalidatePath('/client/invoices');

      return { success: true, url: `/client/invoices/${invoiceId}?payment=success` };
    }
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    return { success: false, error: 'Failed to initiate payment' };
  }
}

/**
 * Handle Stripe webhook event for payment completion.
 * Called from the webhook API route.
 */
export async function handlePaymentComplete(
  invoiceId: string,
  paymentIntentId: string,
  amountPaid: number
) {
  const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return;

  const newPaidAmount = Number(invoice.paidAmount) + amountPaid;
  const total = Number(invoice.total);

  await db.invoice.update({
    where: { id: invoiceId },
    data: {
      paidAmount: newPaidAmount,
      paidAt: new Date(),
      stripePaymentIntentId: paymentIntentId,
      status: newPaidAmount >= total ? 'PAID' : 'PARTIAL',
    },
  });

  // Create notification for admins
  const admins = await db.portalUser.findMany({
    where: { role: { in: ['ADMIN', 'MANAGER'] }, status: 'ACTIVE' },
    select: { id: true },
  });

  await db.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      channel: 'IN_APP' as const,
      type: 'PAYMENT_RECEIVED' as const,
      title: 'Payment Received',
      body: `Payment of $${amountPaid.toFixed(2)} received for invoice ${invoice.invoiceNumber}`,
      data: { invoiceId },
      status: 'SENT' as const,
      sentAt: new Date(),
    })),
  });

  revalidatePath(`/client/invoices/${invoiceId}`);
  revalidatePath('/client/invoices');
  revalidatePath('/admin');
}

/**
 * Get client's payment history
 */
export async function getClientPaymentHistory(clientId: string) {
  const invoices = await db.invoice.findMany({
    where: {
      clientId,
      status: { in: ['PAID', 'PARTIAL'] },
    },
    orderBy: { paidAt: 'desc' },
    select: {
      id: true,
      invoiceNumber: true,
      total: true,
      paidAmount: true,
      paidAt: true,
      status: true,
      periodStart: true,
      periodEnd: true,
    },
  });

  return invoices;
}

/**
 * Get invoice summary for client dashboard
 */
export async function getClientInvoiceSummary(clientId: string) {
  const [outstanding, paid] = await Promise.all([
    db.invoice.aggregate({
      where: { clientId, status: { in: ['SENT', 'VIEWED', 'OVERDUE'] } },
      _sum: { total: true },
      _count: true,
    }),
    db.invoice.aggregate({
      where: { clientId, status: 'PAID' },
      _sum: { paidAmount: true },
      _count: true,
    }),
  ]);

  return {
    outstandingAmount: Number(outstanding._sum.total || 0),
    outstandingCount: outstanding._count,
    paidAmount: Number(paid._sum.paidAmount || 0),
    paidCount: paid._count,
  };
}
