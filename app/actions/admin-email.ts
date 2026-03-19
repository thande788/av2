'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { logAuditEvent } from './audit-log';
import { revalidatePath } from 'next/cache';

export interface AdminEmailData {
  toEmail: string;
  toName?: string;
  subject: string;
  body: string;
  template?: string;
  entity?: string;
  entityId?: string;
}

export interface AdminEmailResult {
  success: boolean;
  error?: string;
}

/**
 * Send an email from the admin portal and log it
 */
export async function sendAdminEmail(data: AdminEmailData): Promise<AdminEmailResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Unauthorized' };

  const user = await currentUser();
  const sentByName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : undefined;

  // Build HTML from body text
  const html = adminEmailTemplate({
    body: data.body,
    recipientName: data.toName,
  });

  const result = await sendEmail({
    to: data.toEmail,
    subject: data.subject,
    html,
    text: data.body,
  });

  // Record the email in database
  await db.adminEmail.create({
    data: {
      sentBy: userId,
      sentByName,
      toEmail: data.toEmail,
      toName: data.toName,
      subject: data.subject,
      body: data.body,
      template: data.template,
      entity: data.entity,
      entityId: data.entityId,
      resendId: result.id,
      status: result.success ? 'SENT' : 'FAILED',
    },
  });

  // Audit log
  await logAuditEvent({
    action: 'EMAIL_SENT',
    entity: data.entity || 'AdminEmail',
    entityId: data.entityId || 'direct',
    details: {
      toEmail: data.toEmail,
      subject: data.subject,
      template: data.template,
      status: result.success ? 'SENT' : 'FAILED',
    },
  });

  if (data.entity && data.entityId) {
    revalidatePath(`/admin/${data.entity.toLowerCase()}s/${data.entityId}`);
  }

  return {
    success: result.success,
    error: result.success ? undefined : 'Failed to send email',
  };
}

/**
 * Get email history for an entity
 */
export async function getEntityEmailHistory(entity: string, entityId: string) {
  return db.adminEmail.findMany({
    where: { entity, entityId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

// =============================================================================
// EMAIL TEMPLATES FOR ADMIN
// =============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://angeltouch.services';

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  color: #1f2937;
`;

const footerStyles = `
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 14px;
`;

function adminEmailTemplate({
  body,
  recipientName,
}: {
  body: string;
  recipientName?: string;
}): string {
  const greeting = recipientName ? `Dear ${recipientName},` : 'Hello,';
  // Escape HTML in body text to prevent XSS
  const escapedBody = body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="${baseStyles}">
        <p>${greeting}</p>
        <div style="margin: 20px 0; line-height: 1.6;">
          ${escapedBody}
        </div>
        <div style="${footerStyles}">
          <p>
            <strong>Angel Touch Homecare Services</strong><br>
            Lowell, MA | <a href="tel:+19788569358" style="color: #1e40af;">(978) 856-9358</a><br>
            <a href="${SITE_URL}" style="color: #1e40af;">angeltouch.services</a>
          </p>
        </div>
      </body>
    </html>
  `;
}

// Email templates are in @/data/email-templates.ts (shared with client components)
export type { EmailTemplate } from '@/types';
