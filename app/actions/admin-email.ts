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

// =============================================================================
// PRESET TEMPLATES
// =============================================================================

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'interview-schedule',
    name: 'Schedule Interview',
    subject: 'Interview Invitation - Angel Touch Homecare',
    body: `We are pleased to inform you that your application has been reviewed and we would like to schedule an interview with you.

Please reply to this email with your availability for the coming week, and we will confirm a time that works best.

We look forward to meeting you!

Best regards,
Angel Touch Homecare Team`,
  },
  {
    id: 'application-followup',
    name: 'Application Follow-up',
    subject: 'Application Update - Angel Touch Homecare',
    body: `Thank you for your interest in joining Angel Touch Homecare Services.

We wanted to follow up on your application. We are currently reviewing all submissions and expect to have an update for you within the next few days.

If you have any questions in the meantime, please don't hesitate to reach out.

Best regards,
Angel Touch Homecare Team`,
  },
  {
    id: 'inquiry-followup',
    name: 'Care Inquiry Follow-up',
    subject: 'Following Up on Your Care Inquiry - Angel Touch Homecare',
    body: `Thank you for reaching out about our care services.

I wanted to follow up on your inquiry and see if you have any additional questions about our services. We would be happy to schedule a free consultation to discuss your specific care needs.

Please feel free to call us at (978) 856-9358 or reply to this email.

Warm regards,
Angel Touch Homecare Team`,
  },
  {
    id: 'status-update',
    name: 'Status Update',
    subject: 'Update Regarding Your Application - Angel Touch Homecare',
    body: `We wanted to provide you with an update regarding your application with Angel Touch Homecare Services.

[Please add the specific update here]

If you have any questions, please don't hesitate to contact us.

Best regards,
Angel Touch Homecare Team`,
  },
];
