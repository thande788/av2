# Angel Touch Homecare Services – Next.js Migration Plan

> **Migration Target:** Next.js 16+ (App Router) + React 19 + Tailwind CSS 4 + shadcn/ui + TypeScript  
> **Source Directory:** `~/projects/angeltouch/src/` (Vite + React)  
> **Target Directory:** `v2/` (Next.js project root)  
> **Estimated Effort:** 8-10 Sprints (2-week sprints)  
> **Document Created:** January 26, 2026  
> **Last Updated:** January 27, 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Sprint Planning Overview](#sprint-planning-overview)
3. [Current Architecture Analysis](#current-architecture-analysis)
4. [Target Architecture](#target-architecture)
5. [Sprint 1: Project Scaffolding](#sprint-1-project-scaffolding)
6. [Sprint 2: Design System Migration](#sprint-2-design-system-migration)
7. [Sprint 3: Core Components Migration](#sprint-3-core-components-migration)
8. [Sprint 4: Page Migration (Marketing)](#sprint-4-page-migration-marketing)
9. [Sprint 5: Careers Section & Backend Foundation](#sprint-5-careers-section--backend-foundation)
10. [Sprint 6: SEO & Structured Data](#sprint-6-seo--structured-data)
11. [Sprint 7: Image System & Performance](#sprint-7-image-system--performance)
12. [Sprint 8: Features & Interactivity](#sprint-8-features--interactivity)
13. [Sprint 9: Testing & Accessibility](#sprint-9-testing--accessibility)
14. [Sprint 10: Deployment & Cutover](#sprint-10-deployment--cutover)
15. [Risk Register](#risk-register)
16. [File Mapping Reference](#file-mapping-reference)
17. [Appendix](#appendix)

---

## Executive Summary

This document outlines the migration strategy from the current Vite + React SPA architecture to a Next.js App Router application with TypeScript and shadcn/ui components. The migration preserves all existing functionality while adding:

- **Server-side rendering (SSR)** for improved SEO
- **Type safety** via TypeScript strict mode
- **Modern UI components** via shadcn/ui + Radix primitives
- **Optimized image handling** via Next.js Image component
- **Server Actions** for form handling with progressive enhancement
- **Structured data (JSON-LD)** for local SEO
- **Careers section** with backend-compatible data structure
- **Route groups** preparing for authenticated portal features
- **Improved developer experience** with App Router conventions

### Migration Guidelines

1. **Refactoring rule:** During migration, it is acceptable to refactor legacy implementations (structure, styling approach, component boundaries) to align with Next.js/App Router best practices, accessibility, performance, and maintainability — as long as user-facing behavior and content remain equivalent.

2. **Documentation rule:** Every sprint of implementation must update documentation where relevant (README, code comments, type definitions, this plan).

3. **Commit rule:** Every sprint should have comprehensive commit messages that serve as the implementation summary. Use conventional commits with detailed bullet points.

4. **UI flexibility:** The UI does not have to match legacy exactly. Modernization and UX improvements are encouraged as long as no information is lost and branding is retained.

5. **Backend-ready:** All data structures should be designed with future database integration in mind (Prisma-compatible types, normalized relationships).

6. **Early validation rule:** Wire up components to the live app on a rolling basis to obtain early visual validation. Don't wait until all components are complete—integrate into layouts as soon as they pass lint/type checks.

---

## Sprint Planning Overview

| Sprint | Focus Area | Story Points | Dependencies |
|--------|------------|--------------|--------------|
| **Sprint 1** | Project Scaffolding | 8 | None |
| **Sprint 2** | Design System Migration | 13 | Sprint 1 |
| **Sprint 3** | Core Components Migration | 21 | Sprint 2 |
| **Sprint 4** | Page Migration (Marketing) | 21 | Sprint 3 |
| **Sprint 5** | Careers Section & Backend Foundation | 21 | Sprint 3 |
| **Sprint 6** | SEO & Structured Data | 13 | Sprint 4 |
| **Sprint 7** | Image System & Performance | 13 | Sprint 4 |
| **Sprint 8** | Features & Interactivity | 13 | Sprint 5, 7 |
| **Sprint 9** | Testing & Accessibility | 13 | Sprint 8 |
| **Sprint 10** | Deployment & Cutover | 8 | Sprint 9 |

### Sprint Velocity Assumptions
- 2-week sprints
- ~20-25 story points per sprint capacity
- Sprints 4 & 5 can run in parallel with different team members

---

## Current Architecture Analysis

### Tech Stack (Current)
| Layer | Technology |
|-------|------------|
| Framework | React 19 + Vite 7 |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS 3 + CSS Modules (21 files) |
| UI Components | HeadlessUI 2.2 + Custom components |
| Animation | Framer Motion 12 |
| Images | Custom `ResponsiveImage` component + Sharp pipeline |
| Forms | Native + Zod validation |

### Inventory Summary
| Asset Type | Count | Notes |
|------------|-------|-------|
| Pages | 11 | Including HeadlessUI variants |
| Components | 25 | Mix of base + HeadlessUI versions |
| CSS Modules | 21 | ~3,500 lines total |
| Global CSS | 1 | ~1,600 lines (design tokens) |
| Hooks | 1 | `useCaregiverData.js` |
| Data Files | 3 | JSON + JS data modules |
| Build Scripts | 6 | Image generation, icons, etc. |

### Pages to Migrate
1. `Home.jsx` → `app/(marketing)/page.tsx`
2. `AboutHeadlessUI.jsx` → `app/(marketing)/about/page.tsx`
3. `ServicesHeadlessUI.jsx` → `app/(marketing)/services/page.tsx`
4. `CaregiversHeadlessUI.jsx` → `app/(marketing)/caregivers/page.tsx`
5. `TestimonialsHeadlessUI.jsx` → `app/(marketing)/testimonials/page.tsx`
6. `Contact.jsx` → `app/(marketing)/contact/page.tsx`
7. `FAQs-HeadlessUI.jsx` → `app/(marketing)/faqs/page.tsx`
8. `ResourcesHeadlessUI.jsx` → `app/(marketing)/resources/page.tsx`
9. `ClientPortalHeadlessUI.jsx` → `app/(portal)/client/page.tsx`
10. `PrivacyPolicy.jsx` → `app/(marketing)/privacy/page.tsx`
11. `TermsOfService.jsx` → `app/(marketing)/terms/page.tsx`
12. **NEW:** Careers → `app/(marketing)/careers/page.tsx`

---

## Target Architecture

### Tech Stack (Target)
| Layer | Technology |
|-------|------------|
| Framework | Next.js 16+ (App Router) |
| Language | TypeScript 5.x (strict mode) |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui + Radix primitives |
| Animation | Framer Motion 12 + View Transitions API |
| Images | Next.js `<Image>` component |
| Forms | Server Actions + React Hook Form + Zod |
| Icons | Tabler Icons + Lucide React |
| Theming | next-themes |
| SEO | JSON-LD structured data |

### Directory Structure (Target)

```
v2/                             # Next.js project root
├── app/                        # App Router
│   ├── (marketing)/            # Public marketing pages (route group)
│   │   ├── layout.tsx          # Marketing layout (Navbar + Footer)
│   │   ├── page.tsx            # Home page (/)
│   │   ├── about/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── services/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── [slug]/         # Future: individual service pages
│   │   │       └── page.tsx
│   │   ├── caregivers/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── careers/            # NEW: Careers section
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx
│   │   │   └── apply/
│   │   │       └── page.tsx
│   │   ├── testimonials/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts      # Server Actions
│   │   ├── faqs/
│   │   │   └── page.tsx
│   │   ├── resources/
│   │   │   └── page.tsx
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   └── terms/
│   │       └── page.tsx
│   ├── (portal)/               # Future: authenticated portal
│   │   ├── layout.tsx          # Portal layout (sidebar)
│   │   ├── family/
│   │   ├── caregiver/
│   │   └── admin/
│   ├── api/                    # API routes (future)
│   │   └── careers/
│   │       └── apply/route.ts
│   ├── sitemap.ts              # Auto-generated sitemap
│   ├── robots.ts               # Robots.txt generation
│   ├── manifest.ts             # PWA manifest
│   ├── globals.css
│   ├── layout.tsx              # Root layout
│   ├── error.tsx               # Global error boundary
│   └── not-found.tsx           # 404 page
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── layout/
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── mobile-nav.tsx
│   │   ├── skip-link.tsx       # Accessibility
│   │   └── cookie-consent.tsx
│   ├── home/
│   │   ├── hero-section.tsx
│   │   └── trust-signals.tsx
│   ├── services/
│   │   ├── service-card.tsx
│   │   └── service-comparison.tsx
│   ├── caregivers/
│   │   └── caregiver-card.tsx
│   ├── careers/                # NEW: Careers components
│   │   ├── job-card.tsx
│   │   ├── job-listing.tsx
│   │   ├── application-form.tsx
│   │   └── benefits-section.tsx
│   ├── testimonials/
│   │   ├── testimonial-card.tsx
│   │   └── testimonials-grid.tsx
│   ├── chat/
│   │   ├── chat-widget.tsx
│   │   └── chat-widget-loader.tsx
│   ├── seo/
│   │   ├── json-ld.tsx
│   │   └── open-graph.tsx
│   └── shared/
│       ├── optimized-image.tsx
│       ├── section-heading.tsx
│       ├── loading-spinner.tsx
│       ├── motion-wrapper.tsx
│       └── focus-manager.tsx   # Accessibility
├── lib/
│   ├── utils.ts
│   ├── constants.ts
│   ├── a11y.ts                 # Accessibility utilities
│   ├── validations/
│   │   ├── contact-form.ts
│   │   └── job-application.ts
│   └── seo/
│       ├── metadata.ts
│       └── json-ld-schemas.ts
├── data/
│   ├── caregivers.ts
│   ├── services.ts
│   ├── jobs.ts                 # NEW: Job listings
│   ├── testimonials.ts
│   ├── faqs.ts
│   └── blur-placeholders.ts
├── hooks/
│   ├── use-caregiver-data.ts
│   ├── use-reduced-motion.ts
│   └── use-focus-trap.ts
├── types/
│   ├── index.ts
│   ├── caregiver.ts
│   ├── service.ts
│   ├── job.ts                  # NEW: Job types
│   ├── application.ts          # NEW: Application types
│   └── testimonial.ts
├── prisma/                     # Future: database schema
│   └── schema.prisma
├── public/
│   ├── home/
│   ├── about/
│   ├── services/
│   ├── caregivers/
│   ├── careers/                # NEW
│   └── testimonials/
├── scripts/
│   ├── generate-images.mjs
│   └── generate-icons.mjs
├── __tests__/
├── .github/
│   ├── copilot-instructions.md
│   └── workflows/
│       └── ci.yml
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── components.json
├── package.json
└── .env.local.example
```

---

## Sprint 1: Project Scaffolding

**Story Points:** 8  
**Dependencies:** None  
**Status:** ✅ Complete

### Sprint Goals
- Initialize Next.js 16 project with TypeScript strict mode
- Configure Tailwind CSS 4 with design tokens
- Set up shadcn/ui with custom theme
- Establish path aliases and project structure
- Configure ESLint + Prettier + Husky

### Tasks

| ID | Task | Points | Status |
|----|------|--------|--------|
| 1.1 | Initialize Next.js 16 project in `v2/` directory | 1 | ✅ |
| 1.2 | Configure TypeScript with `strict: true` and enhanced checks | 1 | ✅ |
| 1.3 | Install and configure Tailwind CSS 4 | 1 | ✅ |
| 1.4 | Initialize shadcn/ui with custom theme | 2 | ✅ |
| 1.5 | Set up path aliases (`@/components`, etc.) | 1 | ✅ |
| 1.6 | Configure ESLint + Prettier | 1 | ✅ |
| 1.7 | Set up Husky + lint-staged pre-commit hooks | 1 | ⬜ |
| 1.8 | Create base `layout.tsx` with metadata | 1 | ✅ |
| 1.9 | Set up environment variables structure | 0.5 | ✅ |
| 1.10 | Create `.github/copilot-instructions.md` | 0.5 | ✅ |

### Acceptance Criteria

- [x] `pnpm dev` starts Next.js dev server on `localhost:3000`
- [x] TypeScript compilation passes with `strict: true`
- [x] Tailwind CSS classes render correctly in browser
- [x] shadcn/ui CLI works without errors
- [x] Path imports resolve correctly
- [x] ESLint runs without configuration errors
- [x] Base layout renders with test content
- [x] `.env.local.example` file exists with documented variables
- [ ] Pre-commit hooks run lint + format on staged files

---

## Sprint 2: Design System Migration

**Story Points:** 13  
**Dependencies:** Sprint 1 complete  
**Status:** ✅ Complete

### Sprint Goals
- Migrate all CSS custom properties from legacy global.css
- Configure Tailwind theme extensions for brand colors
- Set up dark mode with next-themes
- Create glass morphism and gradient utilities
- Configure responsive breakpoints

### Tasks

| ID | Task | Points | Status |
|----|------|--------|--------|
| 2.1 | Extract CSS variables to `globals.css` | 2 | ✅ |
| 2.2 | Map color tokens to Tailwind config | 2 | ✅ |
| 2.3 | Configure typography scale in Tailwind | 1 | ✅ |
| 2.4 | Set up spacing/sizing system | 1 | ✅ |
| 2.5 | Configure shadcn/ui theme colors | 2 | ✅ |
| 2.6 | Implement dark mode with next-themes | 2 | ✅ |
| 2.7 | Create AnimatedThemeToggle component | 1 | ✅ |
| 2.8 | Migrate glass morphism effects | 1 | ✅ |
| 2.9 | Set up responsive breakpoints (`xs` through `3xl`) | 0.5 | ✅ |
| 2.10 | Create gradient utility classes | 0.5 | ✅ |

### Acceptance Criteria

- [x] All 35+ CSS custom properties migrated to `globals.css`
- [x] `tailwind.config.ts` extends theme with custom colors
- [x] Typography classes (`text-xs` through `text-5xl`) match original sizes
- [x] Gradient utilities (`bg-accent-rose-gradient`) work correctly
- [x] Dark mode toggle changes CSS variables appropriately
- [x] Glass morphism effects (`glass`, `glass-bg`, `glass-border`) render correctly
- [x] Responsive breakpoints match original (`xs: 480px`, etc.)
- [x] shadcn/ui components inherit custom theme colors

---

## Sprint 3: Core Components Migration

**Story Points:** 21  
**Dependencies:** Sprint 2 complete  
**Status:** ✅ Complete

### Sprint Goals
- Install all required shadcn/ui primitives
- Migrate Navbar with mobile Sheet menu
- Migrate Footer with all links and contact info
- Create reusable card components (Service, Testimonial, Caregiver)
- Implement accessibility utilities (skip link, focus management)

### Tasks

| ID | Task | Points | Status |
|----|------|--------|--------|
| 3.1 | Install remaining shadcn/ui components | 1 | ✅ |
| 3.2 | Migrate `Navbar` → `navbar.tsx` with Sheet mobile menu | 3 | ✅ |
| 3.3 | Create `SkipLink` accessibility component | 1 | ✅ |
| 3.4 | Migrate `Footer` → `footer.tsx` | 2 | ✅ |
| 3.5 | Create `ServiceCard` component | 2 | ✅ |
| 3.6 | Create `TestimonialCard` component | 2 | ✅ |
| 3.7 | Create `CaregiverCard` component | 2 | ✅ |
| 3.8 | Migrate FAQ accordion component | 2 | ✅ |
| 3.9 | Create `Logo` component with responsive variants | 1 | ✅ |
| 3.10 | Create `LoadingSpinner` and `Skeleton` patterns | 1 | ✅ |
| 3.11 | Create TypeScript interfaces for all props | 2 | ✅ |
| 3.12 | Create accessibility utilities (`lib/a11y.ts`) | 2 | ✅ |

### shadcn/ui Components Installed

```bash
# Already installed
button, card, accordion, dialog, sheet, avatar, badge, 
input, textarea, label, separator, skeleton, tooltip, carousel,
alert-dialog, dropdown-menu, select, combobox, field, input-group
```

### Component Mapping

| Original Component | Target Component | shadcn Base |
|--------------------|------------------|-------------|
| `NavbarHeadlessUI.jsx` | `layout/navbar.tsx` | Sheet (mobile) |
| `FooterHeadlessUI.jsx` | `layout/footer.tsx` | Custom |
| `ThemeToggleHeadlessUI.jsx` | `ui/animated-theme-toggle.tsx` | Button + motion |
| `ServiceCard.jsx` | `services/service-card.tsx` | Card |
| `TestimonialCard.jsx` | `testimonials/testimonial-card.tsx` | Card |
| `CaregiverCard.jsx` | `caregivers/caregiver-card.tsx` | Card + Avatar |
| `FAQSection.jsx` | `faqs/faq-accordion.tsx` | Accordion |

### Accessibility Utilities (`lib/a11y.ts`)

```typescript
// lib/a11y.ts - to be created
export const prefersReducedMotion = () => 
  typeof window !== 'undefined' && 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const announceToScreenReader = (message: string) => {
  const el = document.createElement('div');
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-atomic', 'true');
  el.className = 'sr-only';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
};

export const focusMainContent = () => {
  const main = document.querySelector('main');
  if (main) {
    main.setAttribute('tabindex', '-1');
    main.focus();
    main.removeAttribute('tabindex');
  }
};
```

### Acceptance Criteria

- [x] All required shadcn/ui base components installed
- [x] `Navbar` renders with logo, links, mobile menu, theme toggle
- [x] Mobile navigation uses shadcn `Sheet` component
- [x] `Footer` renders all links, contact info, social icons
- [x] Skip link appears on focus and jumps to main content
- [x] `ServiceCard` displays icon, title, description with hover effects
- [x] `TestimonialCard` shows avatar, name, quote, rating
- [x] FAQ accordion expands/collapses with ARIA attributes
- [x] All components have TypeScript interfaces defined
- [x] No HeadlessUI imports remain in migrated components
- [ ] All components pass accessibility audit (axe-core)
- [ ] `prefers-reduced-motion` respected for animations

---

## Sprint 4: Page Migration (Marketing)

**Story Points:** 21  
**Dependencies:** Sprint 3 complete  
**Status:** ✅ Complete

### Sprint Goals
- Set up route groups `(marketing)` structure
- Migrate all public marketing pages
- Implement loading states with `loading.tsx`
- Add metadata exports for SEO
- Implement Server Actions for contact form

### Tasks

| ID | Task | Points | Status |
|----|------|--------|--------|
| 4.1 | Create `(marketing)` route group with layout | 2 | ✅ |
| 4.2 | Migrate Home page with hero section | 3 | ✅ |
| 4.3 | Add `loading.tsx` for each route | 1 | ✅ |
| 4.4 | Migrate About page | 2 | ✅ |
| 4.5 | Migrate Services page | 2 | ✅ |
| 4.6 | Migrate Caregivers page | 2 | ✅ |
| 4.7 | Migrate Testimonials page | 2 | ✅ |
| 4.8 | Migrate Contact page with Server Actions | 3 | ✅ |
| 4.9 | Migrate FAQs page | 1 | ✅ |
| 4.10 | Migrate Resources page | 1 | ✅ |
| 4.11 | Migrate Privacy Policy page | 0.5 | ✅ |
| 4.12 | Migrate Terms of Service page | 0.5 | ✅ |
| 4.13 | Add metadata exports to all pages | 1 | ✅ |

### Server Actions Pattern (Contact Form)

```typescript
// app/(marketing)/contact/actions.ts
'use server'

import { z } from 'zod';
import { contactFormSchema } from '@/lib/validations/contact-form';

export type ContactFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const validated = contactFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    message: formData.get('message'),
    honeypot: formData.get('website'), // Spam protection
  });

  if (!validated.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      errors: validated.error.flatten().fieldErrors,
    };
  }

  // Spam check
  if (validated.data.honeypot) {
    return { success: true, message: 'Thank you!' }; // Silently ignore
  }

  // TODO: Send email, save to database
  // await sendEmail(validated.data);
  
  return {
    success: true,
    message: "Thank you! We'll be in touch within 24 hours.",
  };
}
```

### Acceptance Criteria

- [x] Route group `(marketing)` created with shared layout
- [x] All 12 pages render at correct routes
- [x] Root layout includes Navbar and Footer via `app/layout.tsx`
- [x] Home page hero section renders with correct styling
- [x] Each route has a `loading.tsx` with Skeleton UI
- [x] All internal links use Next.js `<Link>` component
- [x] Contact form uses Server Actions with progressive enhancement
- [x] Contact form has honeypot spam protection
- [x] Form shows loading state during submission
- [x] Each page has `metadata` export for SEO
- [x] No React Router imports remain
- [ ] Console shows no hydration errors
- [x] Pages are Server Components where possible

---

## Sprint 5: Careers Section & Backend Foundation

**Story Points:** 21  
**Dependencies:** Sprint 3 complete  
**Status:** ✅ Complete  
**Priority:** 🔴 HIGH

### Sprint Goals
- Create Careers page with job listings
- Design backend-compatible data structures (Prisma-ready)
- Implement job application flow with Server Actions
- Create reusable job card and application form components
- Prepare types for future database integration

### Tasks

| ID | Task | Points | Status |
|----|------|--------|--------|
| 5.1 | Design Job and Application TypeScript types | 2 | ✅ |
| 5.2 | Create job listings data file (`data/jobs.ts`) | 2 | ✅ |
| 5.3 | Create `JobCard` component | 2 | ✅ |
| 5.4 | Create `JobListing` full-page component | 2 | ✅ |
| 5.5 | Create `BenefitsSection` component | 1 | ✅ |
| 5.6 | Create Careers landing page | 2 | ✅ |
| 5.7 | Create individual job page `[slug]/page.tsx` | 2 | ✅ |
| 5.8 | Design ApplicationForm component | 3 | ✅ |
| 5.9 | Implement job application Server Action | 3 | ✅ |
| 5.10 | Create application confirmation page/modal | 1 | ✅ |
| 5.11 | Draft Prisma schema for jobs & applications | 1 | ✅ |

### Data Types (Backend-Compatible)

```typescript
// types/job.ts
export interface Job {
  id: string;
  slug: string;
  title: string;
  department: 'caregiving' | 'administrative' | 'nursing';
  type: 'full-time' | 'part-time' | 'per-diem';
  location: string;
  salaryRange: {
    min: number;
    max: number;
    period: 'hourly' | 'annual';
  };
  description: string;
  responsibilities: string[];
  qualifications: {
    required: string[];
    preferred: string[];
  };
  benefits: string[];
  isActive: boolean;
  postedAt: Date;
  closesAt?: Date;
  // Relations (for future DB)
  applications?: Application[];
}

// types/application.ts
export interface Application {
  id: string;
  jobId: string;
  status: 'pending' | 'reviewing' | 'interview' | 'offered' | 'rejected' | 'hired';
  applicant: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  experience: {
    yearsOfExperience: number;
    certifications: string[];
    previousEmployers?: {
      name: string;
      role: string;
      duration: string;
    }[];
  };
  availability: {
    startDate: Date;
    shifts: ('morning' | 'afternoon' | 'evening' | 'overnight')[];
    hoursPerWeek: number;
  };
  documents: {
    resumeUrl?: string;
    coverLetterUrl?: string;
    certificationsUrls?: string[];
  };
  references?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }[];
  additionalInfo?: string;
  submittedAt: Date;
  updatedAt: Date;
}
```

### Draft Prisma Schema

```prisma
// prisma/schema.prisma (draft for future)
model Job {
  id              String        @id @default(cuid())
  slug            String        @unique
  title           String
  department      Department
  type            JobType
  location        String
  salaryMin       Int
  salaryMax       Int
  salaryPeriod    SalaryPeriod
  description     String        @db.Text
  responsibilities String[]
  qualificationsReq String[]
  qualificationsPref String[]
  benefits        String[]
  isActive        Boolean       @default(true)
  postedAt        DateTime      @default(now())
  closesAt        DateTime?
  applications    Application[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model Application {
  id              String            @id @default(cuid())
  job             Job               @relation(fields: [jobId], references: [id])
  jobId           String
  status          ApplicationStatus @default(PENDING)
  firstName       String
  lastName        String
  email           String
  phone           String
  yearsExperience Int
  certifications  String[]
  availableStart  DateTime
  shifts          Shift[]
  hoursPerWeek    Int
  resumeUrl       String?
  coverLetterUrl  String?
  additionalInfo  String?           @db.Text
  submittedAt     DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
}

enum Department {
  CAREGIVING
  ADMINISTRATIVE
  NURSING
}

enum JobType {
  FULL_TIME
  PART_TIME
  PER_DIEM
}

enum SalaryPeriod {
  HOURLY
  ANNUAL
}

enum ApplicationStatus {
  PENDING
  REVIEWING
  INTERVIEW
  OFFERED
  REJECTED
  HIRED
}

enum Shift {
  MORNING
  AFTERNOON
  EVENING
  OVERNIGHT
}
```

### Sample Job Data

```typescript
// data/jobs.ts
import { Job } from '@/types/job';

export const jobs: Job[] = [
  {
    id: '1',
    slug: 'certified-home-health-aide',
    title: 'Certified Home Health Aide (HHA)',
    department: 'caregiving',
    type: 'full-time',
    location: 'Lowell, MA & Surrounding Areas',
    salaryRange: { min: 18, max: 22, period: 'hourly' },
    description: 'Join our compassionate team providing in-home care to seniors...',
    responsibilities: [
      'Assist clients with activities of daily living (ADLs)',
      'Provide companionship and emotional support',
      'Perform light housekeeping and meal preparation',
      'Document care provided and report changes in client condition',
      'Maintain client confidentiality and dignity',
    ],
    qualifications: {
      required: [
        'Valid HHA certification in Massachusetts',
        'CPR/First Aid certification',
        'Reliable transportation',
        'Pass CORI background check',
        'Ability to lift up to 50 lbs',
      ],
      preferred: [
        '1+ years of home care experience',
        'Experience with dementia/Alzheimer\'s care',
        'Bilingual (Spanish, Portuguese, or Khmer)',
      ],
    },
    benefits: [
      'Competitive hourly rates ($18-$22/hour)',
      'Flexible scheduling',
      'Paid training and ongoing education',
      'Health insurance for full-time employees',
      'Paid time off',
      'Referral bonuses',
      'Supportive team environment',
    ],
    isActive: true,
    postedAt: new Date('2026-01-15'),
  },
  // Additional jobs...
];
```

### Acceptance Criteria

- [x] Job and Application TypeScript types created
- [x] Types are Prisma-schema compatible (normalized, proper relations)
- [x] Careers landing page displays all active job listings
- [x] Individual job pages render at `/careers/[slug]`
- [x] `JobCard` shows title, type, location, salary range
- [x] `BenefitsSection` highlights employee benefits
- [x] Application form validates all required fields
- [x] Application form uses Server Action for submission
- [x] File upload UI prepared (actual upload deferred to backend phase)
- [x] Application confirmation shown after submission
- [x] Draft Prisma schema documented for future reference
- [x] SEO metadata for careers pages

---

## Sprint 6: SEO & Structured Data

**Story Points:** 13  
**Dependencies:** Sprint 4 complete  
**Status:** ⬜ Not Started

### Sprint Goals
- Implement JSON-LD structured data for all page types
- Create auto-generated sitemap and robots.txt
- Add Open Graph images
- Implement canonical URLs
- Create local SEO landing pages structure

### Tasks

| ID | Task | Points | Status |
|----|------|--------|--------|
| 6.1 | Create JSON-LD schema utilities | 2 | ⬜ |
| 6.2 | Add LocalBusiness schema to home page | 1 | ⬜ |
| 6.3 | Add Service schemas to services page | 1 | ⬜ |
| 6.4 | Add FAQPage schema to FAQs page | 1 | ⬜ |
| 6.5 | Add JobPosting schemas to careers pages | 2 | ⬜ |
| 6.6 | Add Review schemas to testimonials | 1 | ⬜ |
| 6.7 | Create `app/sitemap.ts` for auto-generation | 1 | ⬜ |
| 6.8 | Create `app/robots.ts` | 0.5 | ⬜ |
| 6.9 | Create Open Graph image generation | 2 | ⬜ |
| 6.10 | Add canonical URLs to all pages | 0.5 | ⬜ |
| 6.11 | Create service area page structure | 1 | ⬜ |

### JSON-LD Components

```typescript
// components/seo/json-ld.tsx
import { Organization, LocalBusiness, Service, FAQPage, JobPosting } from 'schema-dts';

interface JsonLdProps {
  data: Organization | LocalBusiness | Service | FAQPage | JobPosting;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// lib/seo/json-ld-schemas.ts
export const organizationSchema: Organization = {
  '@type': 'Organization',
  name: 'Angel Touch Homecare Services',
  url: 'https://angeltouch.services',
  logo: 'https://angeltouch.services/logo.png',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-XXX-XXX-XXXX',
    contactType: 'customer service',
  },
  sameAs: [
    'https://facebook.com/angeltouchhomecare',
    'https://instagram.com/angeltouchhomecare',
    'https://linkedin.com/company/angeltouchhomecare',
  ],
};

export const localBusinessSchema: LocalBusiness = {
  '@type': 'HomeHealthCareService',
  '@id': 'https://angeltouch.services/#organization',
  name: 'Angel Touch Homecare Services',
  description: 'Compassionate non-medical home care services for seniors',
  url: 'https://angeltouch.services',
  telephone: '+1-XXX-XXX-XXXX',
  priceRange: '$28-$35/hour',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Main Street',
    addressLocality: 'Lowell',
    addressRegion: 'MA',
    postalCode: '01852',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 42.6334,
    longitude: -71.3162,
  },
  areaServed: [
    { '@type': 'City', name: 'Lowell' },
    { '@type': 'City', name: 'Dracut' },
    { '@type': 'City', name: 'Chelmsford' },
    { '@type': 'City', name: 'Tewksbury' },
    { '@type': 'City', name: 'Billerica' },
  ],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
};

export function createJobPostingSchema(job: Job): JobPosting {
  return {
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.postedAt.toISOString(),
    validThrough: job.closesAt?.toISOString(),
    employmentType: job.type.toUpperCase().replace('-', '_'),
    hiringOrganization: organizationSchema,
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Lowell',
        addressRegion: 'MA',
        addressCountry: 'US',
      },
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salaryRange.min,
        maxValue: job.salaryRange.max,
        unitText: job.salaryRange.period === 'hourly' ? 'HOUR' : 'YEAR',
      },
    },
  };
}
```

### Sitemap Generation

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { jobs } from '@/data/jobs';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://angeltouch.services';
  
  const staticPages = [
    '', '/about', '/services', '/caregivers', '/testimonials',
    '/contact', '/faqs', '/resources', '/careers', '/privacy', '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const jobPages = jobs
    .filter((job) => job.isActive)
    .map((job) => ({
      url: `${baseUrl}/careers/${job.slug}`,
      lastModified: job.postedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  return [...staticPages, ...jobPages];
}
```

### Acceptance Criteria

- [ ] JSON-LD structured data renders in page source
- [ ] LocalBusiness schema includes all required fields
- [ ] Service schemas match offered services
- [ ] FAQPage schema includes all FAQ items
- [ ] JobPosting schemas for all active jobs
- [ ] `sitemap.xml` auto-generates at `/sitemap.xml`
- [ ] `robots.txt` properly configured at `/robots.txt`
- [ ] Open Graph images generate for key pages
- [ ] Canonical URLs present on all pages
- [ ] Schema validation passes (Google Rich Results Test)

---

## Sprint 7: Image System & Performance

**Story Points:** 13  
**Dependencies:** Sprint 4 complete  
**Status:** ⬜ Not Started

### Sprint Goals
- Create OptimizedImage wrapper component
- Migrate blur placeholder system
- Implement View Transitions API
- Optimize LCP with priority loading
- Configure caching headers

### Tasks

| ID | Task | Points | Status |
|----|------|--------|--------|
| 7.1 | Create `OptimizedImage` wrapper component | 2 | ⬜ |
| 7.2 | Migrate blur placeholder system (plaiceholder) | 2 | ⬜ |
| 7.3 | Update all image references in components | 2 | ⬜ |
| 7.4 | Configure `next.config.ts` image settings | 1 | ⬜ |
| 7.5 | Add `priority` to hero/above-fold images | 1 | ⬜ |
| 7.6 | Implement View Transitions API wrapper | 2 | ⬜ |
| 7.7 | Configure caching headers in `next.config.ts` | 1 | ⬜ |
| 7.8 | Set up bundle analyzer and optimize | 1 | ⬜ |
| 7.9 | Run Lighthouse audit and fix issues | 1 | ⬜ |

### View Transitions API Wrapper

```typescript
// components/shared/view-transition.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useTransition } from 'react';

export function useViewTransition() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (href: string) => {
      if (!document.startViewTransition) {
        startTransition(() => router.push(href));
        return;
      }

      document.startViewTransition(() => {
        startTransition(() => router.push(href));
      });
    },
    [router, startTransition]
  );

  return { navigate, isPending };
}
```

### Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| Lighthouse Best Practices | ≥ 95 |
| Lighthouse SEO | ≥ 95 |
| LCP | < 2.5s |
| FID/INP | < 200ms |
| CLS | < 0.1 |
| Main bundle (gzipped) | < 100kB |

### Acceptance Criteria

- [ ] `OptimizedImage` wrapper created with TypeScript
- [ ] Blur placeholders generated at build time
- [ ] Hero images use `priority` prop
- [ ] All images lazy-load by default
- [ ] View Transitions work in supported browsers
- [ ] No broken image links
- [ ] Lighthouse Performance ≥ 90
- [ ] Bundle size tracked in CI

---

## Sprint 8: Features & Interactivity

**Story Points:** 13  
**Dependencies:** Sprint 5, Sprint 7 complete  
**Status:** ⬜ Not Started

### Sprint Goals
- Migrate Chat widget with deferred loading
- Implement testimonials display (grid instead of carousel)
- Add cookie consent banner
- Implement form validation patterns
- Add motion animations with reduced-motion support

### Tasks

| ID | Task | Points | Status |
|----|------|--------|--------|
| 8.1 | Migrate `ChatWidget` with lazy loading | 3 | ⬜ |
| 8.2 | Create testimonials grid (replace carousel) | 2 | ⬜ |
| 8.3 | Create `CookieConsent` component | 2 | ⬜ |
| 8.4 | Implement `MotionWrapper` with reduced-motion | 2 | ⬜ |
| 8.5 | Add form validation patterns library | 1 | ⬜ |
| 8.6 | Create care assessment quiz component | 2 | ⬜ |
| 8.7 | Add inline testimonials to service pages | 1 | ⬜ |

### Motion Wrapper with Reduced Motion

```typescript
// components/shared/motion-wrapper.tsx
'use client';

import { motion, MotionProps } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface MotionWrapperProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
}

export function MotionWrapper({ 
  children, 
  className,
  initial,
  animate,
  transition,
  ...props 
}: MotionWrapperProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      animate={animate}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

### Acceptance Criteria

- [ ] Chat widget loads after 5s idle or user interaction
- [ ] Testimonials display in responsive grid
- [ ] Cookie consent banner appears for new visitors
- [ ] Cookie preferences stored in localStorage
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Form validation provides clear error messages
- [ ] All interactive components have `'use client'`

---

## Sprint 9: Testing & Accessibility

**Story Points:** 13  
**Dependencies:** Sprint 8 complete  
**Status:** ⬜ Not Started

### Sprint Goals
- Set up Vitest + React Testing Library
- Add accessibility tests with axe-core
- Create component unit tests
- Run cross-browser testing
- Fix all accessibility violations

### Tasks

| ID | Task | Points | Status |
|----|------|--------|--------|
| 9.1 | Set up Vitest + React Testing Library | 2 | ⬜ |
| 9.2 | Add accessibility testing with axe-core | 2 | ⬜ |
| 9.3 | Create component unit tests | 3 | ⬜ |
| 9.4 | Create form integration tests | 2 | ⬜ |
| 9.5 | Run accessibility audit (manual + automated) | 2 | ⬜ |
| 9.6 | Fix all critical accessibility violations | 2 | ⬜ |

### Test Coverage Requirements

| Area | Minimum Coverage |
|------|------------------|
| Components | 70% |
| Hooks | 80% |
| Utils | 90% |
| Forms | 80% |
| Server Actions | 80% |

### Accessibility Checklist

- [ ] Skip link functional
- [ ] All images have alt text
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators visible
- [ ] Form inputs have labels
- [ ] Error messages announced to screen readers
- [ ] Modals trap focus
- [ ] ARIA attributes correct
- [ ] Landmark regions properly used

### Acceptance Criteria

- [ ] Vitest configured with TypeScript
- [ ] All tests pass
- [ ] No critical accessibility violations (axe-core)
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Mobile responsive on iOS Safari and Android Chrome
- [ ] Test coverage meets minimums

---

## Sprint 10: Deployment & Cutover

**Story Points:** 8  
**Dependencies:** Sprint 9 complete  
**Status:** ⬜ Not Started

### Sprint Goals
- Configure Netlify/Vercel deployment
- Set up CI/CD with GitHub Actions
- Configure error monitoring (Sentry)
- Set up analytics (privacy-focused)
- Execute production deployment

### Tasks

| ID | Task | Points | Status |
|----|------|--------|--------|
| 10.1 | Configure Vercel project | 1 | ⬜ |
| 10.2 | Set up GitHub Actions CI | 2 | ⬜ |
| 10.3 | Configure Sentry error monitoring | 1 | ⬜ |
| 10.4 | Set up Plausible/Fathom analytics | 1 | ⬜ |
| 10.5 | Deploy to staging environment | 1 | ⬜ |
| 10.6 | Full regression test on staging | 1 | ⬜ |
| 10.7 | Production deployment | 0.5 | ⬜ |
| 10.8 | Post-deploy monitoring | 0.5 | ⬜ |

### GitHub Actions CI

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, trunk]
  pull_request:
    branches: [main, trunk]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build

  lighthouse:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './lighthouserc.json'
```

### Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Build succeeds in CI/CD
- [ ] Staging deployment works
- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] Images load from CDN
- [ ] SSL certificate valid
- [ ] Redirects configured
- [ ] Analytics tracking verified
- [ ] Error monitoring active
- [ ] Lighthouse scores meet targets

### Acceptance Criteria

- [ ] Production deployment successful
- [ ] All pages accessible
- [ ] Contact form functional
- [ ] Job application form functional
- [ ] No console errors in production
- [ ] Lighthouse scores meet targets
- [ ] Error monitoring receiving events
- [ ] Analytics tracking pageviews

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| HeadlessUI → shadcn/ui feature gaps | Medium | Medium | Audit features; create custom components if needed |
| CSS Module migration complexity | Medium | High | Gradual migration; keep CSS Modules initially if needed |
| Image system breaking changes | Low | High | Thorough testing; fallback to `<img>` if needed |
| Hydration mismatches | Medium | Medium | Careful use of `'use client'`; avoid window/document in SSR |
| Build time increase | Low | Low | Use Next.js caching; optimize image generation |
| SEO ranking changes | Low | Medium | Implement proper redirects; verify meta tags |
| Job application data security | Medium | High | Validate server-side; prepare for encrypted storage |
| Accessibility regressions | Medium | High | Automated a11y tests in CI; manual audit each sprint |

---

## File Mapping Reference

### Pages

| Source (src/pages/) | Target (v2/app/) |
|---------------------|------------------------|
| `Home.jsx` | `(marketing)/page.tsx` |
| `AboutHeadlessUI.jsx` | `(marketing)/about/page.tsx` |
| `ServicesHeadlessUI.jsx` | `(marketing)/services/page.tsx` |
| `CaregiversHeadlessUI.jsx` | `(marketing)/caregivers/page.tsx` |
| `TestimonialsHeadlessUI.jsx` | `(marketing)/testimonials/page.tsx` |
| `Contact.jsx` | `(marketing)/contact/page.tsx` |
| `FAQs-HeadlessUI.jsx` | `(marketing)/faqs/page.tsx` |
| `ResourcesHeadlessUI.jsx` | `(marketing)/resources/page.tsx` |
| `ClientPortalHeadlessUI.jsx` | `(portal)/client/page.tsx` |
| `PrivacyPolicy.jsx` | `(marketing)/privacy/page.tsx` |
| `TermsOfService.jsx` | `(marketing)/terms/page.tsx` |
| **NEW** | `(marketing)/careers/page.tsx` |
| **NEW** | `(marketing)/careers/[slug]/page.tsx` |
| **NEW** | `(marketing)/careers/apply/page.tsx` |

### Components

| Source (src/components/) | Target (v2/components/) |
|--------------------------|-------------------------------|
| `NavbarHeadlessUI.jsx` | `layout/navbar.tsx` |
| `FooterHeadlessUI.jsx` | `layout/footer.tsx` |
| `ThemeToggleHeadlessUI.jsx` | `ui/animated-theme-toggle.tsx` |
| `ServiceCard.jsx` | `services/service-card.tsx` |
| `TestimonialCard.jsx` | `testimonials/testimonial-card.tsx` |
| `CaregiverCard.jsx` | `caregivers/caregiver-card.tsx` |
| `ChatWidget.jsx` | `chat/chat-widget.tsx` |
| `FAQSection.jsx` | `faqs/faq-accordion.tsx` |
| `ResponsiveImage.jsx` | `shared/optimized-image.tsx` |
| **NEW** | `careers/job-card.tsx` |
| **NEW** | `careers/application-form.tsx` |
| **NEW** | `careers/benefits-section.tsx` |
| **NEW** | `seo/json-ld.tsx` |
| **NEW** | `layout/skip-link.tsx` |
| **NEW** | `layout/cookie-consent.tsx` |

### Data

| Source (src/data/) | Target (v2/data/) |
|--------------------|-------------------------|
| `caregivers.data.js` | `caregivers.ts` |
| `image-blur-placeholders.json` | `blur-placeholders.ts` |
| **NEW** | `jobs.ts` |
| **NEW** | `services.ts` |
| **NEW** | `testimonials.ts` |
| **NEW** | `faqs.ts` |

---

## Appendix

### Commands Reference

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format with Prettier
pnpm type-check       # TypeScript check
pnpm test             # Run tests
pnpm test:coverage    # Run tests with coverage

# shadcn/ui
pnpm dlx shadcn@latest add <component>

# Database (future)
pnpm prisma generate  # Generate Prisma client
pnpm prisma migrate   # Run migrations
pnpm prisma studio    # Open Prisma Studio
```

### Environment Variables

```bash
# .env.local.example
# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Angel Touch Homecare Services"

# Analytics (optional)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# Contact Form
CONTACT_EMAIL_TO=
RESEND_API_KEY=

# Error Monitoring
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# Database (future)
DATABASE_URL=

# File Storage (future)
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
```

---

**Document Version:** 2.0  
**Last Updated:** January 27, 2026  
**Author:** Development Team
