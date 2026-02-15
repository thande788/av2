# Admin Dashboard Enhancement Recommendations

> **Document Created:** February 15, 2026  
> **Status:** Planning  
> **Related:** [backend_plan.md](../backend_plan.md), [portal_plan.md](./portal_plan.md)

---

## Overview

This document outlines recommended enhancements for the Angel Touch Homecare admin dashboard, organized by priority and effort level.

---

## 🚀 High-Priority Enhancements

### 1. Search & Filtering System (Partially Planned)

Currently missing from all list views. Add:

- Global search bar in sidebar/header
- Per-table filters (status, date range, department)
- Saved filter presets for common queries
- URL-based filter state for shareable links

**Effort:** 6-8 hours  
**Impact:** High

### 2. Bulk Actions

- Select multiple applications/contacts/inquiries
- Bulk status updates, mark as read, export, delete
- Progress indicator for bulk operations

**Effort:** 4-6 hours  
**Impact:** High

### 3. Email Integration in Admin

- Send follow-up emails directly from admin (interview scheduling, status updates)
- Email templates for common responses
- Email history log per applicant/contact

**Effort:** 8-12 hours  
**Impact:** High

### 4. Activity/Audit Log

Add an `AuditLog` model to track all admin actions:

```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String   // Clerk user ID
  action    String   // "STATUS_CHANGE", "EMAIL_SENT", "NOTE_ADDED"
  entity    String   // "Application", "Contact", etc.
  entityId  String
  details   Json?    // Before/after state
  createdAt DateTime @default(now())
}
```

Display timeline on detail pages showing who did what and when.

**Effort:** 6-8 hours  
**Impact:** High (Compliance)

### 5. Real-time Notifications

- Toast notifications when new submissions arrive
- Notification bell with unread count in header
- Browser push notifications (optional)
- Consider using Vercel's `useSubscription` or Pusher

**Effort:** 8-12 hours  
**Impact:** Medium-High

---

## 📊 Analytics & Reporting Enhancements

### 6. Analytics Dashboard

Add a dedicated analytics page with:

- Applications over time (line chart)
- Conversion funnel: Submitted → Reviewing → Interview → Hired
- Source tracking (which page/service drove inquiries)
- Peak submission hours/days
- Department breakdown (pie chart)

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

### 8. Keyboard Shortcuts

- `⌘K` or `/` for quick search
- `j/k` for navigating table rows
- `e` to edit, `d` to delete selected item
- `?` to show shortcuts help

**Effort:** 4-6 hours  
**Impact:** Medium

### 9. Kanban View for Applications

Alternative to table view showing applications as cards in columns:

- Pending → Reviewing → Interview → Offered → Hired
- Drag-and-drop to change status

**Effort:** 8-12 hours  
**Impact:** Medium

### 10. Quick Actions/Command Palette

- `⌘K` command palette for fast navigation
- Quick create: new job, new testimonial
- Jump to specific records by ID/name

**Effort:** 6-8 hours  
**Impact:** Medium

### 11. Enhanced Mobile Experience

- Responsive sidebar (already collapsible, but add drawer on mobile)
- Swipe actions on table rows
- Bottom navigation bar for mobile

**Effort:** 6-8 hours  
**Impact:** Medium

---

## 👥 User & Role Management

### 12. Role-Based Access Control (RBAC)

Leverage Clerk's metadata to implement:

- **Super Admin**: Full access
- **HR Manager**: Applications, jobs access
- **Content Manager**: Testimonials, FAQs only
- **Viewer**: Read-only access

**Effort:** 8-12 hours  
**Impact:** High (as team grows)

### 13. User Management Page

- List admin users
- Invite new admins
- Assign/modify roles
- Activity history per user

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
    │  Search/Filter    │   Analytics       │
    │  Bulk Actions     │   Kanban View     │
    │  Audit Log        │   Calendar        │
    │  Email in Admin   │                   │
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

### Sprint Next: Foundation

1. Search & Filtering (6-8 hrs)
2. Breadcrumb navigation (2 hrs)
3. Inline status edit (2 hrs)

### Sprint +1: Productivity

1. Bulk Actions (4-6 hrs)
2. Audit Log (6-8 hrs)
3. Export to CSV (4 hrs)

### Sprint +2: Communication

1. Email from Admin (8-12 hrs)
2. SMS Integration (8-12 hrs)

### Sprint +3: Analytics & Polish

1. Analytics Dashboard (12-16 hrs)
2. Kanban View (8-12 hrs)
3. Quick Actions (6-8 hrs)

---

*This document should be updated as features are implemented.*
