# Authentication & Authorization

This document describes the authentication flow and role-based access control for Angel Touch Homecare portals.

## Authentication Provider

Authentication is handled by [Clerk](https://clerk.com). Users sign in via:
- Email/password
- Phone number (OTP)

## User Roles

| Role | Description | Database Value |
|------|-------------|----------------|
| **Admin** | Full system access, manages all users and settings | `ADMIN` |
| **Manager** | Similar to admin, manages day-to-day operations | `MANAGER` |
| **Caregiver** | Employee who provides care services | `CAREGIVER` |
| **Client** | Care recipient or family member | `CLIENT` |

Roles are stored in:
1. Clerk `publicMetadata.role` — Used for middleware authorization
2. `PortalUser.role` — Used for database queries

## Portal Access Matrix

| User Role | Admin Portal | Employee Portal | Client Portal |
|-----------|:------------:|:---------------:|:-------------:|
| **Admin** | ✅ | ✅ | ✅ |
| **Manager** | ✅ | ✅ | ✅ |
| **Caregiver** | ❌ | ✅ | ❌ |
| **Client** | ❌ | ❌ | ✅ |
| **No Role** | ❌ | ❌ | ❌ |

### Access Rules

- **Admin/Manager**: Can access all portals to view different user experiences
- **Caregiver**: Can only access Employee Portal; redirected from Admin/Client
- **Client**: Can only access Client Portal; redirected from Admin/Employee
- **Unauthenticated**: Redirected to sign-in page
- **No Role**: Redirected to `/portals` selection page

## URLs

| Portal | URL | Subdomain URL |
|--------|-----|---------------|
| Portal Selection | `/portals` | `app.angeltouch.services` |
| Admin Dashboard | `/admin` | `app.angeltouch.services/admin` |
| Employee Portal | `/employee` | `app.angeltouch.services/employee` |
| Client Portal | `/client` | `app.angeltouch.services/client` |

## Sign-In Flow

```
User visits /sign-in
    │
    ▼
Clerk authentication
    │
    ▼
Check user role from Clerk metadata
    │
    ├─── admin/manager ──► /admin
    ├─── caregiver ──────► /employee
    ├─── client ─────────► /client
    └─── no role ────────► /portals
```

## Sign-Out Flow

Signing out from any portal redirects to `/portals` (not the marketing home page), allowing users to:
- Sign in with a different account
- Select a different portal if they have multiple roles

## Middleware Authorization

Authorization is enforced in `proxy.ts` (Next.js middleware):

```typescript
// Route matchers
const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isEmployeeRoute = createRouteMatcher(['/employee(.*)']);
const isClientRoute = createRouteMatcher(['/client(.*)']);

// Access control helpers
const canAccessAdmin = (role) => role === 'admin' || role === 'manager';
const canAccessEmployee = (role) => role === 'admin' || role === 'manager' || role === 'caregiver';
const canAccessClient = (role) => role === 'admin' || role === 'manager' || role === 'client';
```

## Setting User Roles

### Via Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Users**
3. Select a user
4. Edit **Public Metadata**:
   ```json
   {
     "role": "admin"
   }
   ```

### Via Webhook (Automatic)

When users sign up, the Clerk webhook (`/api/webhooks/clerk`) creates a `PortalUser` record. The role can be set via:
- `publicMetadata.role` in Clerk
- `unsafeMetadata.role` during signup (for self-service caregiver registration)

### Via Admin Portal

Admins can update user roles in the Admin Portal under **Workers** or user management sections.

## Database Schema

```prisma
model PortalUser {
  id        String     @id @default(cuid())
  clerkId   String     @unique
  email     String     @unique
  role      UserRole
  status    UserStatus @default(PENDING)
  // ... other fields
}

enum UserRole {
  ADMIN
  MANAGER
  CAREGIVER
  CLIENT
}
```

## Troubleshooting

### User Can't Access Portal

1. Check Clerk Dashboard for the user's `publicMetadata.role`
2. Verify the role matches expected portal access
3. Check `PortalUser` table for matching `clerkId`

### Sign-In Redirects to Wrong Portal

The redirect is based on Clerk metadata role. Update the role in Clerk Dashboard.

### "Setting up your account" Stuck

The Clerk webhook may have failed. Check:
1. Vercel function logs for `/api/webhooks/clerk`
2. Clerk Dashboard → Webhooks → delivery status
3. The account creation will auto-retry on page refresh

## Security Considerations

- Middleware runs on every request to protected routes
- Role is verified server-side, not client-side
- Session tokens are short-lived and auto-refreshed
- Public routes are explicitly allowlisted
