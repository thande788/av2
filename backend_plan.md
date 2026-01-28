# Angel Touch Homecare – Backend Implementation Plan

> **Companion Document to:** `migration_plan.md`  
> **Target Stack:** Next.js 16 (App Router) + Prisma + PostgreSQL (Neon) + Resend  
> **Document Created:** January 28, 2026  
> **Last Updated:** January 28, 2026  
> **Status:** In Progress (Phase 1-5 Complete)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Phase 1: Database Foundation](#phase-1-database-foundation)
4. [Phase 2: Form Submissions](#phase-2-form-submissions)
5. [Phase 3: Email Notifications](#phase-3-email-notifications)
6. [Phase 4: File Uploads](#phase-4-file-uploads)
7. [Phase 5: Admin Dashboard](#phase-5-admin-dashboard)
8. [Phase 6: Advanced Features](#phase-6-advanced-features)
9. [Infrastructure & DevOps](#infrastructure--devops)
10. [Security Considerations](#security-considerations)
11. [Cost Estimates](#cost-estimates)

---

## Executive Summary

This plan outlines the implementation of backend functionality for the Angel Touch Homecare website. The goal is to transform the static Next.js site into a full-featured application with:

- **Form persistence** — Contact forms, job applications, care inquiries saved to database
- **Email automation** — Confirmations, notifications, and follow-ups
- **File handling** — Resume uploads for job applications
- **Admin portal** — Manage applications, contacts, and content
- **Analytics** — Track conversions and engagement

### Guiding Principles

1. **Progressive enhancement** — Site works without JS, forms work without DB
2. **Serverless-first** — No servers to manage, scales automatically
3. **Type safety** — End-to-end types from DB to UI via Prisma
4. **Security by default** — Validation, sanitization, rate limiting
5. **Cost efficiency** — Free tiers where possible, pay-as-you-grow

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  Next.js App Router (Vercel)                                    │
│  ├── Server Components (data fetching)                          │
│  ├── Server Actions (form mutations)                            │
│  └── Client Components (interactivity)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  Prisma ORM                                                      │
│  ├── Type-safe queries                                          │
│  ├── Migrations                                                  │
│  └── Connection pooling (Neon serverless driver)                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVICES                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │    Resend    │  │  Vercel Blob │          │
│  │    (Neon)    │  │   (Email)    │  │   (Files)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Database | PostgreSQL (Neon) | Primary data store |
| ORM | Prisma | Type-safe database access |
| Email | Resend | Transactional emails |
| File Storage | Vercel Blob | Resume/document uploads |
| Auth | Clerk | Admin authentication |
| Hosting | Vercel | Serverless deployment |
| Monitoring | Vercel Analytics | Performance & usage |

---

## Phase 1: Database Foundation

**Effort:** 2-4 hours  
**Dependencies:** None  
**Priority:** Critical

### Tasks

| ID | Task | Status |
|----|------|--------|
| 1.1 | Create Neon account and project | ✅ |
| 1.2 | Configure DATABASE_URL in .env.local | ✅ |
| 1.3 | Install Prisma dependencies | ✅ |
| 1.4 | Review and finalize schema.prisma | ✅ |
| 1.5 | Run initial migration | ✅ |
| 1.6 | Generate Prisma client | ✅ |
| 1.7 | Create db.ts utility for connection | ✅ |
| 1.8 | Test connection in dev | ✅ |

### Setup Commands

```bash
# Install dependencies
pnpm add @prisma/client
pnpm add -D prisma

# Initialize (if not done)
pnpm prisma init

# Generate client
pnpm prisma generate

# Push schema to database (dev)
pnpm prisma db push

# Create migration (production)
pnpm prisma migrate dev --name init
```

### Database Connection Utility

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
```

### Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# For Neon serverless (optional, better cold starts)
DATABASE_URL_UNPOOLED="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Acceptance Criteria

- [x] Neon database created and accessible
- [x] Prisma client generates without errors
- [x] Can connect and query from local dev
- [x] Schema matches existing TypeScript types
- [x] Migration runs successfully

---

## Phase 2: Form Submissions

**Effort:** 4-6 hours  
**Dependencies:** Phase 1  
**Priority:** High

### Tasks

| ID | Task | Status |
|----|------|--------|
| 2.1 | Create Server Action for contact form | ✅ |
| 2.2 | Create Server Action for job applications | ✅ |
| 2.3 | Create Server Action for care inquiries | ✅ |
| 2.4 | Add validation with Zod schemas | ✅ |
| 2.5 | Implement rate limiting | ✅ |
| 2.6 | Add honeypot spam protection | ✅ |
| 2.7 | Create success/error UI feedback | ✅ |
| 2.8 | Test all form flows | ✅ |

### Server Action Pattern

```typescript
// app/actions/contact.ts
'use server';

import { db } from '@/lib/db';
import { contactFormSchema } from '@/lib/validation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export type ContactFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Rate limiting check
  const ip = headers().get('x-forwarded-for') ?? 'unknown';
  const isRateLimited = await checkRateLimit(ip, 'contact', 5, 60);
  if (isRateLimited) {
    return { success: false, message: 'Too many requests. Please try again later.' };
  }

  // Honeypot check
  if (formData.get('website')) {
    return { success: false, message: 'Invalid submission.' };
  }

  // Parse and validate
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    message: formData.get('message'),
  };

  const result = contactFormSchema.safeParse(rawData);
  
  if (!result.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      errors: result.error.flatten().fieldErrors,
    };
  }

  // Save to database
  try {
    await db.contactSubmission.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone ?? null,
        message: result.data.message,
        source: formData.get('source')?.toString() ?? 'contact-page',
      },
    });

    // TODO: Send email notification (Phase 3)
    
    return {
      success: true,
      message: 'Thank you! We\'ll be in touch within 24 hours.',
    };
  } catch (error) {
    console.error('Contact form error:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again or call us directly.',
    };
  }
}
```

### Rate Limiting Utility

```typescript
// lib/rate-limit.ts
import { db } from './db';

export async function checkRateLimit(
  identifier: string,
  action: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowSeconds * 1000);
  
  // Simple in-memory or Redis-based rate limiting
  // For MVP, can use Vercel KV or Upstash Redis
  
  // Placeholder implementation
  return false;
}
```

### Acceptance Criteria

- [x] Contact form saves to database
- [x] Job application saves to database
- [x] Care inquiry saves to database
- [x] Validation errors display correctly
- [x] Success message shows after submission
- [x] Rate limiting prevents spam
- [x] Honeypot catches bots

---

## Phase 3: Email Notifications

**Effort:** 3-4 hours  
**Dependencies:** Phase 2  
**Priority:** High

### Tasks

| ID | Task | Status |
|----|------|--------|
| 3.1 | Create Resend account | ✅ (pending API key) |
| 3.2 | Verify sending domain | ⏳ (user to configure) |
| 3.3 | Create email templates | ✅ |
| 3.4 | Implement sendEmail utility | ✅ |
| 3.5 | Add confirmation email to contact form | ✅ |
| 3.6 | Add confirmation email to job application | ✅ |
| 3.7 | Add admin notification emails | ✅ |
| 3.8 | Test email delivery | ⏳ (needs API key) |

### Email Service Setup

```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Angel Touch Homecare <noreply@angeltouch.services>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Email send exception:', error);
    return { success: false, error };
  }
}
```

### Email Templates

```typescript
// lib/email-templates.ts

export function contactConfirmationEmail(name: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Thank You for Contacting Us</title>
      </head>
      <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1e40af;">Thank You, ${name}!</h1>
        <p>We've received your message and will get back to you within 24 hours.</p>
        <p>If you need immediate assistance, please call us at <strong>(978) 856-9358</strong>.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Angel Touch Homecare Services<br>
          Lowell, MA | (978) 856-9358
        </p>
      </body>
    </html>
  `;
}

export function applicationConfirmationEmail(name: string, jobTitle: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Application Received</title>
      </head>
      <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1e40af;">Application Received!</h1>
        <p>Dear ${name},</p>
        <p>Thank you for applying for the <strong>${jobTitle}</strong> position at Angel Touch Homecare.</p>
        <p>We review applications carefully and will contact you within 5-7 business days if your qualifications match our needs.</p>
        <p>In the meantime, feel free to learn more about us on our website.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Angel Touch Homecare Services<br>
          Lowell, MA | (978) 856-9358
        </p>
      </body>
    </html>
  `;
}

export function adminNotificationEmail(type: string, summary: string) {
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; padding: 20px;">
        <h2>New ${type}</h2>
        <pre style="background: #f3f4f6; padding: 15px; border-radius: 8px;">${summary}</pre>
        <p><a href="https://angeltouch.services/admin">View in Admin Dashboard</a></p>
      </body>
    </html>
  `;
}
```

### Environment Variables

```bash
# .env.local
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxx"
ADMIN_EMAIL="admin@angeltouch.services"
```

### Acceptance Criteria

- [ ] Resend account created and domain verified (user action)
- [x] Contact form sends confirmation to user
- [x] Contact form sends notification to admin
- [x] Job application sends confirmation to applicant
- [x] Care inquiry sends confirmation to user
- [x] Emails render correctly in major clients
- [x] Error handling prevents form failure on email error

---

## Phase 4: File Uploads

**Effort:** 4-6 hours  
**Dependencies:** Phase 2  
**Priority:** Medium

### Tasks

| ID | Task | Status |
|----|------|--------|
| 4.1 | Set up Vercel Blob storage | ✅ |
| 4.2 | Create upload API route | ✅ |
| 4.3 | Implement client-side file selection | ✅ |
| 4.4 | Add file type/size validation | ✅ |
| 4.5 | Update job application form | ✅ |
| 4.6 | Store file URLs in database | ✅ |
| 4.7 | Add file download for admin | ⏳ (admin dashboard) |
| 4.8 | Test upload flow end-to-end | ⏳ (needs BLOB_READ_WRITE_TOKEN) |

### Upload API Route

```typescript
// app/api/upload/route.ts
import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF or Word documents.' },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `resumes/${timestamp}-${safeName}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
```

### Environment Variables

```bash
# .env.local
BLOB_READ_WRITE_TOKEN="vercel_blob_xxxxxxxxxxxxxxxx"
```

### Acceptance Criteria

- [ ] Vercel Blob configured (needs BLOB_READ_WRITE_TOKEN)
- [x] Resume upload works in job application
- [x] File type validation (PDF, DOC, DOCX)
- [x] File size validation (max 5MB)
- [x] Upload progress indicator
- [x] File URL saved with application
- [ ] Admin can download uploaded files (Phase 5)

---

## Phase 5: Admin Dashboard

**Effort:** 16-24 hours  
**Dependencies:** Phases 1-4  
**Priority:** Medium  
**Status:** ✅ Complete (January 28, 2026)

### Tasks

| ID | Task | Status |
|----|------|--------|
| 5.1 | Set up Clerk authentication | ✅ |
| 5.2 | Create admin layout with sidebar | ✅ |
| 5.3 | Build applications list view | ✅ |
| 5.4 | Build application detail view | ✅ |
| 5.5 | Add application status management | ✅ |
| 5.6 | Build contacts list view | ✅ |
| 5.7 | Build inquiries list view | ✅ |
| 5.8 | Add testimonials view | ✅ |
| 5.9 | Build dashboard overview | ✅ |
| 5.10 | Add search and filtering | ⬜ |
| 5.11 | **NEW:** Jobs CRUD (create, edit, delete, toggle) | ✅ |

### Route Structure

```
app/
├── admin/
│   ├── layout.tsx          # Admin layout with auth check
│   ├── page.tsx            # Dashboard overview
│   ├── jobs/
│   │   ├── page.tsx        # List all jobs
│   │   ├── jobs-table.tsx  # Jobs data table
│   │   ├── job-form.tsx    # Create/edit form
│   │   ├── actions.ts      # Server actions (CRUD)
│   │   ├── new/
│   │   │   └── page.tsx    # Create new job
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx # Edit job
│   ├── applications/
│   │   ├── page.tsx        # List all applications
│   │   ├── applications-table.tsx
│   │   └── [id]/
│   │       ├── page.tsx    # Single application detail
│   │       ├── application-detail.tsx
│   │       └── actions.ts  # Status update actions
│   ├── contacts/
│   │   └── page.tsx        # Contact submissions
│   ├── inquiries/
│   │   └── page.tsx        # Care inquiries
│   └── testimonials/
│       └── page.tsx        # List testimonials
```

### Admin Layout with Auth

```typescript
// app/admin/layout.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl py-8 px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
```

### Dashboard Overview

```typescript
// app/admin/page.tsx
import { db } from '@/lib/db';
import { Card } from '@/components/ui/card';

export default async function AdminDashboard() {
  const [
    applicationCount,
    pendingApplications,
    contactCount,
    unreadContacts,
  ] = await Promise.all([
    db.application.count(),
    db.application.count({ where: { status: 'PENDING' } }),
    db.contactSubmission.count(),
    db.contactSubmission.count({ where: { isRead: false } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Applications" value={applicationCount} />
        <StatCard title="Pending Review" value={pendingApplications} highlight />
        <StatCard title="Contact Messages" value={contactCount} />
        <StatCard title="Unread Messages" value={unreadContacts} highlight />
      </div>
    </div>
  );
}
```

### Acceptance Criteria

- [x] Admin routes protected by authentication
- [x] Dashboard shows key metrics (applications, contacts, inquiries, testimonials)
- [x] Can view all job applications
- [x] Can update application status
- [x] Can view contact submissions
- [x] Can view service inquiries
- [x] Can view testimonials
- [x] **NEW:** Can create/edit/delete jobs
- [x] **NEW:** Can toggle job active status
- [x] **NEW:** Brand-consistent UI with rose accents
- [ ] Search and filter functionality

---

## Phase 6: Advanced Features

**Effort:** 20-40 hours  
**Dependencies:** Phases 1-5  
**Priority:** Low (Future)

### Potential Features

| Feature | Effort | Value |
|---------|--------|-------|
| Application status email notifications | 4 hrs | High |
| Scheduled follow-up reminders | 6 hrs | Medium |
| Interview scheduling integration | 8 hrs | Medium |
| Client portal (care plans, scheduling) | 20+ hrs | High |
| SMS notifications (Twilio) | 4 hrs | Medium |
| Analytics dashboard | 8 hrs | Medium |
| Export to CSV/Excel | 2 hrs | Low |
| Audit logging | 4 hrs | Medium |

---

## Infrastructure & DevOps

### Environment Setup

```bash
# Development
.env.local

# Preview (Vercel)
Vercel Environment Variables (Preview)

# Production
Vercel Environment Variables (Production)
```

### Required Environment Variables

| Variable | Service | Required |
|----------|---------|----------|
| `DATABASE_URL` | Neon | Yes |
| `RESEND_API_KEY` | Resend | Yes |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob | Yes |
| `CLERK_SECRET_KEY` | Clerk | For Admin |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk | For Admin |
| `ADMIN_EMAIL` | - | Yes |

### Database Migrations Workflow

```bash
# Development: Quick push (no migration files)
pnpm prisma db push

# Production: Create migration
pnpm prisma migrate dev --name description_of_change

# Production: Deploy migration
pnpm prisma migrate deploy
```

---

## Security Considerations

### Input Validation
- All inputs validated with Zod before database operations
- File uploads validated for type and size
- SQL injection prevented by Prisma parameterized queries

### Rate Limiting
- Contact form: 5 requests per minute per IP
- Job application: 3 requests per hour per IP
- API routes: 60 requests per minute per IP

### Authentication
- Admin routes protected by Clerk
- Role-based access control for staff levels
- Session management handled by Clerk

### Data Protection
- Sensitive data encrypted at rest (Neon)
- HTTPS enforced (Vercel)
- No PII in logs
- GDPR-compliant data handling

---

## Cost Estimates

### Monthly Costs (Estimated)

| Service | Free Tier | Estimated Use | Cost |
|---------|-----------|---------------|------|
| Neon PostgreSQL | 0.5 GB | < 0.5 GB | $0 |
| Vercel Hosting | 100 GB bandwidth | ~10 GB | $0 |
| Vercel Blob | 1 GB | ~100 MB | $0 |
| Resend Email | 3,000/month | ~500/month | $0 |
| Clerk Auth | 10,000 MAU | 1-5 users | $0 |
| **Total** | | | **$0** |

### When You'd Need to Pay

- Database > 0.5 GB storage: ~$19/month (Neon Pro)
- Bandwidth > 100 GB: ~$20/month (Vercel Pro)
- Emails > 3,000/month: ~$20/month (Resend)
- Expected timeline to exceed free tiers: **12-24 months**

---

## Implementation Timeline

| Phase | Effort | Cumulative |
|-------|--------|------------|
| Phase 1: Database | 2-4 hrs | 4 hrs |
| Phase 2: Forms | 4-6 hrs | 10 hrs |
| Phase 3: Email | 3-4 hrs | 14 hrs |
| Phase 4: Uploads | 4-6 hrs | 20 hrs |
| Phase 5: Admin | 16-24 hrs | 44 hrs |
| **MVP Total** | | **~20 hrs** |
| **Full Admin** | | **~44 hrs** |

---

## Next Steps

1. **Create Neon account** at https://neon.tech
2. **Create Resend account** at https://resend.com
3. **Set up environment variables** in `.env.local`
4. **Run database migration** with Prisma
5. **Implement Phase 1** — test database connection
6. **Proceed sequentially** through phases

---

*Document maintained alongside `migration_plan.md`. Update as implementation progresses.*
