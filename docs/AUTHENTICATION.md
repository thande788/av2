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

### Local Development: User Redirects to `/portals`

**Problem:** When signing in locally, users are redirected to `/portals` instead of their portal.

**Cause:** Clerk webhooks cannot reach `localhost:3000`, so:
- No `PortalUser` record is created in the database
- No role is synced to Clerk `publicMetadata`

**Solutions:**

1. **Manual: Set role in Clerk Dashboard (fastest)**
   - Clerk Dashboard → Users → Select user → Edit Public Metadata
   - Add: `{ "role": "caregiver" }` (or admin, manager, client)

2. **Script: Sync role from database or set manually**
   ```bash
   # Set role directly
   pnpm tsx scripts/sync-clerk-role.ts user_XXXXX caregiver
   
   # Sync from database (if user exists there)
   pnpm tsx scripts/sync-clerk-role.ts user_XXXXX
   ```

3. **ngrok: Enable webhooks locally**
   ```bash
   ngrok http 3000
   # Update Clerk Dashboard → Webhooks → Endpoint URL to ngrok URL
   ```

## Role vs Route Clarification

> **Important:** The **role** name does not match the **route** name for employees.

| Clerk Role | Database Role | Portal Route | Access |
|------------|---------------|--------------|--------|
| `admin` | `ADMIN` | `/admin` | All portals |
| `manager` | `MANAGER` | `/admin` | All portals |
| `caregiver` | `CAREGIVER` | `/employee` | Employee portal only |
| `client` | `CLIENT` | `/client` | Client portal only |

The role stored in Clerk and the database is `caregiver`, but the route is `/employee`. This is intentional - caregivers are employees of the agency.

## Database Queries

### List All Portal Users

```bash
# List all users
pnpm tsx scripts/list-users.ts

# Filter by role
pnpm tsx scripts/list-users.ts caregiver

# Point to production database
DATABASE_URL="postgresql://..." pnpm tsx scripts/list-users.ts
```

### Sync Clerk Role

```bash
# Set role for a user
pnpm tsx scripts/sync-clerk-role.ts user_2abc123def caregiver

# Sync from database (if user exists)
pnpm tsx scripts/sync-clerk-role.ts user_2abc123def
```

### Prisma Studio (GUI)

```bash
# Local database
pnpm prisma studio

# Production database
DATABASE_URL="postgresql://..." pnpm prisma studio
```

Opens a web UI at `http://localhost:5555` to browse all tables.

### Direct SQL Query

```sql
-- List all portal users
SELECT id, "clerkId", email, role, status, "createdAt" 
FROM "PortalUser" 
ORDER BY "createdAt" DESC;

-- Find user by email
SELECT * FROM "PortalUser" WHERE email = 'user@example.com';

-- Count users by role
SELECT role, COUNT(*) FROM "PortalUser" GROUP BY role;
```

## Role Resolution & Fallback Chain

The middleware (`proxy.ts`) and RBAC helpers (`app/actions/rbac.ts`) resolve a user's role using a three-tier fallback chain:

```
1. Session Claims (sessionClaims.metadata.role)
   │ fastest — cached in the JWT
   ▼ (miss)
2. Clerk publicMetadata.role
   │ fetched via clerkClient().users.getUser()
   ▼ (miss)
3. Database (PortalUser.role)
   │ queried via Prisma
   └──► if found, auto-syncs role back to Clerk publicMetadata
```

This means **you do not need to pre-set Clerk metadata for every user**. If the role exists in the database, the middleware will find it and sync it to Clerk automatically on the user's next request.

### Admin Sub-Roles (RBAC)

Fine-grained admin permissions follow a similar cascade:

| Source | Field | Example |
|--------|-------|---------|
| Clerk metadata | `publicMetadata.adminRole` | `SUPER_ADMIN` |
| Clerk metadata (fallback) | `publicMetadata.role` mapped to admin role | `admin` → `SUPER_ADMIN` |
| Database (fallback) | `PortalUser.role` | `ADMIN` → `SUPER_ADMIN` |

Sub-roles: `SUPER_ADMIN`, `HR_MANAGER`, `CONTENT_MANAGER`, `VIEWER` (defined in `lib/rbac.ts`).

## Bootstrapping the First Admin (Production)

When deploying to production for the first time, there is a bootstrap problem: no admin user exists to approve other users through the admin portal.

### Option 1: Set Role in Clerk Dashboard (Recommended)

1. Sign up on the production site (creates a `PortalUser` with `status: PENDING`)
2. Go to [Clerk Dashboard](https://dashboard.clerk.com) → **Users** → select your user
3. Edit **Public Metadata** and set:
   ```json
   {
     "role": "admin"
   }
   ```
4. Visit `/admin` — you now have full access

### Option 2: Use the Sync Script

```bash
# Point to your production database and Clerk keys
CLERK_SECRET_KEY="sk_live_..." DATABASE_URL="postgresql://..." \
  pnpm tsx scripts/sync-clerk-role.ts user_XXXXX admin
```

### Option 3: Update the Database Directly

```sql
-- Set the first user as admin
UPDATE "PortalUser"
SET role = 'ADMIN', status = 'ACTIVE'
WHERE email = 'your-email@example.com';
```

The middleware will detect the database role on the next request and sync it to Clerk automatically.

> **After the first admin exists**, all subsequent role assignments can be done through the Admin Portal UI (Admin → Users / Workers).

## Security Considerations

- Middleware runs on every request to protected routes
- Role is verified server-side, not client-side
- Session tokens are short-lived and auto-refreshed
- Public routes are explicitly allowlisted
