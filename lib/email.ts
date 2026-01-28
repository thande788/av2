/**
 * Email Service
 * 
 * Centralized email sending using Resend.
 * Handles all transactional emails for Angel Touch Homecare.
 */

import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Configuration
const FROM_EMAIL = process.env.FROM_EMAIL || "Angel Touch Homecare <noreply@angeltouch.services>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@angeltouch.services";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://angeltouch.services";

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  text?: string;
}

interface EmailResult {
  success: boolean;
  id?: string;
  error?: unknown;
}

/**
 * Send an email via Resend
 */
export async function sendEmail({ to, subject, html, replyTo, text }: SendEmailParams): Promise<EmailResult> {
  // Skip in development if no API key
  if (!process.env.RESEND_API_KEY) {
    console.log("[Email] Skipping email (no API key):", { to, subject });
    return { success: true, id: "dev-skip" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo,
    });

    if (error) {
      console.error("[Email] Send error:", error);
      return { success: false, error };
    }

    console.log("[Email] Sent successfully:", data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error("[Email] Exception:", error);
    return { success: false, error };
  }
}

/**
 * Send admin notification email
 */
export async function notifyAdmin(subject: string, content: string): Promise<EmailResult> {
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[Angel Touch] ${subject}`,
    html: adminNotificationTemplate(subject, content),
  });
}

// =============================================================================
// EMAIL TEMPLATES
// =============================================================================

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  color: #1f2937;
`;

const headerStyles = `
  color: #1e40af;
  margin-bottom: 20px;
`;

const footerStyles = `
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 14px;
`;

const buttonStyles = `
  display: inline-block;
  background-color: #1e40af;
  color: white;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  margin: 20px 0;
`;

/**
 * Contact form confirmation email to user
 */
export function contactConfirmationTemplate(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You for Contacting Us</title>
      </head>
      <body style="${baseStyles}">
        <h1 style="${headerStyles}">Thank You, ${name}!</h1>
        
        <p>We've received your message and appreciate you reaching out to Angel Touch Homecare Services.</p>
        
        <p>A member of our care team will review your inquiry and get back to you within <strong>24 hours</strong>.</p>
        
        <p>If you need immediate assistance, please don't hesitate to call us:</p>
        
        <p style="font-size: 18px; font-weight: bold;">
          📞 <a href="tel:+19788569358" style="color: #1e40af;">(978) 856-9358</a>
        </p>
        
        <p>We're available 24/7 for care inquiries.</p>
        
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

/**
 * Job application confirmation email to applicant
 */
export function applicationConfirmationTemplate(name: string, jobTitle: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Received</title>
      </head>
      <body style="${baseStyles}">
        <h1 style="${headerStyles}">Application Received!</h1>
        
        <p>Dear ${name},</p>
        
        <p>Thank you for applying for the <strong>${jobTitle}</strong> position at Angel Touch Homecare Services.</p>
        
        <p>We've received your application and our hiring team will carefully review your qualifications.</p>
        
        <h3>What's Next?</h3>
        <ul>
          <li>Our team will review your application within <strong>5-7 business days</strong></li>
          <li>If your qualifications match our needs, we'll contact you to schedule an interview</li>
          <li>All applicants will receive a response regardless of the outcome</li>
        </ul>
        
        <p>In the meantime, feel free to learn more about our team and services:</p>
        
        <a href="${SITE_URL}/about" style="${buttonStyles}">About Angel Touch</a>
        
        <p>If you have any questions about your application, please contact us at <a href="mailto:careers@angeltouch.services" style="color: #1e40af;">careers@angeltouch.services</a>.</p>
        
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

/**
 * Care inquiry confirmation email to user
 */
export function careInquiryConfirmationTemplate(name: string, serviceType: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Care Inquiry Received</title>
      </head>
      <body style="${baseStyles}">
        <h1 style="${headerStyles}">We've Received Your Inquiry</h1>
        
        <p>Dear ${name},</p>
        
        <p>Thank you for reaching out about <strong>${serviceType}</strong> services. We understand that finding the right care for yourself or a loved one is an important decision.</p>
        
        <p>A care coordinator will contact you within <strong>24 hours</strong> to discuss your needs and answer any questions.</p>
        
        <h3>What We'll Discuss:</h3>
        <ul>
          <li>Your specific care needs and preferences</li>
          <li>Available services and scheduling options</li>
          <li>Caregiver matching process</li>
          <li>Pricing and payment options</li>
        </ul>
        
        <p>Need to speak with someone sooner? Call us anytime:</p>
        
        <p style="font-size: 18px; font-weight: bold;">
          📞 <a href="tel:+19788569358" style="color: #1e40af;">(978) 856-9358</a>
        </p>
        
        <a href="${SITE_URL}/services" style="${buttonStyles}">View Our Services</a>
        
        <div style="${footerStyles}">
          <p>
            <strong>Angel Touch Homecare Services</strong><br>
            Compassionate Care, Professional Service<br>
            Lowell, MA | <a href="tel:+19788569358" style="color: #1e40af;">(978) 856-9358</a><br>
            <a href="${SITE_URL}" style="color: #1e40af;">angeltouch.services</a>
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Admin notification email template
 */
export function adminNotificationTemplate(type: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New ${type}</title>
      </head>
      <body style="${baseStyles}">
        <h2 style="${headerStyles}">New ${type}</h2>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <pre style="white-space: pre-wrap; word-wrap: break-word; margin: 0; font-family: monospace;">${content}</pre>
        </div>
        
        <a href="${SITE_URL}/admin" style="${buttonStyles}">View in Admin Dashboard</a>
        
        <div style="${footerStyles}">
          <p style="font-size: 12px; color: #9ca3af;">
            This is an automated notification from Angel Touch Homecare website.
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Format contact submission for admin notification
 */
export function formatContactForAdmin(data: {
  name: string;
  email: string;
  phone?: string | null;
  service?: string | null;
  urgency?: string | null;
  message: string;
}): string {
  return `
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || "Not provided"}
Service: ${data.service || "General inquiry"}
Urgency: ${data.urgency || "Not specified"}

Message:
${data.message}
  `.trim();
}

/**
 * Format application for admin notification
 */
export function formatApplicationForAdmin(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  yearsExperience: number;
  shifts: string[];
}): string {
  return `
Position: ${data.jobTitle}
Applicant: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone}
Experience: ${data.yearsExperience} years
Shifts: ${data.shifts.join(", ")}
  `.trim();
}

/**
 * Format care inquiry for admin notification
 */
export function formatInquiryForAdmin(data: {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  hoursPerWeek?: string | null;
  startTimeline?: string | null;
  message?: string | null;
}): string {
  return `
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Service: ${data.serviceType}
Hours/Week: ${data.hoursPerWeek || "Not specified"}
Start Timeline: ${data.startTimeline || "Not specified"}

Additional Info:
${data.message || "None provided"}
  `.trim();
}
