# Angel Touch Homecare – Demo MVP Implementation Plan

> **Document Created:** February 15, 2026  
> **Target Stack:** Next.js 16 (App Router) + Prisma + PostgreSQL + Clerk + Twilio  
> **Status:** In Progress (Phase 1 ✅, Phase 2 ~70%)  
> **Related:** [portal_plan.md](./portal_plan.md), [admin-enhancements.md](./admin-enhancements.md)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Implementation Log](#implementation-log)
3. [Demo Mode Architecture](#demo-mode-architecture)
4. [Vertical Slice Strategy](#vertical-slice-strategy)
5. [Phase 1: Foundation](#phase-1-foundation)
6. [Phase 2: Core Demo Features](#phase-2-core-demo-features)
7. [Phase 3: Extended Demo Features](#phase-3-extended-demo-features)
8. [Demo → Production Transition](#demo--production-transition)
9. [Additional High-Value Features](#additional-high-value-features)
10. [Implementation Checklist](#implementation-checklist)
11. [Timeline & Effort Estimates](#timeline--effort-estimates)

---

## Implementation Log

### February 15, 2026

**Phase 1: Foundation** ✅ Complete

| Component | Location | Notes |
|-----------|----------|-------|
| Feature flags module | `lib/feature-flags.ts` | `isDemoEnabled()`, `isFeatureEnabled()` |
| Demo banner | `components/demo/demo-banner.tsx` | Fixed position amber banner |
| Portal models | `prisma/schema.prisma` | 15+ models (PortalUser, Worker, Client, Shift, etc.) |
| Demo seed data | `prisma/seed.ts` | 6 workers, 4 clients, 34 shifts |
| Route protection | Layout-level redirects | Redirects to `/` if demo disabled |

**Slice 1: Worker Registration → Approval** ✅ Complete (admin side)

| Component | Location | Notes |
|-----------|----------|-------|
| Workers list | `app/admin/workers/page.tsx` | DataTable with status badges, search |
| Worker detail | `app/admin/workers/[id]/page.tsx` | Full profile, compliance status |
| Approve/reject actions | `app/admin/workers/actions.ts` | Server actions with revalidation |

**Slice 2: Shift Creation → Booking** ✅ Complete (admin + employee booking)

| Component | Location | Notes |
|-----------|----------|-------|
| Admin shifts list | `app/admin/shifts/page.tsx` | Filterable by status, date |
| Shift detail | `app/admin/shifts/[id]/page.tsx` | Bookings management, client info |
| Booking actions | `app/admin/shifts/[id]/actions.ts` | Accept/reject bookings |
| Employee shift view | `app/employee/shifts/[id]/page.tsx` | Book/cancel shifts |
| Employee booking actions | `app/employee/shifts/[id]/actions.ts` | Booking with status checks |

**Slice 3: Employee Portal** ✅ Complete

| Component | Location | Notes |
|-----------|----------|-------|
| Portal layout | `app/employee/layout.tsx` | Sidebar layout matching admin |
| Sidebar | `components/employee/sidebar.tsx` | Emerald color scheme, collapsible |
| Stat cards | `components/employee/stat-card.tsx` | Variants: default/warning/success/info |
| Dashboard | `app/employee/page.tsx` | Stats, pending requests, upcoming shifts |
| Shifts list | `app/employee/shifts/page.tsx` | Booked + available shifts |

**Additional Implementations**

| Component | Location | Notes |
|-----------|----------|-------|
| Portals landing page | `app/(marketing)/portals/page.tsx` | Client + Employee portal cards |
| Navigation update | `data/navigation.tsx` | Links to `/portals` |
| Admin sign out | `components/admin/sidebar.tsx` | Clerk SignOutButton |
| Employee sign out | `components/employee/sidebar.tsx` | Clerk SignOutButton |

---

## Executive Summary

This plan outlines a **vertical slice approach** to building the Angel Touch portal system. Rather than building throwaway demos, we implement **complete, minimal workflows** that demonstrate core value while building real infrastructure.

### Goals

- **Demo Mode:** Feature-flag controlled preview for client stakeholders
- **Zero Throwaway:** All demo code ships to production
- **Incremental Rollout:** Gradually expand features behind the same flag
- **Risk Reduction:** Validate UX and discover integration issues early

### Key Metrics

| Metric | Target |
|--------|--------|
| Time to Demo | 2 weeks (40-50 hrs) |
| Code Reusability | >80% |
| Features Demo'd | 4-5 core workflows |
| Integration Points | Clerk, Twilio (real), Stripe (stubbed) |

---

## Demo Mode Architecture

### Environment Variable

```bash
# .env.local
DEMO_MODE=true  # Enable demo features and routes
```

### Feature Flag Implementation

```typescript
// lib/feature-flags.ts
export const featureFlags = {
  /**
   * Demo mode gates portal features for stakeholder preview.
   * When enabled, shows employee/client portal routes and demo data.
   * When disabled, only marketing and current admin routes are available.
   */
  demoMode: process.env.DEMO_MODE === 'true',

  /**
   * Individual feature toggles for granular control
   */
  features: {
    employeePortal: process.env.DEMO_MODE === 'true',
    clientPortal: process.env.DEMO_MODE === 'true',
    shiftScheduling: process.env.DEMO_MODE === 'true',
    smsNotifications: process.env.DEMO_MODE === 'true',
    timesheets: process.env.DEMO_MODE === 'true',
    invoicing: process.env.DEMO_MODE === 'true',
    complianceDocs: process.env.DEMO_MODE === 'true',
    payrollExport: process.env.DEMO_MODE === 'true',
  },
} as const;

export function isDemoEnabled(): boolean {
  return featureFlags.demoMode;
}

export function isFeatureEnabled(feature: keyof typeof featureFlags.features): boolean {
  return featureFlags.demoMode && featureFlags.features[feature];
}
```

### Route Protection

```typescript
// proxy.ts (Next.js 16+ convention, formerly middleware.ts)
import { featureFlags } from '@/lib/feature-flags';

const DEMO_ROUTES = ['/employee', '/client', '/admin/shifts', '/admin/workers'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Gate demo routes behind feature flag
  if (!featureFlags.demoMode) {
    const isDemoRoute = DEMO_ROUTES.some((route) => pathname.startsWith(route));
    if (isDemoRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }


  // ... existing middleware logic
}
```

### Demo Indicator Component

```typescript
// components/demo/demo-banner.tsx
'use client';

import { isDemoEnabled } from '@/lib/feature-flags';
import { AlertTriangle } from 'lucide-react';

export function DemoBanner() {
  if (!isDemoEnabled()) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
      <AlertTriangle className="h-4 w-4" />
      Demo Mode
    </div>
  );
}
```

### Demo Data Seeding

```typescript
// prisma/seed-demo.ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function seedDemoData() {
  console.log('🌱 Seeding demo data...');

  // Create demo workers
  const workers = await Promise.all(
    Array.from({ length: 8 }).map(() =>
      prisma.worker.create({
        data: {
          user: {
            create: {
              clerkId: `demo_${faker.string.uuid()}`,
              email: faker.internet.email(),
              phone: faker.phone.number(),
              firstName: faker.person.firstName(),
              lastName: faker.person.lastName(),
              role: 'CAREGIVER',
              status: 'ACTIVE',
            },
          },
          employeeId: `EMP-${faker.string.numeric(5)}`,
          hireDate: faker.date.past({ years: 2 }),
          payRate: faker.number.float({ min: 18, max: 28, fractionDigits: 2 }),
          skills: faker.helpers.arrayElements(
            ['Personal Care', 'Dementia', 'Hoyer Lift', 'Meal Prep', 'Companionship'],
            { min: 2, max: 4 }
          ),
          languages: faker.helpers.arrayElements(['English', 'Spanish', 'Portuguese', 'Haitian Creole'], { min: 1, max: 2 }),
          complianceStatus: faker.helpers.arrayElement(['COMPLIANT', 'COMPLIANT', 'COMPLIANT', 'PENDING']),
          city: faker.helpers.arrayElement(['Lowell', 'Dracut', 'Chelmsford', 'Tewksbury']),
          state: 'MA',
          zip: faker.helpers.arrayElement(['01852', '01826', '01824', '01876']),
        },
      })
    )
  );

  // Create demo clients
  const clients = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.client.create({
        data: {
          user: {
            create: {
              clerkId: `demo_client_${faker.string.uuid()}`,
              email: faker.internet.email(),
              phone: faker.phone.number(),
              firstName: faker.person.firstName(),
              lastName: faker.person.lastName(),
              role: 'CLIENT',
              status: 'ACTIVE',
            },
          },
          type: 'FAMILY',
          careRecipientName: faker.person.fullName(),
          careRecipientDOB: faker.date.birthdate({ min: 65, max: 95, mode: 'age' }),
          relationship: faker.helpers.arrayElement(['Mother', 'Father', 'Spouse', 'Self']),
          serviceLevel: faker.helpers.arrayElement(['COMPANION', 'PERSONAL', 'SKILLED']),
          street: faker.location.streetAddress(),
          city: faker.helpers.arrayElement(['Lowell', 'Dracut', 'Chelmsford']),
          state: 'MA',
          zip: faker.helpers.arrayElement(['01852', '01826', '01824']),
          billingRate: faker.number.float({ min: 28, max: 38, fractionDigits: 2 }),
        },
      })
    )
  );

  // Create demo shifts (next 14 days)
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const shiftDate = new Date(today);
    shiftDate.setDate(today.getDate() + i);

    // 2-4 shifts per day
    const shiftsPerDay = faker.number.int({ min: 2, max: 4 });
    for (let j = 0; j < shiftsPerDay; j++) {
      const client = faker.helpers.arrayElement(clients);
      const startHour = faker.helpers.arrayElement([7, 9, 13, 17]);
      const duration = faker.helpers.arrayElement([4, 6, 8]);

      await prisma.shift.create({
        data: {
          clientId: client.id,
          date: shiftDate,
          startTime: `${String(startHour).padStart(2, '0')}:00`,
          endTime: `${String(startHour + duration).padStart(2, '0')}:00`,
          duration,
          serviceType: client.serviceLevel,
          skillsRequired: ['Personal Care'],
          status: faker.helpers.arrayElement(['OPEN', 'OPEN', 'OPEN', 'BOOKED']),
          clientRate: client.billingRate,
          workerRate: 22.0,
          createdBy: 'demo_admin',
        },
      });
    }
  }

  console.log('✅ Demo data seeded successfully');
  console.log(`   - ${workers.length} workers`);
  console.log(`   - ${clients.length} clients`);
  console.log(`   - Multiple shifts created`);
}

seedDemoData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## Vertical Slice Strategy

Instead of building features horizontally (all UI, then all API, then all DB), we build **complete vertical slices** that work end-to-end.

### Slice 1: Worker Registration → Approval

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Registration   │───▶│  Clerk Webhook  │───▶│  Admin Review   │
│     Form        │    │   User Sync     │    │     Queue       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                      │                      │
        ▼                      ▼                      ▼
   • Full form             • Real sync            • List view
   • Zod validation        • DB creation          • Approve/reject
   • Clerk signup          • Role assignment      • Status change
```

### Slice 2: Shift Creation → SMS → Booking

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Admin Creates  │───▶│  SMS Broadcast  │───▶│  Worker Books   │
│     Shift       │    │  (Twilio Real)  │    │   (Locking)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                      │                      │
        ▼                      ▼                      ▼
   • Basic form            • Real Twilio          • Lock mechanism
   • Client select         • Booking link         • Confirmation
   • Worker matching       • Delivery status      • Status update
```

### Slice 3: Timesheet → Approval → Payroll Preview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Worker Enters  │───▶│  Admin Reviews  │───▶│  Payroll Calc   │
│   Timesheet     │    │  & Approves     │    │   & Preview     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                      │                      │
        ▼                      ▼                      ▼
   • Weekly form           • Queue view            • Auto-calc
   • Shift pre-fill        • Approve/reject        • Overtime
   • Submit flow           • Notes                 • CSV export
```

### Slice 4: Compliance Document Upload → Review

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Worker Uploads │───▶│   Admin Views   │───▶│  Status Update  │
│    Document     │    │   & Verifies    │    │  & Alerts       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                      │                      │
        ▼                      ▼                      ▼
   • File upload           • Doc preview           • Badge update
   • Type select           • Approve/reject        • Worker notify
   • Expiry date           • Notes                 • Dashboard card
```

---

## Phase 1: Foundation

**Time:** 12-16 hours  
**Goal:** Database, auth, and core infrastructure

### 1.1 Database Schema

Implement the core models from [portal_plan.md](./portal_plan.md):

| Model | Priority | Notes |
|-------|----------|-------|
| `User` | Must | Extended from existing Clerk sync |
| `Worker` | Must | Core employee data |
| `Client` | Must | Care recipient/family |
| `Shift` | Must | Scheduling core |
| `ShiftBooking` | Must | Worker-shift assignments |
| `Timesheet` | Should | Phase 2 |
| `TimesheetEntry` | Should | Phase 2 |
| `ComplianceDoc` | Should | Phase 2 |
| `Notification` | Should | Phase 2 |

### Tasks

| ID | Task | Hours | Status |
|----|------|-------|--------|
| F.1 | Add demo models to Prisma schema | 3 | ✅ |
| F.2 | Run migrations, verify DB | 1 | ✅ |
| F.3 | Create feature flags module | 1 | ✅ |
| F.4 | Extend middleware for demo routes | 1 | ✅ |
| F.5 | Create demo data seed script | 2 | ✅ |
| F.6 | Set up Clerk webhook for user sync | 2 | ⬜ |
| F.7 | Create base portal layouts | 2 | ✅ |
| F.8 | Add demo banner component | 0.5 | ✅ |

---

## Phase 2: Core Demo Features

**Time:** 24-32 hours  
**Goal:** Four complete vertical slices demonstrating core value

### 2.1 Worker Registration Flow

**What's Real:**
- Clerk signup with role metadata
- Webhook syncs to `User` + `Worker` tables
- Form captures skills, languages, location
- Basic availability setup

**What's Stubbed:**
- Background check integration
- Document upload (Phase 3)

| ID | Task | Hours | Status |
|----|------|-------|--------|
| W.1 | Worker signup page UI | 2 | ⬜ |
| W.2 | Multi-step registration form | 3 | ⬜ |
| W.3 | Server action: createWorkerProfile | 2 | ⬜ |
| W.4 | Admin pending workers queue | 2 | ✅ |
| W.5 | Admin worker detail view | 2 | ✅ |
| W.6 | Approve/reject actions | 1 | ✅ |

### 2.2 Shift Scheduling & Booking

**What's Real:**
- Admin creates shift with client, time, requirements
- System finds matching available workers
- SMS sent via Twilio with booking link
- Worker clicks link, sees shift detail, books
- Real-time locking prevents double-booking
- Shift status updates

**What's Stubbed:**
- Recurring shifts
- Calendar drag-and-drop
- Proximity matching (uses ZIP only)

| ID | Task | Hours | Status |
|----|------|-------|--------|
| S.1 | Shift creation form | 3 | ⬜ |
| S.2 | Worker matching query | 2 | ⬜ |
| S.3 | Twilio SMS integration | 2 | ⬜ |
| S.4 | Booking link handler | 1 | ⬜ |
| S.5 | Shift detail page (employee) | 2 | ✅ |
| S.6 | Booking with locking | 3 | ✅ |
| S.7 | Admin shift list view | 2 | ✅ |
| S.8 | Shift status management | 1 | ✅ |

### 2.3 Employee Portal Dashboard

**What's Real:**
- Today's shift card with check-in CTA
- Upcoming shifts list (7 days)
- Available shifts to book
- Compliance status badge

**What's Stubbed:**
- GPS check-in
- Full earnings history

| ID | Task | Hours | Status |
|----|------|-------|--------|
| E.1 | Employee portal layout | 1 | ✅ |
| E.2 | Dashboard page with widgets | 3 | ✅ |
| E.3 | Available shifts list | 2 | ✅ |
| E.4 | My schedule view | 2 | ✅ |
| E.5 | Profile page | 1 | ⬜ |

### 2.4 Admin Dashboard Enhancements

**What's Real:**
- Today's shifts overview card
- Open shifts needing coverage
- Pending approvals count
- Compliance alerts (expiring docs)

| ID | Task | Hours | Status |
|----|------|-------|--------|
| A.1 | Dashboard stats cards | 2 | ⬜ |
| A.2 | Today's schedule widget | 2 | ⬜ |
| A.3 | Pending actions panel | 1 | ⬜ |
| A.4 | Quick action buttons | 1 | ⬜ |

---

## Phase 3: Extended Demo Features

**Time:** 16-24 hours  
**Goal:** Complete the workflow demos with timesheets, compliance, invoicing

### 3.1 Timesheet Workflow

| ID | Task | Hours | Status |
|----|------|-------|--------|
| T.1 | Weekly timesheet form | 3 | ⬜ |
| T.2 | Auto-populate from shifts | 2 | ⬜ |
| T.3 | Submit action | 1 | ⬜ |
| T.4 | Admin approval queue | 2 | ⬜ |
| T.5 | Approve/reject flow | 1 | ⬜ |
| T.6 | Timesheet history view | 1 | ⬜ |

### 3.2 Compliance Documents

| ID | Task | Hours | Status |
|----|------|-------|--------|
| C.1 | Document upload component | 2 | ⬜ |
| C.2 | Worker compliance page | 2 | ⬜ |
| C.3 | Admin verification UI | 2 | ⬜ |
| C.4 | Compliance dashboard | 2 | ⬜ |

### 3.3 Payroll Preview

| ID | Task | Hours | Status |
|----|------|-------|--------|
| P.1 | Payroll calculation engine | 2 | ⬜ |
| P.2 | Payroll preview UI | 2 | ⬜ |
| P.3 | CSV export | 1 | ⬜ |

### 3.4 Client Portal (Basic)

| ID | Task | Hours | Status |
|----|------|-------|--------|
| CP.1 | Client portal layout | 1 | ⬜ |
| CP.2 | Dashboard with schedule | 2 | ⬜ |
| CP.3 | Care team view | 1 | ⬜ |
| CP.4 | Invoice list (stubbed) | 1 | ⬜ |

---

## Demo → Production Transition

### Transition Strategy

When demo is approved and you're ready to go live:

```typescript
// 1. Remove DEMO_MODE from .env (defaults to false)
// 2. Clean up demo data
// 3. Enable features one by one using individual flags

// lib/feature-flags.ts (production version)
export const featureFlags = {
  demoMode: false, // No longer needed

  features: {
    employeePortal: process.env.FEATURE_EMPLOYEE_PORTAL === 'true',
    clientPortal: process.env.FEATURE_CLIENT_PORTAL === 'true',
    shiftScheduling: process.env.FEATURE_SHIFTS === 'true',
    smsNotifications: process.env.FEATURE_SMS === 'true',
    timesheets: process.env.FEATURE_TIMESHEETS === 'true',
    invoicing: process.env.FEATURE_INVOICING === 'true',
    complianceDocs: process.env.FEATURE_COMPLIANCE === 'true',
    payrollExport: process.env.FEATURE_PAYROLL === 'true',
  },
} as const;
```

### Data Migration

```bash
# 1. Clean demo data (if seeded in production DB)
pnpm prisma db seed --demo-cleanup

# 2. Run any pending migrations
pnpm prisma migrate deploy

# 3. Seed production reference data
pnpm prisma db seed --production
```

### Rollout Phases

| Phase | Features Enabled | User Access |
|-------|------------------|-------------|
| Alpha | Employee Portal | Internal staff only |
| Beta | + Client Portal | Select clients invited |
| GA | + SMS Notifications | All active workers |
| Full | All features | General availability |

---

## Additional High-Value Features

Beyond the core demo, these features add significant value with reasonable effort:

### 1. Real-Time Availability Calendar

**Value:** Visual availability management, instant conflict detection
**Effort:** 8-10 hours

```typescript
// components/employee/availability-calendar.tsx
// Weekly grid showing worker availability
// Click to toggle availability blocks
// Real-time updates with optimistic UI
```

### 2. Shift Broadcast Controls

**Value:** Target specific worker groups, reduce SMS costs
**Effort:** 4-6 hours

- Filter by skills, location, past performance
- Preview recipients before sending
- Staggered sending (first match gets priority)

### 3. Mobile PWA Support

**Value:** Native-like experience for caregivers in the field
**Effort:** 6-8 hours

```typescript
// next.config.ts
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA(nextConfig);
```

Features:
- Offline shift viewing
- Push notifications
- Add to home screen
- Quick check-in flow

### 4. Caregiver-Client Matching Score

**Value:** Better care quality, reduced turnover
**Effort:** 6-8 hours

```typescript
interface MatchScore {
  workerId: string;
  clientId: string;
  score: number; // 0-100
  factors: {
    skills: number;      // Has required skills
    proximity: number;   // Distance to client
    availability: number; // Availability overlap
    history: number;     // Past performance with this client
    preference: number;  // Client/worker preferences
  };
}

function calculateMatchScore(worker: Worker, client: Client, shift: Shift): MatchScore {
  // Weighted scoring algorithm
}
```

### 5. Shift Notes & Handoff

**Value:** Care continuity, compliance documentation
**Effort:** 4-6 hours

- Caregivers add notes during/after shift
- Notes visible to next caregiver
- Client can view (filtered) notes
- Searchable history

### 6. Emergency Contact & Escalation

**Value:** Safety, liability reduction
**Effort:** 4 hours

- Quick-dial emergency contacts
- Escalation button → office notification
- Incident logging with timestamps

### 7. Automated Shift Reminders

**Value:** Reduced no-shows, better reliability
**Effort:** 4 hours

```typescript
// Cron: 6 PM day before
// SMS: "Reminder: You have a shift tomorrow at 9 AM with [Client]"

// Cron: 1 hour before
// SMS: "Your shift starts in 1 hour. Address: [Address]"
```

### 8. Client Satisfaction Tracking

**Value:** Service quality, early issue detection
**Effort:** 6-8 hours

- Post-shift survey (SMS link)
- Star rating + optional comments
- Dashboard metrics
- Alert on low ratings

### 9. Availability Conflicts & Swaps

**Value:** Flexibility, reduced admin overhead
**Effort:** 8-10 hours

- Worker requests time off
- System finds coverage
- Swap requests between workers
- Admin approval workflow

### 10. Invoice Payment Portal

**Value:** Faster payments, reduced A/R
**Effort:** 8-12 hours (with Stripe)

- Client views invoice online
- Pay via credit card (Stripe)
- Payment history
- Auto-receipt email

---

## Implementation Checklist

### Before Demo

- [x] `DEMO_MODE=true` in Vercel environment
- [x] Demo data seeded in staging database
- [ ] Twilio test credentials configured
- [ ] Demo user accounts created (admin, worker, client)
- [x] Feature flag module implemented
- [x] Demo banner visible

### Demo Day Preparation

- [ ] Walk-through script prepared
- [ ] Sample SMS notifications ready
- [ ] Backup plan if Twilio fails (console log fallback)
- [ ] Screen recording setup

### Post-Demo

- [ ] Collect feedback
- [ ] Prioritize Phase 3 features based on feedback
- [ ] Plan production data migration
- [ ] Set go-live timeline

---

## Timeline & Effort Estimates

### Summary

| Phase | Hours | Duration | Milestone |
|-------|-------|----------|-----------|
| Phase 1: Foundation | 12-16 | 3-4 days | DB ready, auth working |
| Phase 2: Core Demo | 24-32 | 5-7 days | 4 vertical slices demo-ready |
| Phase 3: Extended | 16-24 | 4-5 days | Complete workflow coverage |
| **Total** | **52-72** | **2-3 weeks** | **Full demo MVP** |

### Sprint Breakdown

#### Sprint 0.5 (Foundation) — 3-4 days ✅ COMPLETE

- [x] Prisma schema additions
- [x] Feature flag system
- [x] Demo seed script
- [ ] Clerk webhook updates
- [x] Base layouts

#### Sprint 1 (Core Demo) — 1 week ~70% COMPLETE

- [ ] Worker registration flow (public signup)
- [x] Shift creation & booking (admin + employee)
- [ ] SMS notifications (Twilio)
- [x] Employee portal dashboard
- [ ] Admin dashboard widgets

#### Sprint 1.5 (Extended Demo) — 1 week

- [ ] Timesheet workflow
- [ ] Compliance documents
- [ ] Payroll preview
- [ ] Client portal basic
- [ ] Polish & testing

### Resource Requirements

| Role | Hours | Notes |
|------|-------|-------|
| Fullstack Dev | 50-70 | Primary implementation |
| Designer | 4-8 | UI review, edge cases |
| QA | 8-12 | Testing, demo prep |
| Stakeholder | 2-4 | Demo review, feedback |

### External Service Setup

| Service | Setup Time | Cost |
|---------|------------|------|
| Twilio | 1-2 hrs | ~$1/month (dev) |
| Clerk (existing) | 0 | Included |
| Vercel Blob | 30 min | ~$0 (dev) |
| Stripe (optional) | 2-3 hrs | 2.9% + 30¢/tx |

---

## Quick Start

```bash
# 1. Enable demo mode
echo "DEMO_MODE=true" >> .env.local

# 2. Run migrations
pnpm prisma migrate dev

# 3. Seed demo data
pnpm prisma db seed

# 4. Start dev server
pnpm dev

# 5. Access demo routes
# - /admin (existing, enhanced)
# - /employee (new)
# - /client (new)
```

---

*Document Version: 1.0.0*  
*Last Updated: February 15, 2026*
