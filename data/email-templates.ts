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
