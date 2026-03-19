# API Reference

This document covers the server actions and API routes available in Angel Touch Homecare Services.

## Server Actions

Server actions are async functions that run on the server and can be called directly from React components or forms. They're located in `app/actions/`.

### Contact & Inquiries

#### `submitContactForm`

Submit a contact form from the public website.

```typescript
import { submitContactForm } from '@/app/actions';

const result = await submitContactForm(prevState, formData);
// Returns: { success: boolean; message: string; errors?: Record<string, string[]> }
```

**FormData fields:**
- `name` (required) — Contact name (min 2 chars)
- `email` (required) — Valid email address
- `phone` (optional) — Phone number
- `service` (optional) — Service of interest
- `urgency` (optional) — Urgency level
- `message` (required) — Message content (min 10 chars)
- `preferredContact` — `"email"` or `"phone"`

**Features:**
- Zod validation
- Rate limiting (5 requests/minute per IP)
- Honeypot spam protection
- Email confirmation to sender
- Admin notification

---

#### `submitCareInquiry`

Submit a care service inquiry.

```typescript
import { submitCareInquiry } from '@/app/actions';

const result = await submitCareInquiry(prevState, formData);
```

**FormData fields:**
- `name` (required)
- `email` (required)
- `phone` (required)
- `serviceType` (required) — Type of care needed
- `careRecipient` (optional) — Who needs care
- `startDate` (optional) — Desired start date
- `hoursNeeded` (optional) — Hours per week
- `message` (optional)

---

#### `submitApplication`

Submit a job application.

```typescript
import { submitApplication } from '@/app/actions';

const result = await submitApplication(prevState, formData);
```

**FormData fields:**
- `jobId` (required) — Job listing ID
- `firstName`, `lastName`, `email`, `phone` (required)
- `street`, `city`, `state`, `zip` (optional)
- `yearsExperience` (required)
- `certifications` (array)
- `availableStart` (required)
- `shifts` (array) — `["MORNING", "AFTERNOON", "EVENING", "OVERNIGHT"]`
- `hoursPerWeek` (required)
- `resumeUrl`, `coverLetterUrl` (optional)
- `additionalInfo` (optional)

---

### Worker Management

#### `approveWorker`

Approve a pending worker registration.

```typescript
import { approveWorker } from '@/app/actions';

await approveWorker(workerId: string);
```

#### `rejectWorker`

Reject a worker registration with reason.

```typescript
import { rejectWorker } from '@/app/actions';

await rejectWorker(workerId: string, reason?: string);
```

#### `updateWorkerStatus`

Update a worker's status.

```typescript
import { updateWorkerStatus } from '@/app/actions';

await updateWorkerStatus(workerId: string, status: UserStatus);
// UserStatus: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'TERMINATED'
```

#### `updateComplianceStatus`

Update a worker's compliance status.

```typescript
import { updateComplianceStatus } from '@/app/actions';

await updateComplianceStatus(workerId: string, status: ComplianceStatus);
// ComplianceStatus: 'INCOMPLETE' | 'PENDING' | 'COMPLIANT' | 'EXPIRED'
```

---

### Shift Management (Admin)

#### `createShift`

Create a new care shift.

```typescript
import { createShift } from '@/app/actions/shifts';

const result = await createShift({
  clientId: string;
  date: string;          // 'YYYY-MM-DD'
  startTime: string;     // 'HH:mm'
  endTime: string;       // 'HH:mm'
  serviceType: ServiceLevel;
  skillsRequired?: string[];
  notes?: string;
  clientRate: number;
  workerRate?: number;   // Defaults to 65% of clientRate
});
```

#### `sendBookingRequest`

Send shift booking request to workers.

```typescript
import { sendBookingRequest } from '@/app/actions';

await sendBookingRequest(shiftId: string, workerIds: string[]);
```

**Sends SMS notifications to selected workers with booking link.**

#### `confirmBooking`

Confirm a worker's booking for a shift.

```typescript
import { confirmBooking } from '@/app/actions';

await confirmBooking(shiftId: string, workerId: string);
```

#### `cancelShift`

Cancel a shift.

```typescript
import { cancelShift } from '@/app/actions';

await cancelShift(shiftId: string, reason?: string);
```

#### `completeShift`

Mark a shift as completed.

```typescript
import { completeShift } from '@/app/actions';

await completeShift(shiftId: string);
```

---

### Employee Shift Actions

#### `acceptShiftBooking`

Worker accepts a shift booking offer.

```typescript
import { acceptShiftBooking } from '@/app/actions';

const result = await acceptShiftBooking(bookingId: string);
```

#### `declineShiftBooking`

Worker declines a shift booking offer.

```typescript
import { declineShiftBooking } from '@/app/actions';

await declineShiftBooking(bookingId: string, reason?: string);
```

#### `checkInToShift`

Worker checks in to start a shift (with optional GPS).

```typescript
import { checkInToShift } from '@/app/actions';

await checkInToShift(bookingId: string, location?: { lat: number; lng: number });
```

#### `checkOutFromShift`

Worker checks out after completing a shift.

```typescript
import { checkOutFromShift } from '@/app/actions';

await checkOutFromShift(bookingId: string, location?: { lat: number; lng: number });
```

---

### Compliance Documents

#### `uploadComplianceDocument`

Upload a compliance document for a worker.

```typescript
import { uploadComplianceDocument } from '@/app/actions';

const result = await uploadComplianceDocument({
  workerId: string;
  type: DocType;
  file: File;
  issuedDate?: Date;
  expiresAt?: Date;
});

// DocType: 'DRIVERS_LICENSE' | 'CPR_CERTIFICATION' | 'CNA_LICENSE' | 
//          'HHA_CERTIFICATION' | 'BACKGROUND_CHECK' | 'TB_TEST' | 
//          'PHYSICAL_EXAM' | 'I9_FORM' | 'W4_FORM' | 'DIRECT_DEPOSIT' | 'OTHER'
```

#### `approveComplianceDocument`

Admin approves a compliance document.

```typescript
import { approveComplianceDocument } from '@/app/actions';

await approveComplianceDocument(documentId: string);
```

#### `rejectComplianceDocument`

Admin rejects a compliance document.

```typescript
import { rejectComplianceDocument } from '@/app/actions';

await rejectComplianceDocument(documentId: string, reason: string);
```

#### `getWorkerComplianceDocuments`

Get all compliance documents for a worker.

```typescript
import { getWorkerComplianceDocuments } from '@/app/actions';

const docs = await getWorkerComplianceDocuments(workerId: string);
```

#### `getPendingComplianceDocuments`

Get all documents pending review (admin).

```typescript
import { getPendingComplianceDocuments } from '@/app/actions';

const docs = await getPendingComplianceDocuments();
```

#### `getExpiringComplianceDocuments`

Get documents expiring within N days.

```typescript
import { getExpiringComplianceDocuments } from '@/app/actions';

const docs = await getExpiringComplianceDocuments(days: number);
```

---

### Timesheets

#### `approveTimesheet`

Admin approves a submitted timesheet.

```typescript
import { approveTimesheet } from '@/app/actions';

await approveTimesheet(timesheetId: string);
```

#### `rejectTimesheet`

Admin rejects a timesheet with reason.

```typescript
import { rejectTimesheet } from '@/app/actions';

await rejectTimesheet(timesheetId: string, reason: string);
```

---

### SMS Notifications

#### `sendShiftNotification`

Send a single SMS notification.

```typescript
import { sendShiftNotification } from '@/app/actions';

const result = await sendShiftNotification({
  workerId: string;
  shiftId: string;
  message: string;
});
```

#### `sendShiftNotificationToWorkers`

Send SMS to multiple workers about an available shift.

```typescript
import { sendShiftNotificationToWorkers } from '@/app/actions';

const results = await sendShiftNotificationToWorkers(
  shiftId: string, 
  workerIds: string[]
);
```

#### `sendShiftConfirmation`

Send confirmation SMS when shift is booked.

```typescript
import { sendShiftConfirmation } from '@/app/actions';

await sendShiftConfirmation(bookingId: string);
```

#### `sendShiftCancellation`

Send cancellation SMS when shift is cancelled.

```typescript
import { sendShiftCancellation } from '@/app/actions';

await sendShiftCancellation(bookingId: string, reason?: string);
```

---

### Worker Registration

#### `registerWorker`

Register a new worker from sign-up form.

```typescript
import { registerWorker } from '@/app/actions';

const result = await registerWorker(prevState, formData);
```

#### `linkClerkToWorker`

Link a Clerk user ID to an existing worker record.

```typescript
import { linkClerkToWorker } from '@/app/actions';

await linkClerkToWorker(clerkId: string, workerId: string);
```

---

### Shift Booking (From SMS Links)

#### `bookShiftFromLink`

Book a shift via SMS link (public endpoint).

```typescript
// Accessed via /book/[shiftId]?worker=xxx
import { bookShiftFromLink } from '@/app/actions';

await bookShiftFromLink(shiftId: string, workerId: string);
```

#### `cancelShiftBooking`

Cancel an existing shift booking.

```typescript
import { cancelShiftBooking } from '@/app/actions';

await cancelShiftBooking(bookingId: string, reason?: string);
```

---

## API Routes

### File Upload

#### `POST /api/upload`

Upload files to Vercel Blob storage.

**Request:**
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'compliance'); // optional

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});
```

**Response:**
```json
{
  "url": "https://xxxxx.public.blob.vercel-storage.com/file.pdf",
  "pathname": "compliance/file.pdf",
  "contentType": "application/pdf"
}
```

**Error Response:**
```json
{
  "error": "File too large",
  "maxSize": "10MB"
}
```

---

### Webhooks

#### `POST /api/webhooks/clerk`

Handles Clerk user events for syncing to the database.

**Events handled:**
- `user.created` — Creates PortalUser record
- `user.updated` — Updates PortalUser record
- `user.deleted` — Deletes PortalUser record

**Headers:**
- `svix-id` — Webhook ID
- `svix-timestamp` — Timestamp
- `svix-signature` — HMAC signature

**Security:**
- Validates `CLERK_WEBHOOK_SECRET` signature
- Only accepts requests from Clerk IPs

---

## Response Types

### Standard Action Result

Most server actions return:

```typescript
type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  data?: unknown;
};
```

### Form State (for useFormState)

```typescript
type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};
```

---

## Error Handling

Server actions use consistent error handling:

```typescript
try {
  // Action logic
  return { success: true, data: result };
} catch (error) {
  if (error instanceof z.ZodError) {
    return { 
      success: false, 
      errors: error.flatten().fieldErrors 
    };
  }
  console.error('Action failed:', error);
  return { success: false, error: 'An unexpected error occurred' };
}
```

---

## Rate Limiting

Contact and inquiry forms have built-in rate limiting:

- **Limit:** 5 requests per minute per IP
- **Storage:** In-memory (resets on deploy)
- **Production:** Consider using Redis/Upstash for persistent rate limiting

---

### Audit Log

Located in `app/actions/audit-log.ts`. All actions require admin authentication.

#### `logAuditEvent`

Log an admin action to the audit trail.

```typescript
import { logAuditEvent } from '@/app/actions/audit-log';

await logAuditEvent({
  action: 'STATUS_CHANGE',
  entity: 'Application',
  entityId: 'cuid123',
  details: { previousStatus: 'PENDING', newStatus: 'REVIEWING' },
});
```

#### `getEntityAuditLog`

Retrieve audit history for a specific entity.

```typescript
const logs = await getEntityAuditLog('Application', 'cuid123');
```

#### `getFilteredAuditLog`

Retrieve audit logs with optional entity/action filters.

```typescript
const logs = await getFilteredAuditLog({ entity: 'Application', action: 'STATUS_CHANGE' });
```

#### Bulk Actions

```typescript
// Bulk update application statuses
await bulkUpdateApplicationStatus(ids: string[], status: string);

// Bulk mark contacts as read
await bulkMarkContactsRead(ids: string[]);

// Bulk update inquiry statuses
await bulkUpdateInquiryStatus(ids: string[], status: string);

// Bulk delete contacts
await bulkDeleteContacts(ids: string[]);

// Bulk delete inquiries
await bulkDeleteInquiries(ids: string[]);
```

All bulk actions include audit logging and admin auth checks.

---

### Admin Email

Located in `app/actions/admin-email.ts`. Requires admin authentication.

#### `sendAdminEmail`

Send an email from the admin portal and record it.

```typescript
import { sendAdminEmail } from '@/app/actions/admin-email';

const result = await sendAdminEmail({
  toEmail: 'applicant@example.com',
  toName: 'John Doe',
  subject: 'Interview Invitation',
  body: 'We would like to schedule an interview...',
  template: 'interview-schedule',
  entity: 'Application',
  entityId: 'cuid123',
});
// Returns: { success: boolean; error?: string }
```

#### `getEntityEmailHistory`

Retrieve email history for a specific entity.

```typescript
const emails = await getEntityEmailHistory('Application', 'cuid123');
```

**Email Templates** (defined in `data/email-templates.ts`):
- `interview-schedule` — Schedule Interview
- `application-followup` — Application Follow-up
- `inquiry-followup` — Care Inquiry Follow-up
- `status-update` — Status Update

---

### Notifications

Located in `app/actions/notifications.ts`. Requires admin authentication.

#### `getUnreadNotificationCount`

```typescript
const count = await getUnreadNotificationCount();
```

#### `getRecentNotifications`

```typescript
const notifications = await getRecentNotifications(limit?: number);
```

#### `markNotificationRead`

```typescript
await markNotificationRead(notificationId: string);
```

#### `markAllNotificationsRead`

```typescript
await markAllNotificationsRead();
```

---

## Validation

All inputs are validated using Zod schemas. Example:

```typescript
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
});

// Validation is automatic in server actions
```
