# Deployment Guide

This guide covers deploying Angel Touch Homecare Services to production on Vercel.

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account** — [Sign up at vercel.com](https://vercel.com)
2. **Neon Database** — [Create a database at neon.tech](https://neon.tech)
3. **Clerk Application** — [Set up at clerk.com](https://clerk.com)
4. **Resend Account** — [Get API key at resend.com](https://resend.com)
5. **Twilio Account** — [Set up at twilio.com](https://twilio.com)
6. **Domain** — DNS access to configure `angeltouchhomecare.com`

## Step 1: Database Setup (Neon)

1. Create a new Neon project
2. Copy the connection string from the dashboard
3. The format should be: `postgresql://user:password@host.neon.tech/neondb?sslmode=require`

## Step 2: Clerk Setup

### Create Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Enable Email and Phone authentication methods
4. Copy the **Publishable Key** and **Secret Key**

### Configure Webhooks

1. Go to **Webhooks** in Clerk Dashboard
2. Add endpoint: `https://angeltouchhomecare.com/api/webhooks/clerk`
3. Select events to listen for:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy the **Signing Secret** for `CLERK_WEBHOOK_SECRET`

### Configure Redirect URLs

In Clerk Dashboard → Paths:

| Setting | Value |
|---------|-------|
| Sign-in URL | `/sign-in` |
| Sign-up URL | `/sign-up` |
| After sign-in URL | `/` |
| After sign-up URL | `/` |

## Step 3: Resend Setup

1. Create account at [resend.com](https://resend.com)
2. Verify your sending domain (`angeltouch.services`)
3. Generate an API key
4. Copy the key for `RESEND_API_KEY`

## Step 4: Twilio Setup

1. Create account at [twilio.com](https://twilio.com)
2. Get a phone number with SMS capability
3. Copy from the Console:
   - Account SID → `TWILIO_ACCOUNT_SID`
   - Auth Token → `TWILIO_AUTH_TOKEN`
   - Phone Number → `TWILIO_PHONE_NUMBER`

## Step 5: Vercel Blob Storage

1. In Vercel Dashboard, go to your project
2. Navigate to **Storage** → **Create Database** → **Blob**
3. Connect to your project
4. The `BLOB_READ_WRITE_TOKEN` will be automatically added

## Step 6: Deploy to Vercel

### Option A: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option B: Via GitHub Integration

1. Push your code to GitHub
2. Import the repository in Vercel Dashboard
3. Vercel will auto-deploy on every push to `main`

## Step 7: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

### Required Variables

```
DATABASE_URL=postgresql://user:password@host.neon.tech/neondb?sslmode=require

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx

RESEND_API_KEY=re_xxxxx
FROM_EMAIL=Angel Touch Homecare <noreply@angeltouch.services>
ADMIN_EMAIL=admin@angeltouch.services

TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx

NEXT_PUBLIC_APP_URL=https://angeltouchhomecare.com
NEXT_PUBLIC_SITE_URL=https://angeltouch.services
```

### Feature Flags

```
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_FEATURE_EMPLOYEE_PORTAL=true
NEXT_PUBLIC_FEATURE_CLIENT_PORTAL=true
NEXT_PUBLIC_FEATURE_SHIFTS=true
NEXT_PUBLIC_FEATURE_SMS=true
NEXT_PUBLIC_FEATURE_TIMESHEETS=true
NEXT_PUBLIC_FEATURE_INVOICING=true
NEXT_PUBLIC_FEATURE_COMPLIANCE=true
NEXT_PUBLIC_FEATURE_PAYROLL=true
NEXT_PUBLIC_FEATURE_WORKERS=true
NEXT_PUBLIC_FEATURE_CLIENTS=true
```

### Optional Variables

```
REQUIRE_ANTIVIRUS_SCAN=false
ANALYZE=false
```

## Step 8: Database Migration

After deploying, run the database migration:

```bash
# Push schema to production database
DATABASE_URL="your-production-url" pnpm db:push

# Optional: Seed with initial data
DATABASE_URL="your-production-url" pnpm db:seed
```

## Step 9: Configure Domain

### In Vercel Dashboard

1. Go to **Settings** → **Domains**
2. Add `angeltouchhomecare.com`
3. Add `www.angeltouchhomecare.com` (redirects to apex)

### In DNS Provider

Add these records:

| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

## Post-Deployment Checklist

- [ ] Verify homepage loads at production URL
- [ ] Test Clerk sign-in/sign-up flow
- [ ] Verify Clerk webhook is receiving events (check Clerk Dashboard logs)
- [ ] Test contact form submission (check email delivery)
- [ ] Test SMS notifications (if enabled)
- [ ] Verify file uploads work (Vercel Blob)
- [ ] Check admin portal access
- [ ] Verify database connectivity

## Monitoring

### Vercel Analytics

Enable in Vercel Dashboard → Analytics for:
- Page views and unique visitors
- Web Vitals (LCP, FID, CLS)
- Function execution times

### Error Tracking

Consider adding Sentry for error tracking:

```bash
pnpm add @sentry/nextjs
```

## Rollback

To rollback to a previous deployment:

1. Go to Vercel Dashboard → Deployments
2. Find the previous working deployment
3. Click **...** → **Promote to Production**

## Troubleshooting

### Build Fails with Prisma Error

Ensure `prisma generate` runs during build:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

### Clerk Webhook 401 Errors

- Verify `CLERK_WEBHOOK_SECRET` matches the signing secret in Clerk Dashboard
- Ensure the webhook URL is exactly `https://angeltouchhomecare.com/api/webhooks/clerk`

### Database Connection Issues

- Verify `DATABASE_URL` includes `?sslmode=require` for Neon
- Check Neon compute is not suspended (auto-suspends after inactivity)

### File Upload Fails

- Ensure `BLOB_READ_WRITE_TOKEN` is set
- Check Vercel Blob storage is connected to the project
