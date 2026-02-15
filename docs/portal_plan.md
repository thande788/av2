# Angel Touch Homecare – Portal & Scheduling Implementation Plan

> **Document Created:** February 15, 2026  
> **Target Stack:** Next.js 16 (App Router) + Prisma + PostgreSQL + Clerk + Twilio + Stripe  
> **Status:** Planning  
> **Related:** [backend_plan.md](./backend_plan.md), [admin-enhancements.md](./docs/admin-enhancements.md)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Database Schema](#database-schema)
4. [MVP Phase 1: Core Features](#mvp-phase-1-core-features)
   - [1.1 User Management](#11-user-management)
   - [1.2 Compliance Management](#12-compliance-management)
   - [1.3 Shift Scheduling](#13-shift-scheduling)
   - [1.4 Worker Notifications](#14-worker-notifications)
   - [1.5 Booking & Confirmation](#15-booking--confirmation)
   - [1.6 Timesheet Management](#16-timesheet-management)
   - [1.7 Payroll Integration](#17-payroll-integration)
   - [1.8 Invoicing](#18-invoicing)
   - [1.9 Admin Dashboard](#19-admin-dashboard)
5. [Client Portal Features](#client-portal-features)
6. [Employee Portal Features](#employee-portal-features)
7. [Route Structure](#route-structure)
8. [Integration Points](#integration-points)
9. [Security & Compliance](#security--compliance)
10. [Implementation Timeline](#implementation-timeline)
11. [Cost Estimates](#cost-estimates)

---

## Executive Summary

This plan outlines the implementation of three interconnected portals for Angel Touch Homecare:

| Portal | Users | Purpose |
|--------|-------|---------|
| **Client Portal** | Families, Care Recipients | View schedules, request services, approve timesheets, view invoices |
| **Employee Portal** | Caregivers, Nurses | View/book shifts, submit timesheets, manage availability, upload docs |
| **Admin Dashboard** | Office Staff, Managers | Full system management, scheduling, compliance, payroll, reporting |

### Success Metrics

- Reduce manual scheduling time by 70%
- Real-time shift booking with <5 second confirmation
- 100% compliance document tracking
- Automated invoicing with <24hr turnaround
- Mobile-first experience for caregivers

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PORTALS                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  Client Portal  │  │ Employee Portal │  │ Admin Dashboard │             │
│  │  /client/*      │  │  /employee/*    │  │    /admin/*     │             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
│           │                    │                    │                       │
│           └────────────────────┼────────────────────┘                       │
│                                ▼                                            │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │                    AUTHENTICATION                            │           │
│  │                      Clerk (Multi-tenant)                   │           │
│  │  Roles: Admin, Manager, Caregiver, Client                   │           │
│  └─────────────────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API LAYER                                          │
│  Next.js Server Actions + API Routes                                        │
│  ├── /api/shifts/*          (Shift CRUD, booking)                          │
│  ├── /api/timesheets/*      (Submit, approve, export)                      │
│  ├── /api/notifications/*   (SMS queue, push)                              │
│  ├── /api/invoices/*        (Generate, send, export)                       │
│  └── /api/webhooks/*        (Twilio, Stripe, external)                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATABASE                                            │
│                    PostgreSQL (Neon)                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │  Users   │ │  Shifts  │ │Timesheets│ │ Invoices │ │Compliance│         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Twilio  │  │  Stripe  │  │  Resend  │  │ Vercel   │  │Google    │     │
│  │   SMS    │  │ Payments │  │  Email   │  │   Blob   │  │Calendar  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### New Models for Portal System

```prisma
// =============================================================================
// USERS & ROLES
// =============================================================================

model User {
  id              String    @id @default(cuid())
  clerkId         String    @unique // Clerk user ID
  email           String    @unique
  phone           String?
  firstName       String
  lastName        String
  role            UserRole
  status          UserStatus @default(PENDING)
  
  // Relations
  worker          Worker?
  client          Client?
  
  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  lastLoginAt     DateTime?
  
  @@index([clerkId])
  @@index([role])
  @@index([status])
}

enum UserRole {
  ADMIN
  MANAGER
  CAREGIVER
  CLIENT
}

enum UserStatus {
  PENDING      // Awaiting admin approval
  ACTIVE       // Approved and active
  INACTIVE     // Temporarily disabled
  TERMINATED   // No longer with company
}

// =============================================================================
// WORKERS (Caregivers, Nurses)
// =============================================================================

model Worker {
  id                String            @id @default(cuid())
  user              User              @relation(fields: [userId], references: [id])
  userId            String            @unique
  
  // Profile
  employeeId        String?           @unique // Internal employee number
  hireDate          DateTime?
  payRate           Decimal           @db.Decimal(10, 2)
  payType           PayType           @default(HOURLY)
  
  // Skills & Certifications
  skills            String[]          // ["Personal Care", "Dementia", "Hoyer Lift"]
  languages         String[]          // ["English", "Spanish", "Portuguese"]
  
  // Compliance
  complianceStatus  ComplianceStatus  @default(INCOMPLETE)
  complianceDocs    ComplianceDoc[]
  
  // Availability
  availabilities    Availability[]
  
  // Work history
  shiftBookings     ShiftBooking[]
  timesheets        Timesheet[]
  
  // Address (for proximity matching)
  street            String?
  city              String?
  state             String?
  zip               String?
  latitude          Decimal?          @db.Decimal(10, 8)
  longitude         Decimal?          @db.Decimal(11, 8)
  
  // Notes
  notes             String?           @db.Text
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  @@index([complianceStatus])
  @@index([zip])
}

enum PayType {
  HOURLY
  SALARY
  PER_DIEM
}

enum ComplianceStatus {
  INCOMPLETE   // Missing required documents
  PENDING      // Documents submitted, awaiting verification
  COMPLIANT    // All documents verified and current
  EXPIRED      // One or more documents expired
}

// =============================================================================
// COMPLIANCE DOCUMENTS
// =============================================================================

model ComplianceDoc {
  id            String          @id @default(cuid())
  worker        Worker          @relation(fields: [workerId], references: [id], onDelete: Cascade)
  workerId      String
  
  type          DocType
  name          String          // Display name
  fileUrl       String          // Vercel Blob URL
  fileName      String          // Original filename
  
  // Validity
  issuedDate    DateTime?
  expiresAt     DateTime?
  
  // Verification
  status        DocStatus       @default(PENDING)
  verifiedBy    String?         // Admin user ID
  verifiedAt    DateTime?
  rejectionNote String?
  
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@index([workerId])
  @@index([type])
  @@index([expiresAt])
  @@index([status])
}

enum DocType {
  DRIVERS_LICENSE
  CPR_CERTIFICATION
  CNA_LICENSE
  HHA_CERTIFICATION
  BACKGROUND_CHECK
  TB_TEST
  PHYSICAL_EXAM
  I9_FORM
  W4_FORM
  DIRECT_DEPOSIT
  OTHER
}

enum DocStatus {
  PENDING       // Uploaded, awaiting review
  APPROVED      // Verified by admin
  REJECTED      // Rejected, needs resubmission
  EXPIRED       // Past expiration date
}

// =============================================================================
// AVAILABILITY
// =============================================================================

model Availability {
  id            String        @id @default(cuid())
  worker        Worker        @relation(fields: [workerId], references: [id], onDelete: Cascade)
  workerId      String
  
  dayOfWeek     Int           // 0=Sunday, 6=Saturday
  startTime     String        // "06:00" (HH:mm format)
  endTime       String        // "14:00"
  isAvailable   Boolean       @default(true)
  
  // Recurring vs one-time
  effectiveFrom DateTime?
  effectiveTo   DateTime?
  
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@unique([workerId, dayOfWeek, startTime, endTime])
  @@index([workerId])
  @@index([dayOfWeek])
}

// =============================================================================
// CLIENTS (Care Recipients & Families)
// =============================================================================

model Client {
  id                String        @id @default(cuid())
  user              User          @relation(fields: [userId], references: [id])
  userId            String        @unique
  
  // Client type
  type              ClientType    @default(FAMILY)
  
  // Care recipient info (if different from user)
  careRecipientName String?
  careRecipientDOB  DateTime?
  relationship      String?       // "Mother", "Self", "Spouse"
  
  // Service details
  serviceLevel      ServiceLevel  @default(COMPANION)
  preferredTimes    String[]      // ["MORNING", "AFTERNOON"]
  specialNeeds      String[]      // ["Dementia", "Wheelchair", "Non-verbal"]
  
  // Address (care location)
  street            String
  city              String
  state             String
  zip               String
  latitude          Decimal?      @db.Decimal(10, 8)
  longitude         Decimal?      @db.Decimal(11, 8)
  
  // Emergency contact
  emergencyName     String?
  emergencyPhone    String?
  emergencyRelation String?
  
  // Billing
  billingRate       Decimal       @db.Decimal(10, 2)
  billingEmail      String?
  
  // Care plans & shifts
  shifts            Shift[]
  invoices          Invoice[]
  
  // Notes
  careNotes         String?       @db.Text
  accessNotes       String?       @db.Text // Gate codes, parking, etc.
  
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@index([type])
  @@index([zip])
}

enum ClientType {
  SELF          // Care recipient is the user
  FAMILY        // Family member managing care
  FACILITY      // Nursing home, hospital, etc.
}

enum ServiceLevel {
  COMPANION     // Basic companionship
  PERSONAL      // Personal care assistance
  SKILLED       // Skilled nursing
  LIVE_IN       // 24-hour care
}

// =============================================================================
// SHIFTS & SCHEDULING
// =============================================================================

model Shift {
  id              String          @id @default(cuid())
  client          Client          @relation(fields: [clientId], references: [id], onDelete: Cascade)
  clientId        String
  
  // Schedule
  date            DateTime        @db.Date
  startTime       String          // "09:00"
  endTime         String          // "17:00"
  duration        Decimal         @db.Decimal(4, 2) // Hours (calculated)
  
  // Requirements
  serviceType     ServiceLevel
  skillsRequired  String[]
  notes           String?         @db.Text
  
  // Status
  status          ShiftStatus     @default(OPEN)
  
  // Booking
  bookings        ShiftBooking[]
  
  // Rates
  clientRate      Decimal         @db.Decimal(10, 2) // What client pays
  workerRate      Decimal?        @db.Decimal(10, 2) // What worker earns
  
  // Recurrence (optional)
  recurringId     String?         // Links recurring shifts
  
  // Audit
  createdBy       String          // Admin user ID
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([clientId])
  @@index([date])
  @@index([status])
  @@index([recurringId])
}

enum ShiftStatus {
  OPEN            // Available for booking
  PENDING         // Sent to workers, awaiting response
  BOOKED          // Worker confirmed
  IN_PROGRESS     // Shift currently active
  COMPLETED       // Shift finished
  CANCELLED       // Cancelled by admin/client
  NO_SHOW         // Worker didn't show
}

// =============================================================================
// SHIFT BOOKINGS
// =============================================================================

model ShiftBooking {
  id              String          @id @default(cuid())
  shift           Shift           @relation(fields: [shiftId], references: [id], onDelete: Cascade)
  shiftId         String
  worker          Worker          @relation(fields: [workerId], references: [id])
  workerId        String
  
  status          BookingStatus   @default(PENDING)
  
  // For real-time booking locks
  lockedAt        DateTime?       // Prevents double-booking
  lockedUntil     DateTime?       // Lock expiration
  
  // Response
  respondedAt     DateTime?
  confirmedAt     DateTime?
  declinedReason  String?
  
  // Check-in/out
  checkedInAt     DateTime?
  checkedOutAt    DateTime?
  checkInLat      Decimal?        @db.Decimal(10, 8)
  checkInLng      Decimal?        @db.Decimal(11, 8)
  checkOutLat     Decimal?        @db.Decimal(10, 8)
  checkOutLng     Decimal?        @db.Decimal(11, 8)
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@unique([shiftId, workerId])
  @@index([shiftId])
  @@index([workerId])
  @@index([status])
}

enum BookingStatus {
  PENDING         // Offer sent to worker
  ACCEPTED        // Worker accepted
  DECLINED        // Worker declined
  CONFIRMED       // Admin confirmed booking
  CANCELLED       // Booking cancelled
  COMPLETED       // Shift completed
  NO_SHOW         // Worker didn't show
}

// =============================================================================
// TIMESHEETS
// =============================================================================

model Timesheet {
  id              String            @id @default(cuid())
  worker          Worker            @relation(fields: [workerId], references: [id])
  workerId        String
  
  // Period
  weekStarting    DateTime          @db.Date // Always Monday
  weekEnding      DateTime          @db.Date // Always Sunday
  
  // Status
  status          TimesheetStatus   @default(DRAFT)
  
  // Entries
  entries         TimesheetEntry[]
  
  // Totals (calculated)
  totalHours      Decimal           @db.Decimal(6, 2)
  totalRegular    Decimal           @db.Decimal(6, 2)
  totalOvertime   Decimal           @db.Decimal(6, 2)
  
  // Approval workflow
  submittedAt     DateTime?
  approvedBy      String?           // Admin user ID
  approvedAt      DateTime?
  rejectedReason  String?
  
  // Linked to payroll
  payrollBatchId  String?
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@unique([workerId, weekStarting])
  @@index([workerId])
  @@index([status])
  @@index([weekStarting])
}

enum TimesheetStatus {
  DRAFT           // Worker editing
  SUBMITTED       // Awaiting approval
  APPROVED        // Approved for payroll
  REJECTED        // Needs corrections
  PROCESSED       // Included in payroll
}

model TimesheetEntry {
  id              String        @id @default(cuid())
  timesheet       Timesheet     @relation(fields: [timesheetId], references: [id], onDelete: Cascade)
  timesheetId     String
  
  date            DateTime      @db.Date
  clientName      String        // Snapshot (client could be deleted)
  shiftId         String?       // Link back to shift if applicable
  
  startTime       String        // "09:00"
  endTime         String        // "17:00"
  breakMinutes    Int           @default(0)
  
  // Calculated
  hoursWorked     Decimal       @db.Decimal(5, 2)
  
  // Notes
  workDescription String?       @db.Text
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([timesheetId])
  @@index([date])
}

// =============================================================================
// INVOICING
// =============================================================================

model Invoice {
  id              String          @id @default(cuid())
  client          Client          @relation(fields: [clientId], references: [id])
  clientId        String
  
  // Invoice details
  invoiceNumber   String          @unique
  issueDate       DateTime        @db.Date
  dueDate         DateTime        @db.Date
  
  // Period
  periodStart     DateTime        @db.Date
  periodEnd       DateTime        @db.Date
  
  // Amounts
  subtotal        Decimal         @db.Decimal(10, 2)
  tax             Decimal         @db.Decimal(10, 2) @default(0)
  total           Decimal         @db.Decimal(10, 2)
  
  // Status
  status          InvoiceStatus   @default(DRAFT)
  
  // Line items
  lineItems       InvoiceLineItem[]
  
  // Payment
  paidAmount      Decimal         @db.Decimal(10, 2) @default(0)
  paidAt          DateTime?
  stripeInvoiceId String?
  
  // Files
  pdfUrl          String?
  
  // Notes
  notes           String?         @db.Text
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([clientId])
  @@index([status])
  @@index([issueDate])
}

enum InvoiceStatus {
  DRAFT           // Being created
  SENT            // Sent to client
  VIEWED          // Client opened
  PAID            // Payment received
  PARTIAL         // Partially paid
  OVERDUE         // Past due date
  CANCELLED       // Cancelled
}

model InvoiceLineItem {
  id              String        @id @default(cuid())
  invoice         Invoice       @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  invoiceId       String
  
  description     String
  date            DateTime?     @db.Date
  hours           Decimal?      @db.Decimal(5, 2)
  rate            Decimal       @db.Decimal(10, 2)
  amount          Decimal       @db.Decimal(10, 2)
  
  // Link to shift
  shiftId         String?
  
  createdAt       DateTime      @default(now())

  @@index([invoiceId])
}

// =============================================================================
// NOTIFICATIONS
// =============================================================================

model Notification {
  id              String            @id @default(cuid())
  
  // Recipient
  userId          String
  channel         NotificationChannel
  
  // Content
  type            NotificationType
  title           String
  body            String            @db.Text
  data            Json?             // Additional context (shift ID, etc.)
  
  // Delivery
  status          NotificationStatus @default(PENDING)
  sentAt          DateTime?
  deliveredAt     DateTime?
  readAt          DateTime?
  
  // External IDs
  twilioSid       String?           // Twilio message SID
  resendId        String?           // Resend message ID
  
  // Error tracking
  errorMessage    String?
  retryCount      Int               @default(0)
  
  createdAt       DateTime          @default(now())

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

enum NotificationChannel {
  EMAIL
  SMS
  PUSH
  IN_APP
}

enum NotificationType {
  SHIFT_AVAILABLE
  SHIFT_BOOKED
  SHIFT_CANCELLED
  SHIFT_REMINDER
  TIMESHEET_DUE
  TIMESHEET_APPROVED
  TIMESHEET_REJECTED
  DOCUMENT_EXPIRING
  DOCUMENT_REJECTED
  INVOICE_SENT
  PAYMENT_RECEIVED
  GENERAL
}

enum NotificationStatus {
  PENDING
  SENT
  DELIVERED
  FAILED
  READ
}

// =============================================================================
// PAYROLL
// =============================================================================

model PayrollBatch {
  id              String          @id @default(cuid())
  
  // Period
  periodStart     DateTime        @db.Date
  periodEnd       DateTime        @db.Date
  
  // Status
  status          PayrollStatus   @default(DRAFT)
  
  // Totals
  totalPayments   Decimal         @db.Decimal(12, 2)
  paymentCount    Int
  
  // Processing
  processedAt     DateTime?
  processedBy     String?
  
  // External integration
  gustoPayrollId  String?
  adpBatchId      String?
  
  // Audit
  notes           String?         @db.Text
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([status])
  @@index([periodStart])
}

enum PayrollStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  PROCESSING
  COMPLETED
  FAILED
}
```

---

## MVP Phase 1: Core Features

### 1.1 User Management

**Purpose:** Worker registration, profile management, skills tracking, availability setup with admin approval workflow.

#### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Worker Registration | Self-service signup form | Must-have |
| Admin Approval | Review and approve new workers | Must-have |
| Profile Management | Edit personal info, skills, languages | Must-have |
| Availability Setup | Weekly recurring availability | Must-have |
| Status Management | Active/Inactive/Terminated | Must-have |

#### Implementation Tasks

| ID | Task | Effort | Status |
|----|------|--------|--------|
| 1.1.1 | Create Worker registration form | 4 hrs | ⬜ |
| 1.1.2 | Implement Clerk webhook for user sync | 3 hrs | ⬜ |
| 1.1.3 | Build admin worker approval queue | 4 hrs | ⬜ |
| 1.1.4 | Create worker profile page | 4 hrs | ⬜ |
| 1.1.5 | Build availability calendar UI | 6 hrs | ⬜ |
| 1.1.6 | Create skills/languages selector | 2 hrs | ⬜ |
| 1.1.7 | Add worker search/filter in admin | 4 hrs | ⬜ |
| 1.1.8 | Build worker detail view in admin | 4 hrs | ⬜ |

#### API Endpoints

```typescript
// Server Actions
createWorkerProfile(data: WorkerProfileInput)
updateWorkerProfile(workerId: string, data: Partial<WorkerProfileInput>)
updateAvailability(workerId: string, availability: AvailabilityInput[])
approveWorker(workerId: string)
rejectWorker(workerId: string, reason: string)
updateWorkerStatus(workerId: string, status: UserStatus)

// Queries
getWorkerProfile(workerId: string)
getWorkersByStatus(status: UserStatus)
searchWorkers(filters: WorkerFilters)
getAvailableWorkers(shiftRequirements: ShiftRequirements)
```

---

### 1.2 Compliance Management

**Purpose:** Track and validate worker certifications, background checks, and required documents with expiration alerts.

#### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Document Upload | Workers upload certs/licenses | Must-have |
| Document Types | Configure required doc types | Must-have |
| Admin Verification | Review and approve/reject docs | Must-have |
| Expiration Tracking | Alert before docs expire | Must-have |
| Compliance Dashboard | Overview of compliance status | Must-have |

#### Implementation Tasks

| ID | Task | Effort | Status |
|----|------|--------|--------|
| 1.2.1 | Create document upload component | 4 hrs | ⬜ |
| 1.2.2 | Build document list/gallery view | 3 hrs | ⬜ |
| 1.2.3 | Create admin doc verification UI | 4 hrs | ⬜ |
| 1.2.4 | Implement expiration date tracking | 2 hrs | ⬜ |
| 1.2.5 | Build expiration alert cron job | 4 hrs | ⬜ |
| 1.2.6 | Create compliance dashboard | 4 hrs | ⬜ |
| 1.2.7 | Add compliance status badges | 2 hrs | ⬜ |
| 1.2.8 | Build doc rejection workflow | 2 hrs | ⬜ |

#### Document Requirements by Role

```typescript
const REQUIRED_DOCS: Record<string, DocType[]> = {
  CAREGIVER: [
    'DRIVERS_LICENSE',
    'CPR_CERTIFICATION',
    'HHA_CERTIFICATION',
    'BACKGROUND_CHECK',
    'TB_TEST',
    'I9_FORM',
    'W4_FORM',
  ],
  CNA: [
    'DRIVERS_LICENSE',
    'CPR_CERTIFICATION',
    'CNA_LICENSE',
    'BACKGROUND_CHECK',
    'TB_TEST',
    'PHYSICAL_EXAM',
    'I9_FORM',
    'W4_FORM',
  ],
};
```

#### Expiration Alert Schedule

- 90 days before: Email notification
- 60 days before: Email + SMS
- 30 days before: Email + SMS + Admin alert
- 14 days before: Daily reminders
- Expired: Block from booking new shifts

---

### 1.3 Shift Scheduling

**Purpose:** Admin creates shifts for clients, matches with qualified workers, manages scheduling conflicts.

#### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Shift Creation | Create single or recurring shifts | Must-have |
| Client Assignment | Link shifts to clients | Must-have |
| Worker Matching | Find qualified available workers | Must-have |
| Conflict Detection | Prevent double-booking | Must-have |
| Schedule Calendar | Visual calendar view | Must-have |
| Recurring Shifts | Weekly/daily patterns | Should-have |

#### Implementation Tasks

| ID | Task | Effort | Status |
|----|------|--------|--------|
| 1.3.1 | Create shift creation form | 4 hrs | ⬜ |
| 1.3.2 | Build shift calendar UI | 8 hrs | ⬜ |
| 1.3.3 | Implement worker matching algorithm | 6 hrs | ⬜ |
| 1.3.4 | Add conflict detection logic | 4 hrs | ⬜ |
| 1.3.5 | Build shift detail/edit view | 4 hrs | ⬜ |
| 1.3.6 | Create recurring shift generator | 4 hrs | ⬜ |
| 1.3.7 | Add shift status workflow | 3 hrs | ⬜ |
| 1.3.8 | Build shift list view with filters | 4 hrs | ⬜ |

#### Worker Matching Algorithm

```typescript
interface ShiftRequirements {
  date: Date;
  startTime: string;
  endTime: string;
  serviceLevel: ServiceLevel;
  skillsRequired: string[];
  clientZip: string;
}

async function findMatchingWorkers(requirements: ShiftRequirements) {
  return db.worker.findMany({
    where: {
      // Must be compliant
      complianceStatus: 'COMPLIANT',
      user: { status: 'ACTIVE' },
      
      // Must have required skills
      skills: { hasEvery: requirements.skillsRequired },
      
      // Must be available (check availability table)
      availabilities: {
        some: {
          dayOfWeek: requirements.date.getDay(),
          isAvailable: true,
          startTime: { lte: requirements.startTime },
          endTime: { gte: requirements.endTime },
        },
      },
      
      // Must not be booked for overlapping shift
      shiftBookings: {
        none: {
          status: { in: ['ACCEPTED', 'CONFIRMED'] },
          shift: {
            date: requirements.date,
            OR: [
              { startTime: { lt: requirements.endTime }, endTime: { gt: requirements.startTime } },
            ],
          },
        },
      },
    },
    orderBy: [
      // Prefer workers close to client
      // This requires a custom sort or post-processing with geocoding
    ],
  });
}
```

---

### 1.4 Worker Notifications

**Purpose:** SMS notifications with booking links when shifts become available.

#### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Shift Broadcast | Send to all matching workers | Must-have |
| Booking Link | Deep link to booking page | Must-have |
| SMS via Twilio | Reliable delivery | Must-have |
| Delivery Tracking | Track sent/delivered status | Must-have |
| Notification Preferences | Worker opt-in/out | Should-have |

#### Implementation Tasks

| ID | Task | Effort | Status |
|----|------|--------|--------|
| 1.4.1 | Set up Twilio account & integration | 2 hrs | ⬜ |
| 1.4.2 | Create notification service | 4 hrs | ⬜ |
| 1.4.3 | Build SMS template system | 3 hrs | ⬜ |
| 1.4.4 | Create booking link generator | 2 hrs | ⬜ |
| 1.4.5 | Implement notification queue | 4 hrs | ⬜ |
| 1.4.6 | Add Twilio webhook for status | 3 hrs | ⬜ |
| 1.4.7 | Build notification log viewer | 3 hrs | ⬜ |
| 1.4.8 | Add notification preferences UI | 3 hrs | ⬜ |

#### SMS Templates

```typescript
const SMS_TEMPLATES = {
  SHIFT_AVAILABLE: `
🏥 Angel Touch: New shift available!
📅 {{date}} {{startTime}}-{{endTime}}
📍 {{city}}
💰 ${{rate}}/hr

Book now: {{bookingLink}}

Reply STOP to opt out.
  `.trim(),
  
  SHIFT_REMINDER: `
⏰ Reminder: You have a shift tomorrow
📅 {{date}} {{startTime}}
📍 {{address}}
Client: {{clientName}}

Questions? Call (978) 856-9358
  `.trim(),
  
  SHIFT_CANCELLED: `
❌ Shift cancelled
📅 {{date}} {{startTime}}-{{endTime}}
Client: {{clientName}}

We apologize for the inconvenience.
  `.trim(),
};
```

---

### 1.5 Booking & Confirmation

**Purpose:** Workers book available shifts via portal with real-time locking to prevent double-booking.

#### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Shift Booking | One-click book from portal | Must-have |
| Real-time Locking | 2-minute lock during booking | Must-have |
| Instant Confirmation | Immediate booking status | Must-have |
| Client Notification | Alert client of booking | Must-have |
| Booking Conflicts | Handle race conditions | Must-have |

#### Implementation Tasks

| ID | Task | Effort | Status |
|----|------|--------|--------|
| 1.5.1 | Build available shifts list | 4 hrs | ⬜ |
| 1.5.2 | Implement shift locking mechanism | 4 hrs | ⬜ |
| 1.5.3 | Create booking confirmation flow | 3 hrs | ⬜ |
| 1.5.4 | Add booking notifications | 3 hrs | ⬜ |
| 1.5.5 | Build booking history view | 3 hrs | ⬜ |
| 1.5.6 | Create shift detail page | 3 hrs | ⬜ |
| 1.5.7 | Add cancel booking feature | 2 hrs | ⬜ |
| 1.5.8 | Handle booking conflicts | 3 hrs | ⬜ |

#### Booking Lock Implementation

```typescript
// Server Action for booking a shift
async function bookShift(shiftId: string, workerId: string) {
  return db.$transaction(async (tx) => {
    // 1. Check if shift is still open
    const shift = await tx.shift.findUnique({
      where: { id: shiftId },
      include: { bookings: true },
    });
    
    if (!shift || shift.status !== 'OPEN') {
      throw new Error('Shift is no longer available');
    }
    
    // 2. Check for existing lock
    const existingLock = shift.bookings.find(
      (b) => b.lockedUntil && b.lockedUntil > new Date() && b.workerId !== workerId
    );
    
    if (existingLock) {
      throw new Error('Someone else is booking this shift. Try again shortly.');
    }
    
    // 3. Check worker eligibility
    const worker = await tx.worker.findUnique({ where: { id: workerId } });
    if (worker?.complianceStatus !== 'COMPLIANT') {
      throw new Error('Your compliance documents must be current to book shifts.');
    }
    
    // 4. Create or update booking with lock
    const booking = await tx.shiftBooking.upsert({
      where: { shiftId_workerId: { shiftId, workerId } },
      create: {
        shiftId,
        workerId,
        status: 'ACCEPTED',
        lockedAt: new Date(),
        lockedUntil: new Date(Date.now() + 2 * 60 * 1000), // 2 minute lock
        respondedAt: new Date(),
      },
      update: {
        status: 'ACCEPTED',
        respondedAt: new Date(),
      },
    });
    
    // 5. Update shift status
    await tx.shift.update({
      where: { id: shiftId },
      data: { status: 'BOOKED' },
    });
    
    return booking;
  });
}
```

---

### 1.6 Timesheet Management

**Purpose:** Digital timesheet submission with approval workflow, serving as source of truth for payroll and invoicing.

#### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Weekly Timesheets | Auto-generated weekly | Must-have |
| Entry from Shifts | Pre-populate from booked shifts | Must-have |
| Manual Entries | Add non-shift hours | Should-have |
| Submit for Approval | Worker submission flow | Must-have |
| Admin Approval | Approve/reject with notes | Must-have |
| Timesheet History | View past timesheets | Must-have |

#### Implementation Tasks

| ID | Task | Effort | Status |
|----|------|--------|--------|
| 1.6.1 | Create timesheet model & generation | 4 hrs | ⬜ |
| 1.6.2 | Build timesheet entry form | 4 hrs | ⬜ |
| 1.6.3 | Add shift auto-population | 3 hrs | ⬜ |
| 1.6.4 | Create submission workflow | 3 hrs | ⬜ |
| 1.6.5 | Build admin approval queue | 4 hrs | ⬜ |
| 1.6.6 | Add approval/rejection flow | 3 hrs | ⬜ |
| 1.6.7 | Create timesheet history view | 3 hrs | ⬜ |
| 1.6.8 | Add overtime calculation | 2 hrs | ⬜ |

#### Overtime Calculation

```typescript
function calculateOvertimeHours(entries: TimesheetEntry[]) {
  const REGULAR_HOURS_WEEKLY = 40;
  const totalHours = entries.reduce((sum, e) => sum + Number(e.hoursWorked), 0);
  
  return {
    regularHours: Math.min(totalHours, REGULAR_HOURS_WEEKLY),
    overtimeHours: Math.max(0, totalHours - REGULAR_HOURS_WEEKLY),
    totalHours,
  };
}
```

---

### 1.7 Payroll Integration

**Purpose:** Calculate weekly payroll from approved timesheets with optional integration to Gusto/ADP.

#### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Payroll Calculation | Calculate pay from timesheets | Must-have |
| Payroll Preview | Review before processing | Must-have |
| Export to CSV | For manual processing | Must-have |
| Gusto Integration | Direct API integration | Nice-to-have |
| ADP Integration | Direct API integration | Nice-to-have |
| Payroll History | View past batches | Must-have |

#### Implementation Tasks

| ID | Task | Effort | Status |
|----|------|--------|--------|
| 1.7.1 | Create payroll batch model | 2 hrs | ⬜ |
| 1.7.2 | Build payroll calculation engine | 4 hrs | ⬜ |
| 1.7.3 | Create payroll preview UI | 4 hrs | ⬜ |
| 1.7.4 | Add CSV export | 3 hrs | ⬜ |
| 1.7.5 | Build payroll history view | 3 hrs | ⬜ |
| 1.7.6 | (Optional) Gusto API integration | 8 hrs | ⬜ |
| 1.7.7 | (Optional) ADP API integration | 8 hrs | ⬜ |

#### Payroll Calculation

```typescript
interface PayrollItem {
  workerId: string;
  workerName: string;
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  grossPay: number;
  timesheetId: string;
}

async function calculatePayroll(weekStarting: Date): Promise<PayrollItem[]> {
  const timesheets = await db.timesheet.findMany({
    where: {
      weekStarting,
      status: 'APPROVED',
    },
    include: {
      worker: { include: { user: true } },
      entries: true,
    },
  });
  
  return timesheets.map((ts) => {
    const hours = calculateOvertimeHours(ts.entries);
    const hourlyRate = Number(ts.worker.payRate);
    const overtimeRate = hourlyRate * 1.5;
    
    return {
      workerId: ts.workerId,
      workerName: `${ts.worker.user.firstName} ${ts.worker.user.lastName}`,
      regularHours: hours.regularHours,
      overtimeHours: hours.overtimeHours,
      regularPay: hours.regularHours * hourlyRate,
      overtimePay: hours.overtimeHours * overtimeRate,
      grossPay: (hours.regularHours * hourlyRate) + (hours.overtimeHours * overtimeRate),
      timesheetId: ts.id,
    };
  });
}
```

---

### 1.8 Invoicing

**Purpose:** Generate weekly invoices for clients with service markup, exportable as PDF.

#### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Invoice Generation | Auto-generate from shifts | Must-have |
| Line Items | Detailed service breakdown | Must-have |
| PDF Export | Downloadable invoices | Must-have |
| Email Invoice | Send to client | Must-have |
| Payment Tracking | Mark paid/partial | Must-have |
| Invoice History | View all invoices | Must-have |

#### Implementation Tasks

| ID | Task | Effort | Status |
|----|------|--------|--------|
| 1.8.1 | Build invoice generation engine | 4 hrs | ⬜ |
| 1.8.2 | Create invoice preview UI | 4 hrs | ⬜ |
| 1.8.3 | Add PDF generation (react-pdf) | 4 hrs | ⬜ |
| 1.8.4 | Build email invoice feature | 3 hrs | ⬜ |
| 1.8.5 | Create payment tracking | 3 hrs | ⬜ |
| 1.8.6 | Add invoice list with filters | 3 hrs | ⬜ |
| 1.8.7 | Build client invoice portal | 4 hrs | ⬜ |
| 1.8.8 | (Optional) Stripe payment integration | 6 hrs | ⬜ |

#### Invoice Generation

```typescript
async function generateInvoice(clientId: string, periodStart: Date, periodEnd: Date) {
  // Get completed shifts for period
  const shifts = await db.shift.findMany({
    where: {
      clientId,
      date: { gte: periodStart, lte: periodEnd },
      status: 'COMPLETED',
    },
    include: { bookings: { where: { status: 'COMPLETED' } } },
  });
  
  // Calculate line items
  const lineItems = shifts.map((shift) => ({
    description: `${shift.serviceType} Care - ${format(shift.date, 'MMM d')}`,
    date: shift.date,
    hours: shift.duration,
    rate: shift.clientRate,
    amount: Number(shift.duration) * Number(shift.clientRate),
  }));
  
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const tax = 0; // No tax on home care services in MA
  const total = subtotal + tax;
  
  // Get next invoice number
  const lastInvoice = await db.invoice.findFirst({ orderBy: { invoiceNumber: 'desc' } });
  const nextNumber = lastInvoice 
    ? `INV-${String(parseInt(lastInvoice.invoiceNumber.split('-')[1]) + 1).padStart(5, '0')}`
    : 'INV-00001';
  
  // Create invoice
  return db.invoice.create({
    data: {
      clientId,
      invoiceNumber: nextNumber,
      issueDate: new Date(),
      dueDate: addDays(new Date(), 30),
      periodStart,
      periodEnd,
      subtotal,
      tax,
      total,
      status: 'DRAFT',
      lineItems: {
        create: lineItems,
      },
    },
    include: { lineItems: true },
  });
}
```

---

### 1.9 Admin Dashboard

**Purpose:** Central overview of shifts, worker availability, compliance status, and key metrics.

#### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Shift Overview | Today/week shift summary | Must-have |
| Worker Availability | At-a-glance availability | Must-have |
| Compliance Alerts | Expiring documents | Must-have |
| Pending Items | Approvals needed | Must-have |
| Basic Analytics | Key metrics & charts | Must-have |
| Quick Actions | Common tasks | Should-have |

#### Implementation Tasks

| ID | Task | Effort | Status |
|----|------|--------|--------|
| 1.9.1 | Build shift summary widgets | 4 hrs | ⬜ |
| 1.9.2 | Create availability heatmap | 4 hrs | ⬜ |
| 1.9.3 | Add compliance alert panel | 3 hrs | ⬜ |
| 1.9.4 | Build pending approvals widget | 3 hrs | ⬜ |
| 1.9.5 | Create metrics dashboard | 6 hrs | ⬜ |
| 1.9.6 | Add quick action buttons | 2 hrs | ⬜ |
| 1.9.7 | Build today's schedule view | 4 hrs | ⬜ |

#### Dashboard Metrics

```typescript
interface DashboardMetrics {
  // Today
  shiftsToday: number;
  openShiftsToday: number;
  workersClockedIn: number;
  
  // This week
  shiftsThisWeek: number;
  hoursScheduled: number;
  revenueScheduled: number;
  
  // Compliance
  workersCompliant: number;
  workersExpiring: number;
  documentsAwaitingReview: number;
  
  // Pending actions
  pendingApplications: number;
  pendingTimesheets: number;
  pendingInvoices: number;
  unreadContacts: number;
}
```

---

## Client Portal Features

### Route: `/client/*`

| Page | Description |
|------|-------------|
| `/client` | Dashboard overview |
| `/client/schedule` | View upcoming/past shifts |
| `/client/caregivers` | View assigned caregivers |
| `/client/timesheets` | Approve worker timesheets |
| `/client/invoices` | View and pay invoices |
| `/client/profile` | Manage profile & preferences |
| `/client/messages` | Message center |

### Client Dashboard Widgets

- **Upcoming Shifts**: Next 7 days
- **Assigned Caregivers**: Current care team
- **Recent Activity**: Shift completions, invoices
- **Quick Actions**: Request additional shift, contact admin

---

## Employee Portal Features

### Route: `/employee/*`

| Page | Description |
|------|-------------|
| `/employee` | Dashboard overview |
| `/employee/shifts` | Browse & book available shifts |
| `/employee/schedule` | View booked shifts |
| `/employee/timesheets` | Weekly timesheet submission |
| `/employee/compliance` | Document uploads |
| `/employee/availability` | Set weekly availability |
| `/employee/profile` | Manage profile |
| `/employee/earnings` | View pay history |

### Employee Dashboard Widgets

- **Today's Shift**: Check-in button if applicable
- **Upcoming Shifts**: Next 7 days
- **Available Shifts**: New opportunities
- **Timesheet Reminder**: If submission due
- **Compliance Status**: Document alerts

---

## Route Structure

```
app/
├── (marketing)/              # Public pages (existing)
│
├── admin/                    # Admin dashboard (existing, extend)
│   ├── page.tsx              # Enhanced dashboard
│   ├── workers/
│   │   ├── page.tsx          # Worker list
│   │   ├── [id]/
│   │   │   └── page.tsx      # Worker detail
│   │   └── pending/
│   │       └── page.tsx      # Pending approvals
│   ├── clients/
│   │   ├── page.tsx          # Client list
│   │   ├── new/
│   │   │   └── page.tsx      # Add client
│   │   └── [id]/
│   │       └── page.tsx      # Client detail
│   ├── shifts/
│   │   ├── page.tsx          # Shift calendar/list
│   │   ├── new/
│   │   │   └── page.tsx      # Create shift(s)
│   │   └── [id]/
│   │       └── page.tsx      # Shift detail
│   ├── timesheets/
│   │   ├── page.tsx          # Pending approvals
│   │   └── [id]/
│   │       └── page.tsx      # Timesheet detail
│   ├── payroll/
│   │   ├── page.tsx          # Payroll batches
│   │   └── [batchId]/
│   │       └── page.tsx      # Batch detail
│   ├── invoices/
│   │   ├── page.tsx          # Invoice list
│   │   └── [id]/
│   │       └── page.tsx      # Invoice detail
│   ├── compliance/
│   │   └── page.tsx          # Compliance overview
│   └── analytics/
│       └── page.tsx          # Reports & charts
│
├── employee/                 # Employee portal (NEW)
│   ├── layout.tsx
│   ├── page.tsx              # Dashboard
│   ├── shifts/
│   │   ├── page.tsx          # Available shifts
│   │   └── [id]/
│   │       └── page.tsx      # Shift detail/booking
│   ├── schedule/
│   │   └── page.tsx          # My schedule
│   ├── timesheets/
│   │   ├── page.tsx          # Timesheet list
│   │   └── [weekId]/
│   │       └── page.tsx      # Weekly timesheet
│   ├── compliance/
│   │   └── page.tsx          # Document management
│   ├── availability/
│   │   └── page.tsx          # Set availability
│   ├── earnings/
│   │   └── page.tsx          # Pay history
│   └── profile/
│       └── page.tsx          # Profile settings
│
├── client/                   # Client portal (NEW)
│   ├── layout.tsx
│   ├── page.tsx              # Dashboard
│   ├── schedule/
│   │   └── page.tsx          # Care schedule
│   ├── caregivers/
│   │   └── page.tsx          # Care team
│   ├── timesheets/
│   │   └── page.tsx          # Approve hours
│   ├── invoices/
│   │   ├── page.tsx          # Invoice list
│   │   └── [id]/
│   │       └── page.tsx      # Invoice detail/pay
│   ├── messages/
│   │   └── page.tsx          # Message center
│   └── profile/
│       └── page.tsx          # Preferences
│
└── api/
    ├── webhooks/
    │   ├── clerk/
    │   │   └── route.ts      # User sync
    │   ├── twilio/
    │   │   └── route.ts      # SMS status
    │   └── stripe/
    │       └── route.ts      # Payment events
    ├── cron/
    │   ├── compliance-alerts/
    │   │   └── route.ts      # Daily doc check
    │   ├── shift-reminders/
    │   │   └── route.ts      # Day-before reminder
    │   └── invoice-generation/
    │       └── route.ts      # Weekly invoices
    └── internal/
        └── cleanup-locks/
            └── route.ts      # Release stale booking locks
```

---

## Integration Points

### External Services

| Service | Purpose | Priority | Effort |
|---------|---------|----------|--------|
| **Twilio** | SMS notifications | Must-have | 8 hrs |
| **Resend** | Email notifications | Must-have | 4 hrs |
| **Vercel Blob** | Document storage | Must-have | 2 hrs |
| **Stripe** | Invoice payments | Should-have | 12 hrs |
| **Google Maps API** | Address geocoding, distance | Should-have | 6 hrs |
| **Google Calendar** | Shift sync | Nice-to-have | 8 hrs |
| **Gusto** | Payroll processing | Nice-to-have | 12 hrs |
| **ADP** | Payroll processing | Nice-to-have | 12 hrs |

### Webhooks Required

```typescript
// Clerk webhook - sync users to database
// POST /api/webhooks/clerk
type ClerkWebhookPayload = {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name: string;
    last_name: string;
    public_metadata: { role?: UserRole };
  };
};

// Twilio webhook - SMS delivery status
// POST /api/webhooks/twilio
type TwilioStatusPayload = {
  MessageSid: string;
  MessageStatus: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered';
  ErrorCode?: string;
};

// Stripe webhook - payment events
// POST /api/webhooks/stripe
type StripeEvent = {
  type: 'invoice.paid' | 'invoice.payment_failed';
  data: { object: Stripe.Invoice };
};
```

### Cron Jobs (Vercel Cron)

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/compliance-alerts",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/shift-reminders",
      "schedule": "0 18 * * *"
    },
    {
      "path": "/api/cron/invoice-generation",
      "schedule": "0 6 * * 1"
    },
    {
      "path": "/api/internal/cleanup-locks",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

---

## Security & Compliance

### Authentication & Authorization

```typescript
// Middleware for role-based access
export async function checkAccess(
  allowedRoles: UserRole[],
  resourceOwnerId?: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user || !allowedRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }
  
  // If resource owner check needed
  if (resourceOwnerId && user.role !== 'ADMIN' && user.id !== resourceOwnerId) {
    throw new Error('Forbidden');
  }
  
  return user;
}
```

### HIPAA Considerations

| Requirement | Implementation |
|-------------|----------------|
| Access Control | Role-based, audit logged |
| Encryption at Rest | Neon PostgreSQL (encrypted) |
| Encryption in Transit | TLS everywhere |
| Audit Logging | All data access logged |
| Data Minimization | Only collect necessary info |
| Breach Notification | Admin alerts, logging |

### Data Retention

- **Applications**: 2 years after decision
- **Timesheets**: 7 years (payroll records)
- **Client Records**: Duration of service + 7 years
- **Compliance Docs**: Duration of employment + 3 years

---

## Implementation Timeline

### Sprint 1: Database & Auth Foundation (2 weeks)

- [ ] Prisma schema for all new models
- [ ] Database migrations
- [ ] Clerk user sync webhook
- [ ] Basic RBAC middleware
- [ ] Admin route protection

**Deliverables:** Database ready, auth working

### Sprint 2: Worker Management (2 weeks)

- [ ] Worker registration flow
- [ ] Admin approval queue
- [ ] Worker profile management
- [ ] Availability setup
- [ ] Worker list/detail in admin

**Deliverables:** Workers can register and be approved

### Sprint 3: Compliance System (2 weeks)

- [ ] Document upload component
- [ ] Admin verification workflow
- [ ] Expiration tracking
- [ ] Compliance dashboard
- [ ] Alert notifications

**Deliverables:** Full compliance tracking

### Sprint 4: Client Management (1 week)

- [ ] Client data model
- [ ] Admin client CRUD
- [ ] Client profile page
- [ ] Service requirements setup

**Deliverables:** Clients can be managed

### Sprint 5: Shift Scheduling (2 weeks)

- [ ] Shift creation form
- [ ] Calendar view
- [ ] Worker matching
- [ ] Conflict detection
- [ ] Recurring shifts

**Deliverables:** Admin can create and manage shifts

### Sprint 6: Booking & Notifications (2 weeks)

- [ ] Twilio integration
- [ ] SMS templates
- [ ] Booking flow with locking
- [ ] Employee available shifts view
- [ ] Confirmation notifications

**Deliverables:** Workers can receive and book shifts

### Sprint 7: Timesheets (2 weeks)

- [ ] Timesheet generation
- [ ] Entry form
- [ ] Submission workflow
- [ ] Admin approval
- [ ] Employee timesheet history

**Deliverables:** Full timesheet workflow

### Sprint 8: Invoicing & Payroll (2 weeks)

- [ ] Invoice generation
- [ ] PDF export
- [ ] Payroll calculation
- [ ] CSV export
- [ ] Client invoice portal

**Deliverables:** Invoicing and payroll ready

### Sprint 9: Client Portal (1 week)

- [ ] Client dashboard
- [ ] Schedule view
- [ ] Timesheet approval (client side)
- [ ] Invoice viewing

**Deliverables:** Client portal MVP

### Sprint 10: Employee Portal Polish (1 week)

- [ ] Employee dashboard
- [ ] Earnings history
- [ ] Schedule management
- [ ] Profile completion

**Deliverables:** Employee portal complete

### Sprint 11: Admin Dashboard & Analytics (1 week)

- [ ] Enhanced dashboard widgets
- [ ] Basic analytics/charts
- [ ] Metric calculations
- [ ] Quick actions

**Deliverables:** Admin dashboard complete

### Sprint 12: Testing & QA (2 weeks)

- [ ] End-to-end testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] Documentation

**Deliverables:** Production-ready MVP

---

## Cost Estimates

### Development Effort

| Phase | Sprints | Hours | Cost (@ $100/hr) |
|-------|---------|-------|------------------|
| Database & Auth | 1 | 80 | $8,000 |
| Worker Management | 1 | 80 | $8,000 |
| Compliance | 1 | 80 | $8,000 |
| Client Management | 0.5 | 40 | $4,000 |
| Shift Scheduling | 1 | 80 | $8,000 |
| Booking & Notifications | 1 | 80 | $8,000 |
| Timesheets | 1 | 80 | $8,000 |
| Invoicing & Payroll | 1 | 80 | $8,000 |
| Client Portal | 0.5 | 40 | $4,000 |
| Employee Portal | 0.5 | 40 | $4,000 |
| Admin Dashboard | 0.5 | 40 | $4,000 |
| Testing & QA | 1 | 80 | $8,000 |
| **Total** | **10** | **800** | **$80,000** |

### Monthly Infrastructure Costs

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Vercel | Pro | $20 |
| Neon PostgreSQL | Launch | $19 |
| Clerk | Pro | $25 |
| Twilio SMS | Pay-as-you-go | ~$50 |
| Resend | Pro | $20 |
| Vercel Blob | Standard | ~$10 |
| **Total** | | **~$144/month** |

### Optional Add-ons

| Feature | One-time Cost | Monthly Cost |
|---------|---------------|--------------|
| Stripe Integration | $4,000 | 2.9% + 30¢/tx |
| Gusto Payroll API | $6,000 | Included in Gusto |
| Google Calendar Sync | $3,000 | Free API |

---

## Appendix: Environment Variables

```bash
# .env.local (add to existing)

# Twilio
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_PHONE_NUMBER="+1234567890"

# Stripe (optional)
STRIPE_SECRET_KEY="sk_live_xxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_xxxxxxxx"

# Google Maps (optional)
GOOGLE_MAPS_API_KEY="AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Gusto (optional)
GUSTO_CLIENT_ID="xxxxxxxx"
GUSTO_CLIENT_SECRET="xxxxxxxx"
```

---

*Document Version: 1.0.0*  
*Last Updated: February 15, 2026*
