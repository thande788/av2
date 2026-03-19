# Environment Variables Reference

Complete reference for all environment variables used in Angel Touch Homecare Services.

## Quick Setup

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

## Variable Reference

### Database

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Neon) | `postgresql://user:pass@host.neon.tech/db?sslmode=require` |

**Notes:**
- Must include `?sslmode=require` for Neon
- Connection pooling is handled by `@neondatabase/serverless`

---

### Authentication (Clerk)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Public key for client-side auth | `pk_live_xxx` or `pk_test_xxx` |
| `CLERK_SECRET_KEY` | Yes | Secret key for server-side auth | `sk_live_xxx` or `sk_test_xxx` |
| `CLERK_WEBHOOK_SECRET` | Prod | Webhook signing secret | `whsec_xxx` |

**Redirect URLs (Optional):**

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | Sign-in page path |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` | Sign-up page path |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/` | Redirect after sign-in |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/` | Redirect after sign-up |

**Get from:** [Clerk Dashboard](https://dashboard.clerk.com) → API Keys

---

### Email (Resend)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `RESEND_API_KEY` | Prod | Resend API key | `re_xxx` |
| `FROM_EMAIL` | No | Sender email address | `Angel Touch <noreply@angeltouch.services>` |
| `ADMIN_EMAIL` | No | Admin notification recipient | `admin@angeltouch.services` |

**Get from:** [Resend Dashboard](https://resend.com/api-keys)

---

### SMS (Twilio)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `TWILIO_ACCOUNT_SID` | Prod | Twilio Account SID | `ACxxx` |
| `TWILIO_AUTH_TOKEN` | Prod | Twilio Auth Token | `xxx` |
| `TWILIO_PHONE_NUMBER` | Prod | SMS sending number | `+1xxxxxxxxxx` |

**Get from:** [Twilio Console](https://console.twilio.com)

---

### Payments (Stripe)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Prod | Stripe API secret key | `sk_live_xxx` or `sk_test_xxx` |
| `STRIPE_WEBHOOK_SECRET` | Prod | Stripe webhook signing secret | `whsec_xxx` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Prod | Stripe public key (for client-side) | `pk_live_xxx` or `pk_test_xxx` |

**Get from:** [Stripe Dashboard](https://dashboard.stripe.com/apikeys)

**Notes:**
- Required only when `NEXT_PUBLIC_FEATURE_INVOICE_PAYMENTS=true`
- Use test keys for development (`sk_test_`, `pk_test_`)
- Webhook secret from Stripe Dashboard → Developers → Webhooks

---

### Cron Jobs

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `CRON_SECRET` | Prod | Secret for authenticating Vercel Cron requests | Random string |

**Notes:**
- Used by `/api/cron/shift-reminders` to validate cron invocations
- Set in Vercel Environment Variables; Vercel auto-sends this header

---

### File Storage (Vercel Blob)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `BLOB_READ_WRITE_TOKEN` | Prod | Vercel Blob access token | `vercel_blob_xxx` |

**Notes:**
- Auto-configured when connecting Vercel Blob to your project
- Required for file uploads (resumes, compliance documents)

---

### Site URLs

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | No | Primary site URL (for webhooks) | `https://angeltouchhomecare.com` |
| `NEXT_PUBLIC_SITE_URL` | No | Site URL (for emails) | `https://angeltouch.services` |

**Notes:**
- These may be consolidated in the future
- Default fallbacks exist in code

---

### Feature Flags

All feature flags are optional and default to `false`.

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_DEMO_MODE` | `false` | Enable all features for demo |
| `NEXT_PUBLIC_FEATURE_EMPLOYEE_PORTAL` | `false` | Employee portal access |
| `NEXT_PUBLIC_FEATURE_CLIENT_PORTAL` | `false` | Client portal access |
| `NEXT_PUBLIC_FEATURE_SHIFTS` | `false` | Shift scheduling features |
| `NEXT_PUBLIC_FEATURE_SMS` | `false` | SMS notifications |
| `NEXT_PUBLIC_FEATURE_TIMESHEETS` | `false` | Timesheet management |
| `NEXT_PUBLIC_FEATURE_INVOICING` | `false` | Invoice generation |
| `NEXT_PUBLIC_FEATURE_COMPLIANCE` | `false` | Compliance document tracking |
| `NEXT_PUBLIC_FEATURE_PAYROLL` | `false` | Payroll export features |
| `NEXT_PUBLIC_FEATURE_WORKERS` | `false` | Worker management |
| `NEXT_PUBLIC_FEATURE_CLIENTS` | `false` | Client management |
| `NEXT_PUBLIC_FEATURE_REVIEWS` | `false` | Shift reviews and ratings |
| `NEXT_PUBLIC_FEATURE_AVAILABILITY_CALENDAR` | `false` | Real-time availability calendar |
| `NEXT_PUBLIC_FEATURE_SHIFT_BROADCAST` | `false` | Shift broadcast controls (targeted SMS) |
| `NEXT_PUBLIC_FEATURE_SHIFT_NOTES` | `false` | Shift notes & handoff |
| `NEXT_PUBLIC_FEATURE_EMERGENCY` | `false` | Emergency contact & escalation |
| `NEXT_PUBLIC_FEATURE_SHIFT_REMINDERS` | `false` | Automated shift reminders (cron) |
| `NEXT_PUBLIC_FEATURE_SATISFACTION` | `false` | Client satisfaction tracking |
| `NEXT_PUBLIC_FEATURE_SHIFT_SWAPS` | `false` | Shift swap requests |
| `NEXT_PUBLIC_FEATURE_INVOICE_PAYMENTS` | `false` | Invoice payment portal (Stripe) |

**Notes:**
- `NEXT_PUBLIC_` prefix makes these available in client components
- Setting `NEXT_PUBLIC_DEMO_MODE=true` enables all features

---

### Antivirus Scanning (ClamAV)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REQUIRE_ANTIVIRUS_SCAN` | No | `false` | Require virus scanning for uploads |
| `CLAMAV_SOCKET` | No | `/var/run/clamav/clamd.sock` | ClamAV socket path |
| `CLAMAV_HOST` | No | `127.0.0.1` | ClamAV daemon host |
| `CLAMAV_PORT` | No | `3310` | ClamAV daemon port |
| `CLAMAV_PATH` | No | `/usr/bin/clamscan` | ClamAV binary path |

**Notes:**
- Only needed if running ClamAV in production
- Leave disabled for most deployments

---

### Build & Debug

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANALYZE` | No | `false` | Enable webpack bundle analyzer |
| `NODE_ENV` | No | Auto-set | `development` or `production` |

---

## Environment Files

| File | Purpose | Git Ignored |
|------|---------|-------------|
| `.env` | Shared defaults (non-sensitive) | No |
| `.env.local` | Local development overrides | Yes |
| `.env.development` | Development-specific | Yes |
| `.env.production` | Production template | Yes |

**Priority order:** `.env.local` > `.env.development`/`.env.production` > `.env`

---

## Example .env.local (Development)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/angeltouchhomecare"

# Clerk (use test keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxx"
CLERK_SECRET_KEY="sk_test_xxx"

# Feature flags
NEXT_PUBLIC_DEMO_MODE="true"
```

---

## Example Production Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host.neon.tech/neondb?sslmode=require"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_xxx"
CLERK_SECRET_KEY="sk_live_xxx"
CLERK_WEBHOOK_SECRET="whsec_xxx"

# Email
RESEND_API_KEY="re_xxx"
FROM_EMAIL="Angel Touch Homecare <noreply@angeltouch.services>"
ADMIN_EMAIL="admin@angeltouch.services"

# SMS
TWILIO_ACCOUNT_SID="ACxxx"
TWILIO_AUTH_TOKEN="xxx"
TWILIO_PHONE_NUMBER="+1xxxxxxxxxx"

# Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_xxx"

# URLs
NEXT_PUBLIC_APP_URL="https://angeltouchhomecare.com"
NEXT_PUBLIC_SITE_URL="https://angeltouch.services"

# Features
NEXT_PUBLIC_DEMO_MODE="false"
NEXT_PUBLIC_FEATURE_EMPLOYEE_PORTAL="true"
NEXT_PUBLIC_FEATURE_CLIENT_PORTAL="true"
NEXT_PUBLIC_FEATURE_SHIFTS="true"
NEXT_PUBLIC_FEATURE_SMS="true"
NEXT_PUBLIC_FEATURE_TIMESHEETS="true"
NEXT_PUBLIC_FEATURE_INVOICING="true"
NEXT_PUBLIC_FEATURE_COMPLIANCE="true"
NEXT_PUBLIC_FEATURE_PAYROLL="true"
NEXT_PUBLIC_FEATURE_WORKERS="true"
NEXT_PUBLIC_FEATURE_CLIENTS="true"
NEXT_PUBLIC_FEATURE_AVAILABILITY_CALENDAR="true"
NEXT_PUBLIC_FEATURE_SHIFT_BROADCAST="true"
NEXT_PUBLIC_FEATURE_SHIFT_NOTES="true"
NEXT_PUBLIC_FEATURE_EMERGENCY="true"
NEXT_PUBLIC_FEATURE_SHIFT_REMINDERS="true"
NEXT_PUBLIC_FEATURE_SATISFACTION="true"
NEXT_PUBLIC_FEATURE_SHIFT_SWAPS="true"
NEXT_PUBLIC_FEATURE_INVOICE_PAYMENTS="true"

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"

# Cron
CRON_SECRET="your-random-cron-secret"

# Security
REQUIRE_ANTIVIRUS_SCAN="false"

# Build
ANALYZE="false"
```

---

## Security Notes

1. **Never commit secrets** — All `.env*.local` files are git-ignored
2. **Use Vercel Environment Variables** — Set production secrets in Vercel Dashboard
3. **Rotate keys regularly** — Especially after team member departures
4. **Use test keys for development** — Clerk provides separate test/live keys
