# Angel Touch Homecare Services

A modern web application for Angel Touch Homecare Services, a Massachusetts-based home care agency providing compassionate, non-medical in-home care services to seniors and individuals with disabilities.

**Live Site:** [angeltouchhomecare.com](https://angeltouchhomecare.com)

## Overview

This application includes:

- **Marketing Website** — Public pages for services, careers, testimonials, and contact
- **Admin Portal** — Staff dashboard for managing clients, workers, shifts, payroll, and compliance
- **Employee Portal** — Caregiver interface for shifts, timesheets, and compliance documents
- **Client Portal** — Family/client interface for care schedules and invoices

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui + Radix |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 7 |
| Auth | Clerk |
| Email | Resend |
| SMS | Twilio |
| File Storage | Vercel Blob |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database (Neon recommended)
- Clerk account
- Resend account (for emails)
- Twilio account (for SMS)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/angel-touch-homecare.git
cd angel-touch-homecare

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Push database schema
pnpm db:push

# Seed database (optional)
pnpm db:seed

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Public pages (home, about, services, careers)
│   ├── admin/              # Admin portal routes
│   ├── employee/           # Employee portal routes
│   ├── client/             # Client portal routes
│   ├── api/                # API routes (upload, webhooks)
│   └── actions/            # Server actions
├── components/
│   ├── ui/                 # shadcn/ui base components
│   ├── layout/             # Navbar, Footer, Sidebar
│   ├── admin/              # Admin-specific components
│   ├── employee/           # Employee portal components
│   └── client/             # Client portal components
├── lib/                    # Utilities (auth, db, email, twilio)
├── prisma/                 # Database schema and migrations
├── data/                   # Static data and content
├── types/                  # TypeScript type definitions
└── docs/                   # Additional documentation
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint issues |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm format` | Format code with Prettier |
| `pnpm db:push` | Push schema changes to database |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:seed` | Seed database with sample data |

### Utility Scripts

| Command | Description |
|---------|-------------|
| `pnpm tsx scripts/list-users.ts` | List all portal users in database |
| `pnpm tsx scripts/list-users.ts caregiver` | Filter users by role |
| `pnpm tsx scripts/sync-clerk-role.ts <clerkId> <role>` | Sync role to Clerk |

For production database queries, prefix with `DATABASE_URL`:
```bash
DATABASE_URL="postgresql://..." pnpm tsx scripts/list-users.ts
```

## Environment Variables

See [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) for the complete list of required environment variables.

**Required for development:**

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

**Required for production:**

All development variables plus:
- `CLERK_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `BLOB_READ_WRITE_TOKEN`

## Database Schema

The application uses the following core models:

| Model | Description |
|-------|-------------|
| `PortalUser` | Authenticated users (admins, caregivers, clients) |
| `Worker` | Caregiver profiles with skills, pay rates, compliance |
| `Client` | Care recipients/families with service details |
| `CareShift` | Scheduled care shifts |
| `ShiftBooking` | Worker assignments to shifts |
| `Timesheet` | Weekly timesheets for payroll |
| `ComplianceDoc` | Worker compliance documents |
| `Invoice` | Client billing invoices |
| `Job` | Career listings |
| `Application` | Job applications |

Run `pnpm db:studio` to explore the database visually.

## Feature Flags

Features can be toggled via environment variables:

```env
NEXT_PUBLIC_DEMO_MODE="false"
NEXT_PUBLIC_FEATURE_EMPLOYEE_PORTAL="true"
NEXT_PUBLIC_FEATURE_CLIENT_PORTAL="true"
NEXT_PUBLIC_FEATURE_SHIFTS="true"
NEXT_PUBLIC_FEATURE_SMS="true"
NEXT_PUBLIC_FEATURE_TIMESHEETS="true"
NEXT_PUBLIC_FEATURE_COMPLIANCE="true"
NEXT_PUBLIC_FEATURE_PAYROLL="true"
```

## Webhooks

Configure these webhook endpoints in your service dashboards:

| Service | Endpoint | Purpose |
|---------|----------|---------|
| Clerk | `/api/webhooks/clerk` | User sync |

## Deployment

The application is deployed on Vercel. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

```bash
# Deploy to Vercel
vercel --prod
```

## Documentation

- [Environment Variables](docs/ENVIRONMENT.md) — Complete env var reference
- [Deployment Guide](docs/DEPLOYMENT.md) — Production deployment instructions
- [Authentication & Roles](docs/AUTHENTICATION.md) — Portal access control
- [API Reference](docs/API.md) — Server actions and API routes
- [Development Guide](.github/copilot-instructions.md) — Code standards and patterns

## Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes following the code standards in `.github/copilot-instructions.md`
3. Run linting and type checks: `pnpm lint && pnpm typecheck`
4. Submit a pull request

## License

Proprietary — All rights reserved © Angel Touch Homecare Services
