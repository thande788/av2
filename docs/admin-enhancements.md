# Admin Dashboard Enhancement Recommendations

> **Document Created:** February 15, 2026  
> **Last Updated:** March 19, 2026  
> **Status:** Partially Implemented (High-Priority items complete)  
> **Related:** [backend_plan.md](../backend_plan.md), [portal_plan.md](./portal_plan.md)

---

## Overview

This document outlines recommended enhancements for the Angel Touch Homecare admin dashboard, organized by priority and effort level.

---

## 🚀 High-Priority Enhancements

> **Status:** All 5 high-priority enhancements implemented as of March 19, 2026.

### 1. Search & Filtering System ✅

**Status:** Implemented  
**Implemented:** March 19, 2026

Per-table filtering added to all admin list views via the enhanced `DataTable` component:

- ✅ Per-table filters (status dropdowns on Applications, Contacts, Inquiries)
- ✅ Filter state managed client-side with instant filtering
- ✅ Filtered count displayed in pagination
- ⬜ Global search bar in sidebar/header (future)
- ⬜ Saved filter presets (future)
- ⬜ URL-based filter state for shareable links (future)

**Key Files:**
- `components/admin/data-table.tsx` — Enhanced with `filters` prop, `FilterOption`/`TableFilter` types
- `app/admin/applications/applications-table.tsx` — Status filter
- `app/admin/contacts/contacts-table.tsx` — Read/Unread filter
- `app/admin/inquiries/inquiries-table.tsx` — Status filter

**Effort:** 6-8 hours  
**Impact:** High

---

### 2. Bulk Actions ✅

**Status:** Implemented  
**Implemented:** March 19, 2026

Row selection with checkboxes and bulk action bar on all admin list views:

- ✅ Select multiple applications/contacts/inquiries (checkbox column)
- ✅ Bulk status updates (Mark Reviewing, Mark Contacted)
- ✅ Bulk mark as read
- ✅ Bulk delete (contacts, inquiries)
- ✅ CSV export for all tables
- ✅ Toast notifications for bulk operation results
- ✅ Select all / deselect all

**Key Files:**
- `components/admin/data-table.tsx` — `selectable`, `bulkActions`, `exportable` props, `BulkAction<T>` type
- `app/actions/audit-log.ts` — `bulkUpdateApplicationStatus()`, `bulkMarkContactsRead()`, `bulkUpdateInquiryStatus()`, `bulkDeleteContacts()`, `bulkDeleteInquiries()`

**Effort:** 4-6 hours  
**Impact:** High

---

### 3. Email Integration in Admin ✅

**Status:** Implemented  
**Implemented:** March 19, 2026

Full email sending from admin portal with templates and history:

- ✅ Send follow-up emails directly from admin detail pages
- ✅ 4 email templates (Schedule Interview, Application Follow-up, Care Inquiry Follow-up, Status Update)
- ✅ Template picker with auto-fill subject/body
- ✅ Email history log per entity (applicant, contact, inquiry)
- ✅ Emails sent via Resend and recorded in `AdminEmail` database table
- ✅ All email sends logged in audit trail

**Key Files:**
- `components/admin/send-email-dialog.tsx` — Dialog with template picker
- `components/admin/email-history.tsx` — Per-entity email history display
- `data/email-templates.ts` — Shared template definitions
- `app/actions/admin-email.ts` — `sendAdminEmail()`, `getEntityEmailHistory()` server actions
- `prisma/schema.prisma` — `AdminEmail` model

**Database Model:**
```prisma
model AdminEmail {
  id         String   @id @default(cuid())
  sentBy     String
  sentByName String?
  toEmail    String
  toName     String?
  subject    String
  body       String   @db.Text
  template   String?
  entity     String?
  entityId   String?
  resendId   String?
  status     String   @default("SENT")
  createdAt  DateTime @default(now())
  @@index([entity, entityId])
  @@index([sentBy])
  @@index([createdAt])
}
```

**Effort:** 8-12 hours  
**Impact:** High

---

### 4. Activity/Audit Log ✅

**Status:** Implemented  
**Implemented:** March 19, 2026

Full audit logging with dedicated admin page and per-entity timelines:

- ✅ `AuditLog` model in Prisma schema with indexes
- ✅ All admin actions logged (status changes, emails sent, bulk operations)
- ✅ Dedicated `/admin/audit-log` page with filterable table
- ✅ Per-entity activity timeline on detail pages (e.g., application detail sidebar)
- ✅ Color-coded action badges and entity type badges
- ✅ Navigation link in admin sidebar

**Key Files:**
- `app/actions/audit-log.ts` — `logAuditEvent()`, `getEntityAuditLog()`, `getFilteredAuditLog()`
- `app/admin/audit-log/page.tsx` — Server component fetching logs
- `app/admin/audit-log/audit-log-table.tsx` — Client table with entity/action filters
- `components/admin/audit-timeline.tsx` — Per-entity timeline with emoji icons
- `components/admin/sidebar.tsx` — Added Activity Log nav item

**Database Model:**
```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  userName  String?
  action    String
  entity    String
  entityId  String
  details   Json?
  createdAt DateTime @default(now())
  @@index([entity, entityId])
  @@index([userId])
  @@index([createdAt])
}
```

**Effort:** 6-8 hours  
**Impact:** High (Compliance)

---

### 5. Real-time Notifications ✅

**Status:** Implemented  
**Implemented:** March 19, 2026

In-app notification system with bell icon and polling:

- ✅ Toast notifications via sonner (on bulk actions, email sends, status changes)
- ✅ Notification bell with unread count badge in admin sidebar header
- ✅ Dropdown showing recent notifications with mark-read actions
- ✅ Mark individual or all notifications as read
- ✅ Polls every 30 seconds for new notifications
- ✅ Uses existing `Notification` model with `channel: 'IN_APP'`
- ⬜ Browser push notifications (future)
- ⬜ Real-time via WebSocket/SSE (future — currently polling)

**Key Files:**
- `components/admin/notification-bell.tsx` — Bell icon with dropdown, polls every 30s
- `components/ui/sonner.tsx` — Toaster wrapper with theme support
- `app/actions/notifications.ts` — `getUnreadNotificationCount()`, `getRecentNotifications()`, `markNotificationRead()`, `markAllNotificationsRead()`
- `app/admin/layout.tsx` — Toaster component added

**Dependencies Added:**
- `sonner@2.0.7` — Toast notification library

**Effort:** 8-12 hours  
**Impact:** Medium-High

---

## 📊 Analytics & Reporting Enhancements

### 6. Analytics Dashboard ✅

**Status:** Implemented  
**Implemented:** March 19, 2026

Dedicated analytics page at `/admin/analytics` with interactive Recharts-powered visualizations:

- ✅ Applications, inquiries, and contacts over time (area chart, last 6 months)
- ✅ Conversion funnel: Submitted → Reviewing → Interview → Offered → Hired (bar chart)
- ✅ Service source tracking — which services drive the most inquiries (horizontal bar chart)
- ✅ Department breakdown — applications by department (donut/pie chart)
- ✅ Peak submission hours (bar chart, 24-hour breakdown)
- ✅ Peak submission days (bar chart, day-of-week breakdown)
- ✅ KPI summary cards: total applications, inquiries, contacts, conversion rate
- ✅ Analytics nav item added to admin sidebar

**Key Files:**
- `app/admin/analytics/page.tsx` — Server component page
- `components/admin/analytics-dashboard.tsx` — Client component with all charts
- `app/actions/analytics.ts` — `getAnalyticsSummary()` server action with auth check
- `components/admin/sidebar.tsx` — Added Analytics nav item

**Dependencies Added:**
- `recharts@3.8.0` — React charting library

**Effort:** 12-16 hours  
**Impact:** High

### 7. Export Functionality

- CSV/Excel export for all tables
- PDF report generation (weekly/monthly summary)
- Scheduled email reports to admin

**Effort:** 6-8 hours  
**Impact:** Medium

---

## 🔧 UX Improvements

### 8. Keyboard Shortcuts ✅

**Status:** Implemented  
**Implemented:** March 19, 2026

Portal-wide keyboard shortcuts with help dialog:

- ✅ `⌘K` opens command palette
- ✅ `G + key` navigation sequences (G D → Dashboard, G A → Applications, etc.)
- ✅ `/` to focus table search input
- ✅ `?` to show shortcuts help dialog
- ✅ Category-organized help dialog (Global, Navigation, Table Navigation)
- ✅ Context-aware — disabled when input fields are focused

**Key Files:**
- `components/admin/keyboard-shortcuts.tsx` — `AdminShortcuts` component, `ShortcutsHelp` dialog, `useAdminShortcuts` hook
- `app/admin/layout.tsx` — Shortcuts component integrated

**Effort:** 4-6 hours  
**Impact:** Medium

### 9. Kanban View for Applications ✅

**Status:** Implemented  
**Implemented:** March 19, 2026

Alternative to table view showing applications as cards in Kanban columns:

- ✅ Columns: Pending → Reviewing → Interview → Offered → Hired
- ✅ Drag-and-drop to change status with instant server update
- ✅ Cards show applicant name, job title, experience, submission date
- ✅ Visual drag indicators and drop zone highlighting
- ✅ Rejected/Withdrawn shown in a separate footer section
- ✅ Table/Kanban toggle in applications page header

**Key Files:**
- `components/admin/applications-kanban.tsx` — Kanban board with drag-and-drop
- `app/admin/applications/applications-view.tsx` — Toggle between Table/Kanban views
- `app/admin/applications/page.tsx` — Updated to use `ApplicationsView`

**Effort:** 8-12 hours  
**Impact:** Medium

### 10. Quick Actions/Command Palette ✅

**Status:** Implemented  
**Implemented:** March 19, 2026

Full command palette with `⌘K` / `Ctrl+K` for fast navigation and actions:

- ✅ `⌘K` command palette for fast navigation to all admin pages
- ✅ Quick create actions (New Job, New Shift)
- ✅ Theme switching (Light/Dark mode) from command palette
- ✅ Keyboard shortcuts help access
- ✅ Search trigger button in sidebar with `⌘K` hint
- ✅ Uses cmdk + shadcn/ui Command component

**Key Files:**
- `components/admin/command-palette.tsx` — `CommandPalette` and `CommandPaletteTrigger`
- `components/ui/command.tsx` — shadcn/ui Command component (cmdk)
- `app/admin/layout.tsx` — Command palette integrated

**Dependencies Added:**
- `cmdk@1.1.1` — Command menu component

**Effort:** 6-8 hours  
**Impact:** Medium

### 11. Enhanced Mobile Experience ✅

**Status:** Implemented  
**Implemented:** March 19, 2026

Full mobile-responsive admin experience:

- ✅ Mobile drawer sidebar using Sheet component (slide from left)
- ✅ Sticky mobile header bar with hamburger menu, logo, and notification bell
- ✅ Desktop sidebar hidden on mobile, drawer shown instead
- ✅ Navigation links close drawer on tap
- ✅ Command palette trigger in mobile drawer
- ⬜ Swipe actions on table rows (future)
- ⬜ Bottom navigation bar (future)

**Key Files:**
- `components/admin/sidebar.tsx` — Mobile Sheet drawer + desktop sidebar
- `components/ui/sheet.tsx` — shadcn/ui Sheet component

**Effort:** 6-8 hours  
**Impact:** Medium

---

## 👥 User & Role Management

### 12. Role-Based Access Control (RBAC) ✅

**Status:** Implemented  
**Implemented:** March 19, 2026

Full RBAC system using Clerk metadata + database:

- ✅ **Super Admin**: Full access (wildcard `*` permissions)
- ✅ **HR Manager**: Applications, jobs, workers, compliance, timesheets, payroll, analytics
- ✅ **Content Manager**: Testimonials, contacts, inquiries, analytics
- ✅ **Viewer**: Read-only access across all entities
- ✅ Permissions stored in Clerk `publicMetadata.adminRole`
- ✅ Server-side permission checking via `hasPermission()` and `getCurrentAdminRole()`
- ✅ Self-demotion prevention for Super Admins

**Key Files:**
- `lib/rbac.ts` — `AdminRole` type, `ROLE_PERMISSIONS` definitions, `ADMIN_ROLE_LABELS`
- `app/actions/rbac.ts` — Server actions: `getAdminRole()`, `hasPermission()`, `getCurrentPermissions()`, `getCurrentAdminRole()`, `updateUserAdminRole()`, `inviteAdminUser()`, `deactivateAdminUser()`, `reactivateAdminUser()`

**Effort:** 8-12 hours  
**Impact:** High (as team grows)

### 13. User Management Page ✅

**Status:** Implemented  
**Implemented:** March 19, 2026

Dedicated admin user management page at `/admin/users`:

- ✅ List all admin/manager portal users with role badges
- ✅ Invite new admins via Clerk invitations with role assignment
- ✅ Edit role dialog with permission preview
- ✅ Deactivate/reactivate admin users
- ✅ Role legend showing all roles and permission counts
- ✅ User Management nav item added to admin sidebar
- ✅ Super Admin-only access restriction

**Key Files:**
- `app/admin/users/page.tsx` — Server component with access control
- `app/admin/users/users-management.tsx` — Client component with user cards, invite dialog, edit role dialog
- `components/admin/sidebar.tsx` — Added User Management nav item

**Effort:** 8-12 hours  
**Impact:** Medium

---

## 📝 Content Management Enhancements

### 14. Testimonial Workflow

- **Request testimonials**: Send email to past clients
- **Approval workflow**: Submitted → Under Review → Published
- **Rich text editor** for testimonial content
- **Video testimonial** support (embed/upload)

**Effort:** 6-8 hours  
**Impact:** Medium

### 15. FAQ Management (New Feature)

Add database-backed FAQs:

```prisma
model FAQ {
  id          String   @id @default(cuid())
  question    String
  answer      String   @db.Text
  category    String
  order       Int      @default(0)
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Effort:** 6-8 hours  
**Impact:** Medium

### 16. Service Management (New Feature)

Move services to database for CMS-style editing:

- Add/edit/remove services
- Reorder services
- Toggle active/inactive

**Effort:** 8-12 hours  
**Impact:** Medium

---

## 🔔 Communication Features

### 17. Internal Notes System

Already partially in schema (`internalNotes`), but enhance:

- Threaded notes per application/contact
- @mention other admins
- Inline file attachments

**Effort:** 8-12 hours  
**Impact:** Medium

### 18. SMS Integration (Twilio)

- Send appointment reminders
- Quick status update texts
- Two-way SMS thread view in admin

**Effort:** 8-12 hours  
**Impact:** High

### 19. Calendar/Scheduling Integration

- Embed interview calendar (Calendly, Cal.com)
- View scheduled interviews in admin
- Sync with Google Calendar/Outlook

**Effort:** 12-16 hours  
**Impact:** Medium

---

## 🛡️ Security & Compliance

### 20. Session Management

- Active sessions view
- Force logout from all devices
- Login history with IP/device info

**Effort:** 4-6 hours  
**Impact:** Medium

### 21. Data Retention Policies

- Auto-archive old records (configurable)
- GDPR data export/deletion for contacts
- Retention policy warnings in UI

**Effort:** 8-12 hours  
**Impact:** Medium (Compliance)

### 22. Sensitive Data Masking

- Mask phone/email in list views (reveal on hover)
- Role-based field visibility

**Effort:** 4-6 hours  
**Impact:** Medium

---

## 💡 Quick Wins (Low Effort, High Impact)

| Feature | Effort | Description |
|---------|--------|-------------|
| Dark mode toggle in admin header | 1 hr | Already have theme provider |
| Breadcrumb navigation | 2 hrs | Show path: Admin > Applications > John Doe |
| Empty state illustrations | 2 hrs | Friendly messages when no data |
| Inline status edit | 2 hrs | Dropdown in table to change status without opening detail |
| Recently viewed | 3 hrs | Sidebar section showing last 5 viewed records |
| Duplicate detection | 4 hrs | Warn if same email submits multiple times |
| File preview | 3 hrs | Preview PDFs/docs inline instead of download |

---

## Implementation Priority Matrix

```
                    HIGH IMPACT
                        │
    ┌───────────────────┼───────────────────┐
    │                   │                   │
    │  ✅ Search/Filter │   Analytics       │
    │  ✅ Bulk Actions  │   Kanban View     │
    │  ✅ Audit Log     │   Calendar        │
    │  ✅ Email in Admin│                   │
LOW ├───────────────────┼───────────────────┤ HIGH
EFFORT                  │                   EFFORT
    │  Breadcrumbs      │   RBAC            │
    │  Inline Edit      │   User Mgmt       │
    │  Dark Mode        │   SMS Integration │
    │  Empty States     │   CMS Features    │
    │                   │                   │
    └───────────────────┼───────────────────┘
                        │
                    LOW IMPACT
```

---

## Recommended Roadmap

### ~~Sprint Next: Foundation~~ ✅ Complete (March 19, 2026)

1. ✅ Search & Filtering — Per-table filters on all list views
2. Breadcrumb navigation (2 hrs) — Not yet started
3. Inline status edit (2 hrs) — Not yet started

### ~~Sprint +1: Productivity~~ ✅ Complete (March 19, 2026)

1. ✅ Bulk Actions — Select, bulk update, bulk delete, CSV export
2. ✅ Audit Log — Full audit trail with dedicated page and per-entity timelines
3. ✅ Export to CSV — Integrated into DataTable via `exportable` prop

### ~~Sprint +2: Communication~~ ✅ Partially Complete (March 19, 2026)

1. ✅ Email from Admin — Send emails with templates, history tracking
2. SMS Integration (8-12 hrs) — Not yet started

### ~~Sprint Next: Analytics & Polish~~ ✅ Complete (March 19, 2026)

1. ✅ Analytics Dashboard (12-16 hrs) — Implemented March 19, 2026
2. ✅ Kanban View (8-12 hrs) — Implemented March 19, 2026
3. ✅ Quick Actions / Command Palette (6-8 hrs) — Implemented March 19, 2026
4. Breadcrumb navigation (2 hrs) — Not yet started
5. Inline status edit (2 hrs) — Not yet started

### ~~Sprint +1: UX & Access Control~~ ✅ Partially Complete (March 19, 2026)

1. ✅ Keyboard Shortcuts (4-6 hrs) — Implemented March 19, 2026
2. ✅ Enhanced Mobile Experience (6-8 hrs) — Implemented March 19, 2026
3. ✅ RBAC system (8-12 hrs) — Implemented March 19, 2026
4. ✅ User Management Page (8-12 hrs) — Implemented March 19, 2026

### Sprint Next: Communication & Polish

1. SMS Integration (8-12 hrs)
2. Global search bar (4-6 hrs)
3. URL-based filter state (2-4 hrs)
4. Breadcrumb navigation (2 hrs)
5. Inline status edit (2 hrs)

---

*Last updated: March 19, 2026 — UX Improvements (#8-11) and User & Role Management (#12-13) implemented*
