# Angel Touch Homecare Services – Next.js Migration Plan

> **Migration Target:** Next.js 14+ (App Router) + React 19 + Tailwind CSS + shadcn/ui + TypeScript  
> **Source Directory:** `~/projects/angeltouch/src/` (Vite + React)  
> **Target Directory:** `v2/` (Next.js project root)  
> **Estimated Effort:** 40-60 hours  
> **Document Created:** January 26, 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture Analysis](#current-architecture-analysis)
3. [Target Architecture](#target-architecture)
4. [Phase 1: Project Scaffolding](#phase-1-project-scaffolding)
5. [Phase 2: Design System Migration](#phase-2-design-system-migration)
6. [Phase 3: Core Components Migration](#phase-3-core-components-migration)
7. [Phase 4: Page Migration](#phase-4-page-migration)
8. [Phase 5: Image System Migration](#phase-5-image-system-migration)
9. [Phase 6: Features & Interactivity](#phase-6-features--interactivity)
10. [Phase 7: Build System & Scripts](#phase-7-build-system--scripts)
11. [Phase 8: Testing & QA](#phase-8-testing--qa)
12. [Phase 9: Performance & Optimization](#phase-9-performance--optimization)
13. [Phase 10: Deployment & Cutover](#phase-10-deployment--cutover)
14. [Risk Register](#risk-register)
15. [File Mapping Reference](#file-mapping-reference)

---

## Executive Summary

This document outlines the migration strategy from the current Vite + React SPA architecture to a Next.js App Router application with TypeScript and shadcn/ui components. The migration preserves all existing functionality while adding:

- **Server-side rendering (SSR)** for improved SEO
- **Type safety** via TypeScript
- **Modern UI components** via shadcn/ui
- **Optimized image handling** via Next.js Image component
- **Improved developer experience** with App Router conventions

### Migration Guidelines

- **Refactoring rule:** During migration, it’s acceptable to refactor legacy implementations (structure, styling approach, component boundaries) to align with Next.js/App Router best practices, accessibility, performance, and maintainability — as long as user-facing behavior and content remain equivalent.

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
1. `Home.jsx` → `app/page.tsx`
2. `AboutHeadlessUI.jsx` → `app/about/page.tsx`
3. `ServicesHeadlessUI.jsx` → `app/services/page.tsx`
4. `CaregiversHeadlessUI.jsx` → `app/caregivers/page.tsx`
5. `TestimonialsHeadlessUI.jsx` → `app/testimonials/page.tsx`
6. `Contact.jsx` → `app/contact/page.tsx`
7. `FAQs-HeadlessUI.jsx` → `app/faqs/page.tsx`
8. `ResourcesHeadlessUI.jsx` → `app/resources/page.tsx`
9. `ClientPortalHeadlessUI.jsx` → `app/client-portal/page.tsx`
10. `PrivacyPolicy.jsx` → `app/privacy/page.tsx`
11. `TermsOfService.jsx` → `app/terms/page.tsx`

---

## Target Architecture

### Tech Stack (Target)
| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS 3.4 |
| UI Components | shadcn/ui + Radix primitives |
| Animation | Framer Motion 12 (retained) |
| Images | Next.js `<Image>` component |
| Forms | React Hook Form + Zod |
| Icons | Lucide React (shadcn default) |

### Directory Structure (Target)
```
v2/                        # Next.js project root
├── app/                        # App Router (routing & pages ONLY)
│   ├── layout.tsx              # Root layout (Navbar + Footer)
│   ├── page.tsx                # Home page (/)
│   ├── globals.css             # Tailwind + CSS variables
│   ├── about/
│   │   └── page.tsx            # /about
│   ├── services/
│   │   └── page.tsx            # /services
│   ├── caregivers/
│   │   └── page.tsx            # /caregivers
│   ├── testimonials/
│   │   └── page.tsx            # /testimonials
│   ├── contact/
│   │   └── page.tsx            # /contact
│   ├── faqs/
│   │   └── page.tsx            # /faqs
│   ├── resources/
│   │   └── page.tsx            # /resources
│   ├── client-portal/
│   │   └── page.tsx            # /client-portal
│   ├── privacy/
│   │   └── page.tsx            # /privacy
│   ├── terms/
│   │   └── page.tsx            # /terms
│   ├── error.tsx               # Global error boundary
│   └── not-found.tsx           # 404 page
├── components/                 # Shared components (project root)
│   ├── ui/                     # shadcn/ui base components
│   ├── layout/
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   └── mobile-nav.tsx
│   ├── home/
│   │   └── hero-section.tsx
│   ├── services/
│   │   └── service-card.tsx
│   ├── caregivers/
│   │   └── caregiver-card.tsx
│   ├── testimonials/
│   │   ├── testimonial-card.tsx
│   │   └── testimonials-carousel.tsx
│   ├── chat/
│   │   ├── chat-widget.tsx
│   │   └── chat-widget-loader.tsx
│   └── shared/
│       ├── optimized-image.tsx
│       ├── section-divider.tsx
│       └── loading-spinner.tsx
├── lib/                        # Utilities (project root)
│   ├── utils.ts                # cn() helper, etc.
│   ├── constants.ts
│   └── validations/
│       └── contact-form.ts
├── data/                       # Static data (project root)
│   ├── caregivers.ts
│   ├── services.ts
│   └── blur-placeholders.ts
├── hooks/                      # Custom hooks (project root)
│   └── use-caregiver-data.ts
├── types/                      # TypeScript types (project root)
│   ├── index.ts
│   ├── caregiver.ts
│   └── service.ts
├── public/                     # Static assets
│   ├── home/
│   ├── about/
│   ├── services/
│   ├── caregivers/
│   └── testimonials/
├── scripts/                    # Build scripts
│   ├── generate-images.mjs
│   └── generate-icons.mjs
├── __tests__/                  # Test files (project root)
│   ├── components/
│   ├── pages/
│   └── hooks/
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── jest.config.js
├── components.json             # shadcn/ui config
├── package.json
├── pnpm-lock.yaml
└── .env.local.example
```

---

## Phase 1: Project Scaffolding

**Duration:** 2-4 hours  
**Dependencies:** None

### Tasks

| ID | Task | Owner | Est. |
|----|------|-------|------|
| 1.1 | Initialize Next.js 14 project in `v2/` directory | Dev | 30m |
| 1.2 | Configure TypeScript (`tsconfig.json`) | Dev | 15m |
| 1.3 | Install and configure Tailwind CSS | Dev | 30m |
| 1.4 | Initialize shadcn/ui with design system | Dev | 45m |
| 1.5 | Set up path aliases (`@/components`, etc.) | Dev | 15m |
| 1.6 | Configure ESLint + Prettier for TypeScript | Dev | 30m |
| 1.7 | Create base `layout.tsx` with metadata | Dev | 30m |
| 1.8 | Set up environment variables structure | Dev | 15m |

### Acceptance Criteria

- [x] `pnpm dev` starts Next.js dev server on `localhost:3000`
- [x] TypeScript compilation passes with `strict: true`
- [x] Tailwind CSS classes render correctly in browser
- [x] shadcn/ui CLI (`pnpm dlx shadcn@latest add button`) works without errors
- [x] Path imports like `@/components/ui/button` resolve correctly
- [x] ESLint runs without configuration errors
- [x] Base layout renders with "Hello World" test content
- [x] `.env.local.example` file exists with documented variables

### Deliverables

```
v2/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (placeholder)
│   └── globals.css
├── components/
│   └── ui/
│       └── button.tsx (test component)
├── lib/
│   └── utils.ts
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── .eslintrc.json
├── components.json (shadcn config)
└── pnpm-lock.yaml
```

---

## Phase 2: Design System Migration

**Duration:** 4-6 hours  
**Dependencies:** Phase 1 complete

### Tasks

| ID | Task | Owner | Est. |
|----|------|-------|------|
| 2.1 | Extract CSS variables from `global.css` to `globals.css` | Dev | 1h |
| 2.2 | Map color tokens to Tailwind config | Dev | 1h |
| 2.3 | Configure typography scale in Tailwind | Dev | 30m |
| 2.4 | Set up spacing/sizing system | Dev | 30m |
| 2.5 | Configure shadcn/ui theme colors | Dev | 45m |
| 2.6 | Create dark mode CSS variables | Dev | 45m |
| 2.7 | Migrate glass morphism effects | Dev | 30m |
| 2.8 | Set up responsive breakpoints | Dev | 15m |
| 2.9 | Create gradient utility classes | Dev | 30m |

### Color Token Mapping

| Current Token | Tailwind Config Key | Value |
|---------------|---------------------|-------|
| `--primary-navy` | `colors.navy.DEFAULT` | `#1a2332` |
| `--primary-blue` | `colors.primary.DEFAULT` | `#2563eb` |
| `--accent-green` | `colors.accent.green` | `#059669` |
| `--accent-rose` | `colors.accent.rose` | `#E7A9B6` |
| `--background` | `colors.background` | `#030314` |

### Acceptance Criteria

- [x] All 35+ CSS custom properties migrated to `globals.css`
- [x] `tailwind.config.ts` extends theme with custom colors
- [x] Typography classes (`text-xs` through `text-5xl`) match original sizes
- [x] Gradient utilities (`bg-accent-rose-gradient`) work correctly
- [x] Dark mode toggle changes CSS variables appropriately
- [x] Glass morphism effects (`glass-bg`, `glass-border`) render correctly
- [x] Responsive breakpoints match original (`xs: 480px`, etc.)
- [x] shadcn/ui components inherit custom theme colors

### Deliverables

```
v2/
├── app/
│   └── globals.css (complete design system)
├── tailwind.config.ts (extended theme)
└── components/
    └── ui/
        └── (shadcn components use theme)
```

---

## Phase 3: Core Components Migration

**Duration:** 8-12 hours  
**Dependencies:** Phase 2 complete

### Tasks

| ID | Task | Owner | Est. |
|----|------|-------|------|
| 3.1 | Install required shadcn/ui components | Dev | 30m |
| 3.2 | Migrate `Navbar` → `navbar.tsx` | Dev | 2h |
| 3.3 | Migrate `Footer` → `footer.tsx` | Dev | 1.5h |
| 3.4 | Migrate `ThemeToggle` → `theme-toggle.tsx` | Dev | 45m |
| 3.5 | Create `Button` variants matching original | Dev | 30m |
| 3.6 | Migrate `ServiceCard` → `service-card.tsx` | Dev | 1h |
| 3.7 | Migrate `TestimonialCard` → `testimonial-card.tsx` | Dev | 1h |
| 3.8 | Migrate `FAQSection` → accordion component | Dev | 1h |
| 3.9 | Migrate `Avatar` component | Dev | 30m |
| 3.10 | Migrate `Logo` component | Dev | 30m |
| 3.11 | Create `LoadingSpinner` component | Dev | 15m |
| 3.12 | Create TypeScript interfaces for all props | Dev | 1h |

### shadcn/ui Components to Install

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add accordion
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add sheet        # for mobile nav
pnpm dlx shadcn@latest add avatar
pnpm dlx shadcn@latest add badge
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add textarea
pnpm dlx shadcn@latest add label
pnpm dlx shadcn@latest add separator
pnpm dlx shadcn@latest add skeleton
pnpm dlx shadcn@latest add tooltip
pnpm dlx shadcn@latest add carousel
```

### Component Mapping

| Original Component | Target Component | shadcn Base |
|--------------------|------------------|-------------|
| `NavbarHeadlessUI.jsx` | `navbar.tsx` | Sheet (mobile) |
| `FooterHeadlessUI.jsx` | `footer.tsx` | Custom |
| `ThemeToggleHeadlessUI.jsx` | `theme-toggle.tsx` | Button |
| `ServiceCard.jsx` | `service-card.tsx` | Card |
| `TestimonialCard.jsx` | `testimonial-card.tsx` | Card |
| `FAQSection.jsx` | `faq-accordion.tsx` | Accordion |
| `Avatar.jsx` | `avatar.tsx` | Avatar |
| `Button.jsx` | Use shadcn Button | Button |

### Acceptance Criteria

- [ ] All 14 shadcn/ui base components installed
- [ ] `Navbar` renders with logo, links, mobile menu, theme toggle
- [ ] Mobile navigation uses shadcn `Sheet` component
- [ ] `Footer` renders all links, contact info, social icons
- [ ] `ThemeToggle` switches between light/dark modes
- [ ] `ServiceCard` displays icon, title, description with hover effects
- [ ] `TestimonialCard` shows avatar, name, quote, rating
- [ ] FAQ accordion expands/collapses with ARIA attributes
- [ ] All components have TypeScript interfaces defined
- [ ] No HeadlessUI imports remain in migrated components
- [ ] All components pass accessibility audit (axe-core)

### Deliverables

```
v2/components/
├── ui/                    # shadcn base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── accordion.tsx
│   ├── sheet.tsx
│   ├── avatar.tsx
│   └── ...
├── layout/
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── mobile-nav.tsx
│   └── theme-toggle.tsx
└── shared/
    ├── service-card.tsx
    ├── testimonial-card.tsx
    ├── faq-accordion.tsx
    └── loading-spinner.tsx
```

---

## Phase 4: Page Migration

**Duration:** 6-8 hours  
**Dependencies:** Phase 3 complete

### Tasks

| ID | Task | Owner | Est. |
|----|------|-------|------|
| 4.1 | Update root `layout.tsx` with Navbar/Footer | Dev | 30m |
| 4.2 | Migrate Home page (`page.tsx`) | Dev | 1.5h |
| 4.3 | Migrate About page | Dev | 45m |
| 4.4 | Migrate Services page | Dev | 45m |
| 4.5 | Migrate Caregivers page | Dev | 1h |
| 4.6 | Migrate Testimonials page | Dev | 45m |
| 4.7 | Migrate Contact page (form logic) | Dev | 1h |
| 4.8 | Migrate FAQs page | Dev | 30m |
| 4.9 | Migrate Resources page | Dev | 30m |
| 4.10 | Migrate Client Portal page | Dev | 30m |
| 4.11 | Migrate Privacy Policy page | Dev | 15m |
| 4.12 | Migrate Terms of Service page | Dev | 15m |
| 4.13 | Add metadata exports to all pages | Dev | 30m |

### Page Migration Template

```typescript
// app/about/page.tsx
import { Metadata } from 'next'
import { AboutContent } from '@/components/about/about-content'

export const metadata: Metadata = {
  title: 'About Us | Angel Touch Homecare',
  description: 'Learn about our mission...',
}

export default function AboutPage() {
  return <AboutContent />
}
```

### Acceptance Criteria

- [ ] All 11 pages render at correct routes
- [ ] Root layout includes `<Navbar />` and `<Footer />`
- [ ] Home page hero section renders with correct styling
- [ ] All internal links use Next.js `<Link>` component
- [ ] Contact form validates input and shows success/error states
- [ ] FAQ accordion functionality works correctly
- [ ] Each page has `metadata` export for SEO
- [ ] No React Router imports remain
- [ ] Console shows no hydration errors
- [ ] All pages are Server Components where possible (no `'use client'` unless needed)

### Deliverables

```
v2/app/
├── layout.tsx           # With Navbar + Footer
├── page.tsx             # Home
├── about/page.tsx
├── services/page.tsx
├── caregivers/page.tsx
├── testimonials/page.tsx
├── contact/page.tsx
├── faqs/page.tsx
├── resources/page.tsx
├── client-portal/page.tsx
├── privacy/page.tsx
└── terms/page.tsx
```

---

## Phase 5: Image System Migration

**Duration:** 4-6 hours  
**Dependencies:** Phase 4 complete

### Tasks

| ID | Task | Owner | Est. |
|----|------|-------|------|
| 5.1 | Analyze current `ResponsiveImage` component | Dev | 30m |
| 5.2 | Create `OptimizedImage` wrapper for Next.js Image | Dev | 1.5h |
| 5.3 | Migrate blur placeholder system | Dev | 1h |
| 5.4 | Move images from `public/` to appropriate locations | Dev | 30m |
| 5.5 | Update all image references in components | Dev | 1h |
| 5.6 | Configure `next.config.js` image domains | Dev | 15m |
| 5.7 | Test responsive image loading | Dev | 30m |
| 5.8 | Verify AVIF/WebP format support | Dev | 30m |

### Image Component Comparison

| Feature | Current (`ResponsiveImage`) | Target (Next.js `Image`) |
|---------|----------------------------|--------------------------|
| Format auto-negotiation | Manual AVIF/WebP/JPEG | Automatic |
| Blur placeholder | Custom base64 | Built-in `blurDataURL` |
| Responsive srcSet | Manual generation | Automatic |
| Lazy loading | Manual `loading="lazy"` | Built-in |
| Priority loading | Manual `fetchpriority` | `priority` prop |

### Acceptance Criteria

- [ ] `OptimizedImage` wrapper component created with TypeScript
- [ ] Blur placeholders load from existing JSON data
- [ ] Hero images use `priority` prop for LCP optimization
- [ ] All images lazy-load by default
- [ ] AVIF format served when supported (via Next.js)
- [ ] No broken image links in any page
- [ ] Lighthouse image audit passes (no unoptimized images)
- [ ] `next.config.js` has correct `images.remotePatterns` if needed

### Deliverables

```
v2/components/shared/
└── optimized-image.tsx

v2/public/
├── home/
├── about/
├── services/
├── caregivers/
└── testimonials/
```

---

## Phase 6: Features & Interactivity

**Duration:** 4-6 hours  
**Dependencies:** Phase 5 complete

### Tasks

| ID | Task | Owner | Est. |
|----|------|-------|------|
| 6.1 | Migrate `ChatWidget` → `chat-widget.tsx` | Dev | 2h |
| 6.2 | Migrate `ChatWidgetLoader` (deferred loading) | Dev | 1h |
| 6.3 | Migrate `TestimonialsCarousel` | Dev | 1h |
| 6.4 | Migrate Framer Motion animations | Dev | 1h |
| 6.5 | Migrate `useCaregiverData` hook | Dev | 30m |
| 6.6 | Add form validation with React Hook Form + Zod | Dev | 30m |

### Animation Migration Notes

Framer Motion works with Next.js but requires `'use client'` directive:

```typescript
'use client'

import { motion } from 'framer-motion'

export function AnimatedSection({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}
```

### Acceptance Criteria

- [ ] Chat widget loads after user interaction or 5s idle
- [ ] Chat widget has full keyboard navigation
- [ ] Testimonials carousel swipes on touch devices
- [ ] Page transitions animate smoothly
- [ ] Scroll-triggered animations work correctly
- [ ] Contact form validates with Zod schemas
- [ ] Form shows loading state during submission
- [ ] All interactive components have `'use client'` directive

### Deliverables

```
v2/components/
├── chat/
│   ├── chat-widget.tsx
│   └── chat-widget-loader.tsx
├── testimonials/
│   └── testimonials-carousel.tsx
└── shared/
    └── motion-transition.tsx

v2/hooks/
└── use-caregiver-data.ts

v2/lib/
└── validations/
    └── contact-form.ts
```

---

## Phase 7: Build System & Scripts

**Duration:** 2-4 hours  
**Dependencies:** Phase 6 complete

### Tasks

| ID | Task | Owner | Est. |
|----|------|-------|------|
| 7.1 | Update `package.json` scripts for Next.js | Dev | 30m |
| 7.2 | Migrate image generation script | Dev | 1h |
| 7.3 | Migrate icon generation script | Dev | 30m |
| 7.4 | Configure `next.config.js` for production | Dev | 30m |
| 7.5 | Set up bundle analyzer | Dev | 15m |
| 7.6 | Configure PWA with `next-pwa` | Dev | 45m |

### Script Migration

| Original Script | New Script | Notes |
|-----------------|------------|-------|
| `npm run dev` | `pnpm dev` | Next.js dev server |
| `npm run build` | `pnpm build` | Next.js production build |
| `npm run preview` | `pnpm start` | Next.js production server |
| `npm run generate:images` | `pnpm generate:images` | Keep Sharp script |
| `npm run analyze` | `pnpm analyze` | `@next/bundle-analyzer` |

### Acceptance Criteria

- [ ] `pnpm dev` starts Next.js dev server
- [ ] `pnpm build` produces production bundle without errors
- [ ] `pnpm start` serves production build
- [ ] Image generation script works with new paths
- [ ] Bundle analyzer generates report
- [ ] PWA manifest and service worker configured
- [ ] `_redirects` rules migrated to `next.config.js` rewrites

### Deliverables

```
v2/
├── package.json (updated scripts)
├── next.config.js (complete)
└── scripts/
    ├── generate-images.mjs (updated paths)
    └── generate-icons.mjs (updated paths)
```

---

## Phase 8: Testing & QA

**Duration:** 4-6 hours  
**Dependencies:** Phase 7 complete

### Tasks

| ID | Task | Owner | Est. |
|----|------|-------|------|
| 8.1 | Set up Jest + React Testing Library | Dev | 1h |
| 8.2 | Migrate existing tests | Dev | 1h |
| 8.3 | Add component unit tests | Dev | 1.5h |
| 8.4 | Add integration tests for forms | Dev | 1h |
| 8.5 | Run accessibility audit (axe-core) | QA | 30m |
| 8.6 | Manual cross-browser testing | QA | 1h |

### Test Coverage Requirements

| Area | Minimum Coverage |
|------|------------------|
| Components | 70% |
| Hooks | 80% |
| Utils | 90% |
| Forms | 80% |

### Acceptance Criteria

- [ ] Jest configured with TypeScript support
- [ ] All existing tests pass after migration
- [ ] Each page has at least one smoke test
- [ ] Contact form has validation tests
- [ ] No critical accessibility violations (axe-core)
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Mobile responsive on iOS Safari and Android Chrome

### Deliverables

```
v2/__tests__/
├── components/
│   ├── navbar.test.tsx
│   └── service-card.test.tsx
├── pages/
│   └── home.test.tsx
└── hooks/
    └── use-caregiver-data.test.ts

v2/jest.config.js
v2/jest.setup.js
```

---

## Phase 9: Performance & Optimization

**Duration:** 3-4 hours  
**Dependencies:** Phase 8 complete

### Tasks

| ID | Task | Owner | Est. |
|----|------|-------|------|
| 9.1 | Run Lighthouse audit | Dev | 30m |
| 9.2 | Optimize LCP (hero image) | Dev | 45m |
| 9.3 | Optimize CLS (layout shifts) | Dev | 30m |
| 9.4 | Add dynamic imports for heavy components | Dev | 30m |
| 9.5 | Configure caching headers | Dev | 30m |
| 9.6 | Set up error boundaries | Dev | 30m |
| 9.7 | Final bundle size check | Dev | 30m |

### Performance Targets

| Metric | Target | Current (Vite) |
|--------|--------|----------------|
| Lighthouse Performance | ≥ 90 | TBD |
| LCP | < 2.5s | TBD |
| FID | < 100ms | TBD |
| CLS | < 0.1 | TBD |
| Main bundle | < 100kB | ~90kB |

### Acceptance Criteria

- [ ] Lighthouse Performance score ≥ 90
- [ ] Lighthouse Accessibility score ≥ 95
- [ ] Lighthouse Best Practices score ≥ 95
- [ ] Lighthouse SEO score ≥ 95
- [ ] No layout shifts on page load
- [ ] Hero image loads within 2s on 3G
- [ ] Error boundaries catch and display errors gracefully
- [ ] Main bundle < 100kB gzipped

### Deliverables

```
v2/
├── lighthouse-report.html (saved)
└── app/
    ├── error.tsx (global error boundary)
    └── not-found.tsx (404 page)
```

---

## Phase 10: Deployment & Cutover

**Duration:** 2-3 hours  
**Dependencies:** Phase 9 complete

### Tasks

| ID | Task | Owner | Est. |
|----|------|-------|------|
| 10.1 | Configure Netlify/Vercel for Next.js | Dev | 30m |
| 10.2 | Set up environment variables in production | Dev | 15m |
| 10.3 | Deploy to staging environment | Dev | 30m |
| 10.4 | Full regression test on staging | QA | 1h |
| 10.5 | Configure redirects for old URLs | Dev | 15m |
| 10.6 | DNS cutover (if applicable) | Ops | 15m |
| 10.7 | Monitor for errors post-deploy | Dev | 30m |

### Deployment Checklist

- [ ] All environment variables set
- [ ] Build succeeds in CI/CD
- [ ] Staging deployment works
- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] Images load from CDN
- [ ] SSL certificate valid
- [ ] Redirects work for old URLs
- [ ] Analytics tracking verified
- [ ] Error monitoring configured (Sentry/etc.)

### Acceptance Criteria

- [ ] Production deployment successful
- [ ] All 11 pages accessible
- [ ] Contact form sends emails
- [ ] No console errors in production
- [ ] Lighthouse scores match targets
- [ ] Old Vite app can be safely archived

### Deliverables

```
v2/
├── .env.production (documented)
├── .env.local.example
├── netlify.toml OR vercel.json
└── docs/
    └── deployment-runbook.md (if needed)
```

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| HeadlessUI → shadcn/ui feature gaps | Medium | Medium | Audit all HeadlessUI features used; create custom components if needed |
| CSS Module migration complexity | Medium | High | Gradual migration; keep CSS Modules initially if needed |
| Image system breaking changes | Low | High | Thorough testing of all image paths; fallback to `<img>` if needed |
| Hydration mismatches | Medium | Medium | Careful use of `'use client'`; avoid window/document in SSR |
| Build time increase | Low | Low | Use Next.js caching; optimize image generation |
| SEO ranking changes | Low | Medium | Implement proper redirects; verify meta tags |

---

## File Mapping Reference

### Pages

| Source (src/pages/) | Target (v2/app/) |
|---------------------|------------------------|
| `Home.jsx` | `page.tsx` |
| `AboutHeadlessUI.jsx` | `about/page.tsx` |
| `ServicesHeadlessUI.jsx` | `services/page.tsx` |
| `CaregiversHeadlessUI.jsx` | `caregivers/page.tsx` |
| `TestimonialsHeadlessUI.jsx` | `testimonials/page.tsx` |
| `Contact.jsx` | `contact/page.tsx` |
| `FAQs-HeadlessUI.jsx` | `faqs/page.tsx` |
| `ResourcesHeadlessUI.jsx` | `resources/page.tsx` |
| `ClientPortalHeadlessUI.jsx` | `client-portal/page.tsx` |
| `PrivacyPolicy.jsx` | `privacy/page.tsx` |
| `TermsOfService.jsx` | `terms/page.tsx` |

### Components

| Source (src/components/) | Target (v2/components/) |
|--------------------------|-------------------------------|
| `NavbarHeadlessUI.jsx` | `layout/navbar.tsx` |
| `FooterHeadlessUI.jsx` | `layout/footer.tsx` |
| `ThemeToggleHeadlessUI.jsx` | `layout/theme-toggle.tsx` |
| `ServiceCard.jsx` | `shared/service-card.tsx` |
| `TestimonialCard.jsx` | `testimonials/testimonial-card.tsx` |
| `TestimonialsCarousel.jsx` | `testimonials/testimonials-carousel.tsx` |
| `ChatWidget.jsx` | `chat/chat-widget.tsx` |
| `ChatWidgetLoader.jsx` | `chat/chat-widget-loader.tsx` |
| `FAQSection.jsx` | `faqs/faq-accordion.tsx` |
| `ResponsiveImage.jsx` | `shared/optimized-image.tsx` |
| `Avatar.jsx` | Use shadcn `Avatar` |
| `Button.jsx` | Use shadcn `Button` |
| `Logo.jsx` | `layout/logo.tsx` |
| `LoadingPage.jsx` | `shared/loading-spinner.tsx` |
| `MotionTransition.jsx` | `shared/motion-transition.tsx` |

### Styles

| Source (src/styles/) | Target |
|----------------------|--------|
| `global.css` | `v2/app/globals.css` |
| `*.module.css` | Migrate to Tailwind utilities |

### Data

| Source (src/data/) | Target (v2/data/) |
|--------------------|-------------------------|
| `caregivers.data.js` | `caregivers.ts` |
| `image-blur-placeholders.json` | `blur-placeholders.ts` |

---

## Appendix: Commands Reference

### Project Initialization

```bash
# Create Next.js project in v2/ directory
pnpm create next-app@latest project --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

# Initialize shadcn/ui
cd project
pnpm dlx shadcn@latest init

# Install additional dependencies
pnpm add framer-motion lucide-react zod react-hook-form @hookform/resolvers
```

### Development

```bash
# Development server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Testing
pnpm test
```

### Production

```bash
# Build
pnpm build

# Start production server
pnpm start

# Analyze bundle
pnpm analyze
```

---

**Document Version:** 1.0  
**Last Updated:** January 26, 2026  
**Author:** Development Team
