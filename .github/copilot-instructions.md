# Copilot Instructions – Angel Touch Homecare Services

> **Purpose:** This document serves as the canonical blueprint and development guide for AI agents (GitHub Copilot, Claude, etc.) working on the Angel Touch Homecare Services web application. It ensures consistency, quality, and alignment with business goals across all development sprints.

---

## Table of Contents

1. [Business Context](#business-context)
2. [Technical Architecture](#technical-architecture)
3. [Development Guidelines](#development-guidelines)
4. [Migration & Refactoring Rules](#migration--refactoring-rules)
5. [Code Standards](#code-standards)
6. [Component Patterns](#component-patterns)
7. [Accessibility Requirements](#accessibility-requirements)
8. [Security & Compliance](#security--compliance)
9. [Documentation Requirements](#documentation-requirements)
10. [Git & Commit Guidelines](#git--commit-guidelines)
11. [Testing Standards](#testing-standards)
12. [Future Roadmap Context](#future-roadmap-context)

---

## Business Context

### Company Overview

**Angel Touch Homecare Services** is a Massachusetts-based home care agency providing compassionate, non-medical in-home care services to seniors and individuals with disabilities.

- **Headquarters:** Lowell, Massachusetts
- **Service Area:** Lowell, Dracut, Chelmsford, Tewksbury, Billerica (expanding)
- **Tagline:** "Compassion in Every Touch"

### Mission Statement

To provide compassionate, reliable, and personalized non-medical in-home care services that enhance the quality of life for seniors and individuals with disabilities in Lowell, Massachusetts and surrounding communities.

### Core Services

| Service Category | Description |
|------------------|-------------|
| Personal Care | Bathing, toileting, dressing, grooming assistance |
| Companionship | Social interaction, supervision, emotional support |
| Meal Services | Meal planning, preparation, feeding assistance |
| Household Support | Light housekeeping, laundry, organization |
| Transportation | Escort to appointments, errands, social outings |
| Medication Reminders | Non-medical medication schedule support |

### Future Services (Roadmap)

- Dementia and Alzheimer's specialized care
- 24-hour live-in care
- Post-hospitalization transition services
- Respite care packages

### Target Users

| User Type | Description | Primary Needs |
|-----------|-------------|---------------|
| **Seniors (65+)** | Primary care recipients, often living alone | Easy navigation, large text, clear CTAs |
| **Family Members** | Adult children, spouses managing care | Care updates, scheduling, communication |
| **Caregivers** | Agency staff providing in-home services | Schedules, client info, documentation |
| **Healthcare Partners** | Hospitals, discharge planners, social workers | Referral process, service information |
| **Administrators** | Agency management and office staff | Client management, reporting, compliance |

### Brand Guidelines

| Element | Specification |
|---------|---------------|
| **Primary Colors** | Pastel blues (`#2563eb`, `#dbeafe`), soft rose/gold (`#E7A9B6`), navy (`#1a2332`) |
| **Accent Colors** | Teal/green (`#059669`), white, warm neutrals |
| **Typography** | Nunito (headings), Inter (body text) |
| **Tone** | Warm, professional, reassuring, accessible |
| **Imagery** | Authentic caregiving moments, diverse representation, warmth |

### Pricing Model (Reference)

- Hourly: $28–$35/hour
- Weekly Package: 20 hours @ $650
- Monthly Plan: 80 hours @ $2,500
- Subscription discounts for extended engagements

---

## Technical Architecture

### Current Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 16+ (App Router) | React 19, Server Components |
| Language | TypeScript 5.x | Strict mode enabled |
| Styling | Tailwind CSS 4 | CSS variables, custom theme |
| UI Components | shadcn/ui + Radix primitives | Accessible, composable |
| Animation | Framer Motion (motion/react) | Page transitions, micro-interactions |
| Theming | next-themes | Light/dark mode, system preference |
| Forms | React Hook Form + Zod | Type-safe validation |
| Icons | Tabler Icons, Lucide React | Consistent iconography |

### Planned Stack (Fullstack Evolution)

| Layer | Technology | Purpose |
|-------|------------|---------|
| Database | PostgreSQL / Supabase | Client records, scheduling, audit logs |
| ORM | Prisma / Drizzle | Type-safe database access |
| Auth | NextAuth.js / Clerk | Multi-role authentication |
| API | Next.js API Routes / tRPC | Type-safe API layer |
| File Storage | S3 / Cloudflare R2 | Documents, care plans, images |
| Email | Resend / SendGrid | Notifications, confirmations |
| SMS | Twilio | Appointment reminders |
| Payments | Stripe | Invoicing, subscriptions |
| Analytics | PostHog / Plausible | Privacy-focused analytics |

### Directory Structure

```
v2/
├── app/                    # Next.js App Router (routes only)
│   ├── (marketing)/        # Public pages (home, about, services)
│   ├── (portal)/           # Authenticated portal routes
│   │   ├── family/         # Family member dashboard
│   │   ├── caregiver/      # Caregiver portal
│   │   └── admin/          # Admin dashboard
│   ├── api/                # API routes
│   ├── layout.tsx
│   ├── globals.css
│   └── error.tsx
├── components/
│   ├── ui/                 # shadcn/ui base components
│   ├── layout/             # Navbar, Footer, Sidebar
│   ├── forms/              # Form components
│   ├── cards/              # Card variants
│   └── [feature]/          # Feature-specific components
├── lib/
│   ├── utils.ts            # Utility functions (cn, etc.)
│   ├── constants.ts        # App-wide constants
│   ├── validations/        # Zod schemas
│   └── api/                # API client utilities
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── data/                   # Static data, content
├── public/                 # Static assets
└── prisma/                 # Database schema (future)
```

---

## Development Guidelines

### General Principles

1. **User-First Design:** Every feature must consider the primary users—seniors and their families. Prioritize clarity, accessibility, and ease of use.

2. **Progressive Enhancement:** Core functionality must work without JavaScript where possible. Enhance with interactivity.

3. **Performance Budget:** Target Lighthouse scores of 90+ across all metrics. Optimize images, minimize bundle size, leverage Server Components.

4. **Mobile-First:** Design for mobile screens first, then enhance for larger viewports. Many family members check updates on phones.

5. **Accessibility (A11y):** WCAG 2.1 AA compliance minimum. Seniors and users with disabilities are primary users.

6. **Early Validation:** Wire up components to the live app on a rolling basis. Don't wait until all components are complete—integrate into layouts as soon as they pass lint/type checks to obtain early visual feedback.

6. **Type Safety:** Leverage TypeScript strictly. No `any` types without explicit justification.

7. **Server Components Default:** Use React Server Components by default. Add `'use client'` only when client-side interactivity is required.

### File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | kebab-case | `service-card.tsx` |
| Pages | `page.tsx` in route folder | `app/about/page.tsx` |
| Layouts | `layout.tsx` | `app/(portal)/layout.tsx` |
| Utilities | camelCase | `formatPhoneNumber.ts` |
| Types | PascalCase | `Caregiver.ts` |
| Hooks | camelCase with `use` prefix | `useCaregiverData.ts` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |

### Import Order

```typescript
// 1. React/Next.js
import * as React from "react";
import { type Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

// 2. Third-party libraries
import { motion } from "motion/react";
import { z } from "zod";

// 3. Internal aliases (@/)
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { type Caregiver } from "@/types";

// 4. Relative imports
import { ServiceCard } from "./service-card";

// 5. Styles (if any)
import "./styles.css";
```

---

## Migration & Refactoring Rules

### Core Principle

> **During migration, it is acceptable to refactor legacy implementations (structure, styling approach, component boundaries) to align with Next.js/App Router best practices, accessibility, performance, and maintainability — as long as user-facing behavior and content remain equivalent.**

### What This Means

| Aspect | Allowed Changes | Must Preserve |
|--------|-----------------|---------------|
| **Structure** | Reorganize components, split/merge files | Functional behavior |
| **Styling** | Convert CSS Modules → Tailwind utilities | Visual appearance |
| **Components** | Replace HeadlessUI → shadcn/ui | Interactive behavior |
| **State** | Refactor to Server Components where possible | Data flow correctness |
| **Routing** | React Router → Next.js App Router | URL structure, navigation |
| **Images** | Custom components → Next.js Image | Visual quality, responsiveness |

### Migration Checklist (Per Component/Page)

- [ ] Functional parity with original implementation
- [ ] Visual regression check (manual or automated)
- [ ] Accessibility audit (keyboard nav, screen reader, contrast)
- [ ] Performance check (no regressions in LCP, CLS, FID)
- [ ] TypeScript types added/verified
- [ ] Mobile responsiveness verified
- [ ] Dark mode support verified

### When NOT to Refactor

- If a refactor would significantly delay the migration timeline
- If the original implementation is already well-architected
- If the change introduces risk without clear benefit
- Document technical debt for future sprints instead

---

## Code Standards

### TypeScript

```typescript
// ✅ Good: Explicit types, interfaces for props
interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

export function ServiceCard({ title, description, icon: Icon, href }: ServiceCardProps) {
  // ...
}

// ❌ Bad: Implicit any, no interface
export function ServiceCard(props) {
  // ...
}
```

### React Components

```typescript
// ✅ Good: Server Component (default)
export function ServicesList() {
  const services = getServices(); // Can be async
  return <div>{/* ... */}</div>;
}

// ✅ Good: Client Component (when needed)
"use client";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  // Client-side interactivity required
}
```

### Tailwind CSS

```tsx
// ✅ Good: Semantic, readable classes
<div className="flex flex-col gap-4 rounded-lg bg-card p-6 shadow-card">

// ✅ Good: Using cn() for conditional classes
<button className={cn(
  "rounded-md px-4 py-2 font-medium transition-colors",
  variant === "primary" && "bg-primary text-primary-foreground",
  variant === "outline" && "border border-input bg-transparent",
  disabled && "pointer-events-none opacity-50"
)}>

// ❌ Bad: Excessive inline styles, magic values
<div style={{ marginTop: '23px', backgroundColor: '#1a2332' }}>
```

### Theme-Aware Colors (Critical)

Always use semantic color tokens that adapt to light/dark mode:

```tsx
// ✅ CORRECT: Theme-aware semantic tokens
<p className="text-foreground">Main text</p>
<p className="text-muted-foreground">Secondary text</p>
<div className="bg-background">Adapts to theme</div>
<div className="bg-muted">Secondary surface</div>
<div className="border-border">Theme-aware border</div>

// ✅ CORRECT: Foreground paired with matching background
<button className="bg-primary text-primary-foreground">CTA</button>
<div className="bg-secondary text-secondary-foreground">Badge</div>

// ❌ WRONG: Hardcoded colors in theme-adaptive components
<p className="text-white">Won't be visible on light bg</p>
<p className="text-primary-foreground">Wrong without bg-primary</p>
<div className="bg-white">Won't adapt to dark mode</div>

// ✅ EXCEPTION: Fixed-color sections (comment required)
// Footer intentionally stays dark in all themes
<footer className="bg-[#1a2332] text-white">
```

**Pairing Rule:** `text-*-foreground` tokens MUST be on their matching `bg-*`:
- `text-primary-foreground` → `bg-primary`
- `text-secondary-foreground` → `bg-secondary`
- `text-accent-foreground` → `bg-accent`
```

### Error Handling

```typescript
// ✅ Good: Graceful error boundaries and fallbacks
export default function ServicePage() {
  return (
    <Suspense fallback={<ServicesSkeleton />}>
      <ServicesContent />
    </Suspense>
  );
}

// ✅ Good: Type-safe error handling
const result = await fetchCaregivers();
if (!result.success) {
  return <ErrorMessage message={result.error} />;
}
```

---

## Component Patterns

### Compound Components

```tsx
// ✅ Good: Flexible, composable API
<Card>
  <CardHeader>
    <CardTitle>Personal Care</CardTitle>
    <CardDescription>Assistance with daily activities</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <Button>Learn More</Button>
  </CardFooter>
</Card>
```

### Polymorphic Components

```tsx
// ✅ Good: asChild pattern for flexibility
<Button asChild>
  <Link href="/services">View Services</Link>
</Button>
```

### Loading States

```tsx
// ✅ Good: Skeleton loading states
function CaregiverCardSkeleton() {
  return (
    <Card>
      <Skeleton className="h-48 w-full rounded-t-lg" />
      <CardContent className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}
```

---

## Accessibility Requirements

### Minimum Standards

- **WCAG 2.1 Level AA** compliance
- **Color Contrast:** 4.5:1 for normal text, 3:1 for large text
- **Focus Indicators:** Visible focus rings on all interactive elements
- **Keyboard Navigation:** Full functionality without mouse
- **Screen Reader Support:** Semantic HTML, ARIA labels where needed
- **Reduced Motion:** Respect `prefers-reduced-motion`

### Component Checklist

- [ ] Semantic HTML elements (`<nav>`, `<main>`, `<article>`, etc.)
- [ ] Descriptive `aria-label` on icon-only buttons
- [ ] Form inputs have associated `<label>` elements
- [ ] Images have meaningful `alt` text
- [ ] Modals trap focus and return focus on close
- [ ] Skip links for main content
- [ ] Sufficient touch target sizes (44x44px minimum)

### Senior-Friendly Considerations

- Larger default font sizes (16px minimum body text)
- High contrast mode support
- Clear, simple language
- Generous click/tap targets
- Avoid auto-playing media
- Provide text alternatives for all media

---

## Security & Compliance

### HIPAA Considerations

Angel Touch handles sensitive client information. While not a covered entity, maintaining HIPAA-aligned practices builds trust:

- **Data Encryption:** All client data encrypted at rest and in transit
- **Access Control:** Role-based access (family, caregiver, admin)
- **Audit Logging:** Track access to sensitive records
- **Data Minimization:** Collect only necessary information
- **Secure Authentication:** MFA for admin/caregiver accounts

### Security Checklist

- [ ] Input validation on all forms (Zod schemas)
- [ ] CSRF protection on mutations
- [ ] Rate limiting on API routes
- [ ] Secure headers (CSP, HSTS, etc.)
- [ ] No sensitive data in URLs or logs
- [ ] Environment variables for secrets
- [ ] Regular dependency audits

---

## Documentation Requirements

### Sprint Documentation Rule

> **Every sprint of implementation must update documentation where relevant.**

### What to Document

| Change Type | Documentation Update |
|-------------|---------------------|
| New component | JSDoc comments, Storybook story (future) |
| New page/route | Update route map in README or docs |
| API endpoint | OpenAPI spec or inline documentation |
| Environment variable | Update `.env.local.example` |
| Database schema | Update Prisma schema comments |
| Breaking change | Migration guide, changelog entry |
| Bug fix | Link to issue in commit message |

### Code Documentation

```typescript
/**
 * Displays a caregiver profile card with photo, name, and specializations.
 * 
 * @example
 * ```tsx
 * <CaregiverCard
 *   caregiver={caregiver}
 *   onSelect={(id) => console.log(id)}
 * />
 * ```
 */
export function CaregiverCard({ caregiver, onSelect }: CaregiverCardProps) {
  // ...
}
```

---

## Git & Commit Guidelines

### Commit Message Rule

> **Every sprint of implementation should have a comprehensive commit message that will serve as the implementation summary.**

### Commit Format

```
<type>(<scope>): <short summary>

- <bullet point explaining what changed>
- <bullet point explaining why>
- <bullet point noting any breaking changes or migrations>

Refs: #<issue-number> (if applicable)
```

### Commit Types

| Type | Description |
|------|-------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes nor adds |
| `style` | Formatting, CSS changes |
| `docs` | Documentation only changes |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, tooling |
| `perf` | Performance improvements |
| `a11y` | Accessibility improvements |

### Scope Examples

- `ui` - shadcn/ui components
- `layout` - Navbar, Footer, page layouts
- `home` - Home page specific
- `services` - Services page/components
- `caregivers` - Caregiver-related features
- `forms` - Form components and validation
- `auth` - Authentication (future)
- `api` - API routes (future)

### Example Commits

```
feat(layout): add responsive Navbar with mobile sheet menu

- Migrate NavbarHeadlessUI to shadcn/ui Sheet for mobile menu
- Add AnimatedThemeToggle to header for light/dark switching
- Implement sticky header with glass morphism effect on scroll
- Ensure keyboard accessibility and focus management

Refs: #42
```

```
refactor(services): convert ServiceCard to Server Component

- Remove 'use client' directive (no client interactivity needed)
- Replace CSS Module with Tailwind utilities
- Add TypeScript interface for props
- Improve accessibility with semantic HTML
```

### Branch Naming

```
<type>/<short-description>

Examples:
feat/navbar-migration
fix/theme-toggle-hydration
refactor/service-card-typescript
```

---

## Testing Standards

### Testing Priorities

1. **Accessibility Tests** - Automated a11y audits (axe-core)
2. **Visual Regression** - Screenshot comparison for UI components
3. **Integration Tests** - User flows (contact form, navigation)
4. **Unit Tests** - Utility functions, hooks, validation schemas

### Test File Naming

```
__tests__/
├── components/
│   └── service-card.test.tsx
├── hooks/
│   └── use-caregiver-data.test.ts
└── utils/
    └── format-phone.test.ts
```

### Minimum Coverage Targets

| Area | Target |
|------|--------|
| Utility functions | 90% |
| Custom hooks | 80% |
| Form validation | 80% |
| Components | 70% |

---

## Future Roadmap Context

### Phase: Frontend Migration (Current)

- [x] Project scaffolding (Next.js, TypeScript, Tailwind)
- [x] Design system migration (CSS variables, theme)
- [x] shadcn/ui component installation
- [ ] Core component migration (Navbar, Footer, Cards)
- [ ] Page migration (all 11 pages)
- [ ] Image system migration
- [ ] Animation and interactivity
- [ ] Testing and QA

### Phase: Backend Foundation (Next)

- Database schema design (clients, caregivers, schedules)
- Authentication system (multi-role)
- API routes for CRUD operations
- Admin dashboard foundation

### Phase: Portal Features (Future)

- **Family Portal:** Care updates, schedule view, messaging, invoices
- **Caregiver Portal:** Daily schedule, client info, clock in/out, documentation
- **Admin Dashboard:** Client management, caregiver assignment, reporting, billing

### Phase: Enterprise Features (Long-term)

- Integration with care management software (AlayaCare/ClearCare)
- Automated scheduling and matching
- Real-time notifications (SMS, push)
- Analytics and reporting dashboards
- Multi-location support
- API for third-party integrations

---

## Quick Reference

## Operational Learnings

### Prisma + Next.js (Vercel / Serverless)

- **Symptom:** `Cannot find module '@prisma/client-runtime-utils'` at runtime (often in Vercel SSR logs), coming from `node_modules/.prisma/client/runtime/client.js`.
- **Why it happens:** Prisma v7 splits some runtime helpers into `@prisma/client-runtime-utils`. In some build/deploy setups (esp. with bundling/tracing), transitive deps can be omitted from the deployed server output.
- **Fix:**
  - Add `@prisma/client-runtime-utils` as a **direct** dependency.
  - Ensure Next.js treats Prisma packages as **server externals** (e.g. in `next.config.ts` via `serverExternalPackages`). Include `@prisma/client-runtime-utils` alongside `@prisma/client`.
  - Keep `prisma generate` in `postinstall` and/or before `next build` so the generated client is always present.

### pnpm Workspace

- pnpm requires `pnpm-workspace.yaml` to contain a `packages:` field. If it’s missing/empty, pnpm commands may fail with: `ERROR packages field missing or empty`.
- For a single-package repo, `packages: ["."]` is sufficient.

### Clerk Keys & Build Stability

- Missing or invalid Clerk keys can fail prerendering (e.g. `/_not-found`) during `next build`.
- CI/Vercel must have valid `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` set for production builds.

### Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting

# shadcn/ui
pnpm dlx shadcn@latest add <component>  # Add component

# Git
git add -A && git commit -m "type(scope): message"
```

### Key Files

| Purpose | Location |
|---------|----------|
| Global styles & tokens | `app/globals.css` |
| Tailwind config | `tailwind.config.ts` |
| TypeScript config | `tsconfig.json` |
| shadcn/ui config | `components.json` |
| Environment template | `.env.local.example` |
| Migration plan | `migration_plan.md` |
| This guide | `.github/copilot-instructions.md` |

---

*Last updated: February 15, 2026*
