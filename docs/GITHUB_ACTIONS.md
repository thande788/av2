# GitHub Actions Setup

This repo includes:

- CI workflow: `.github/workflows/ci.yml`
- Deploy workflow: `.github/workflows/deploy.yml`

Use this guide to configure required GitHub secrets/variables and Azure OIDC federation.

---

## 1) Required GitHub Secrets

Set these in **GitHub -> Settings -> Secrets and variables -> Actions -> Secrets**.

### Azure OIDC auth

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

### Required app/runtime secrets

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `CRON_SECRET`
- `PII_ACTIVE_KEY_ID`
- `PII_KEYRING_JSON`
- `PII_HASH_KEY`

### Optional provider secrets (set if feature is enabled)

- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `WHATSAPP_APP_SECRET`

### Optional Azure storage secrets

- `AZURE_STORAGE_ACCOUNT_NAME`
- `AZURE_STORAGE_BLOB_ENDPOINT`
- `AZURE_STORAGE_CONNECTION_STRING`
- `AZURE_STORAGE_ACCOUNT_KEY`

---

## 2) Recommended GitHub Variables

Set these in **GitHub -> Settings -> Secrets and variables -> Actions -> Variables**.

- `AZURE_RESOURCE_GROUP` (default in workflow: `angeltouch`)
- `AZURE_CONTAINERAPP_NAME` (default: `ca-angeltouch-web`)
- `AZURE_ACR_NAME` (default: `acrangeltouch7698`)
- `NEXT_PUBLIC_SITE_URL` (default: `https://angeltouch.services`)
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (default: `/sign-in`)
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` (default: `/sign-up`)
- `NEXT_PUBLIC_DEMO_MODE` (default: `false`)
- `DAY_BEFORE_UTC_HOUR` (default: `18`)
- `PII_ALLOW_DECRYPT_FAILURE` (default: `false`)
- `ADMIN_EMAIL` (default: `admin@angeltouch.services`)
- `FROM_EMAIL` (default: `Angel Touch Homecare <noreply@angeltouch.services>`)
- `OFFICE_PHONE_NUMBER` (default: `+19788569358`)
- `WHATSAPP_API_VERSION` (default: `v21.0`)
- `AZURE_STORAGE_CONTAINER` (default: `uploads`)
- `AZURE_STORAGE_UPLOADS_CONTAINER` (default: `uploads`)
- `AZURE_STORAGE_MARKETING_CONTAINER` (default: `uploads`)
- `AZURE_STORAGE_COMPLIANCE_CONTAINER` (default: `uploads`)

---

## 3) Azure OIDC Federation Setup

The deploy workflow uses:

```yaml
permissions:
  id-token: write
  contents: read
```

and `azure/login@v2` with OIDC.

### Step A: Create/choose Entra app registration (service principal)

Create an app registration (or reuse existing), then collect:

- Application (client) ID -> `AZURE_CLIENT_ID`
- Directory (tenant) ID -> `AZURE_TENANT_ID`

Use your subscription ID for `AZURE_SUBSCRIPTION_ID`.

### Step B: Add federated credential

In **Microsoft Entra -> App registrations -> <your app> -> Certificates & secrets -> Federated credentials**:

- Credential scenario: **GitHub Actions deploying Azure resources**
- Organization: your GitHub org/user
- Repository: this repo
- Entity type:
  - Recommended: **Environment** with `production` (matches deploy job environment)
  - Alternative: Branch `refs/heads/trunk`

The resulting subject is typically one of:

- `repo:<owner>/<repo>:environment:production`
- `repo:<owner>/<repo>:ref:refs/heads/trunk`

### Step C: Grant Azure RBAC roles to the service principal

At minimum, grant on required scopes:

- Resource Group scope (`angeltouch`):
  - `Contributor` (or least-privilege custom roles)
- ACR scope:
  - `AcrPush` (for image build/push)
- User-assigned identity role assignment permissions if script manages identity/role bindings

If using stricter permissions, ensure the principal can perform all commands in `scripts/deploy-azure-containerapps.sh`.

---

## 4) Workflow Behavior

### CI (`ci.yml`)

- Runs on PRs and pushes to `trunk`
- Checks: Prisma validate, lint, typecheck

### Deploy (`deploy.yml`)

- Runs on push to `trunk` and manual dispatch
- Logs into Azure via OIDC
- Creates `.env.production` from Secrets/Vars
- Runs `scripts/deploy-azure-containerapps.sh`
- Appends deploy summary (FQDN/revision/image/image size) to workflow summary

---

## 5) Quick Validation Checklist

- [ ] OIDC federated credential exists and matches repo/entity
- [ ] Azure RBAC roles assigned to service principal
- [ ] Required GitHub secrets set
- [ ] Optional secrets set for enabled features
- [ ] `Deploy` workflow can run successfully via `workflow_dispatch`
