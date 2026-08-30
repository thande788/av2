# WhatsApp Integration Plan (Meta Cloud API)

## Purpose

This plan defines how Angel Touch integrates WhatsApp messaging using Meta's WhatsApp Business Platform (Cloud API), without Twilio.

Primary goals:

- Send operational notifications (shift reminders, confirmations, emergency alerts)
- Receive inbound replies from workers/families
- Persist delivery status + conversation events for auditability and portal visibility
- Keep implementation aligned with HIPAA-minded practices and role-based access control

---

## Architecture Overview

### Channels

- **Outbound**: Server-side calls to Meta Graph API `/{phone_number_id}/messages`
- **Inbound**: Meta webhook callbacks to `/api/webhooks/whatsapp`

### Core Components

- `lib/whatsapp.ts`
  - Meta API send helper
  - phone normalization
  - webhook signature verification (`x-hub-signature-256`)
- `app/api/webhooks/whatsapp/route.ts`
  - GET verification challenge
  - POST signature validation, dedupe, payload processing
- `app/actions/whatsapp.ts`
  - admin/manager send action for template messages
- `app/api/admin/whatsapp/send-template/route.ts`
  - authenticated admin API endpoint for test sends

### Data Persistence (Prisma)

- `WhatsappContact`
  - maps phone/wa_id to portal user when possible
  - opt-in metadata
- `WhatsappMessage`
  - outbound + inbound message log
  - Meta message ID, status timeline, payload/error capture
- `WhatsappWebhookEvent`
  - raw webhook event ledger with dedupe key and processing status

---

## Current Implementation Status

Implemented in repository:

- WhatsApp service utilities
- Webhook endpoint (verify + signature + dedupe + processing)
- Admin action and admin API route for template sends
- Prisma schema + migration for WhatsApp entities
- Environment variable docs/example updates

Not yet fully operational until environment + Meta app setup is completed in deployed environment.

---

## Environment Variables

Required when WhatsApp is enabled:

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `WHATSAPP_APP_SECRET`
- `WHATSAPP_API_VERSION` (optional, default `v21.0`)

---

## Meta Developer Configuration Plan

1. Create/confirm Meta app linked to business account
2. Enable WhatsApp product
3. Obtain:
   - WABA
   - sender phone number
   - `phone_number_id`
4. Create system user token with required scopes:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
5. Configure webhook:
   - Callback: `https://<domain>/api/webhooks/whatsapp`
   - Verify token must match `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
6. Subscribe events:
   - messages
   - message status updates
7. Create and approve required template messages

---

## Database Rollout Plan

1. Deploy code containing migration
2. Run:

```bash
pnpm prisma migrate deploy
```

3. Validate tables:
   - `WhatsappContact`
   - `WhatsappMessage`
   - `WhatsappWebhookEvent`
4. Validate enum extension includes `NotificationChannel.WHATSAPP`

---

## API and Flow Details

### Outbound Template Flow

1. Admin/manager triggers send (action or API route)
2. System resolves target `PortalUser`
3. System upserts contact mapping in `WhatsappContact`
4. System sends template via Graph API
5. System records `WhatsappMessage` row

### Inbound Message Flow

1. Meta posts event to `/api/webhooks/whatsapp`
2. Signature is validated with `WHATSAPP_APP_SECRET`
3. Payload hash is used as dedupe key in `WhatsappWebhookEvent`
4. Messages/statuses are processed and persisted
5. `WhatsappWebhookEvent` is marked `PROCESSED` or `FAILED`

### Message Status Mapping

- `sent` -> `SENT`
- `delivered` -> `DELIVERED`
- `read` -> `READ`
- `failed`/`undelivered` -> `FAILED`
- inbound received -> `RECEIVED`

---

## Security and Compliance Plan

### Webhook Security

- Enforce `x-hub-signature-256` verification
- Reject invalid signatures with `401`
- Reject invalid JSON with `400`

### Access Control

- Outbound test send restricted to `ADMIN`/`MANAGER`
- No unauthenticated send operations

### Data Minimization

- Persist only required metadata for operational workflows/auditing
- Keep payload snapshots for troubleshooting and compliance trails

### PHI Considerations

- Prefer minimal PHI in message templates
- Avoid sensitive details in outbound template content
- Use internal portal links for full details where needed

---

## Testing Plan

### Unit/Service Validation

- verify phone normalization logic
- verify signature checker against known test vectors

### Integration Validation

1. Send template to test number
2. Confirm outbound DB record
3. Send reply from WhatsApp client
4. Confirm inbound DB record
5. Confirm status updates (sent/delivered/read)

### Failure Cases

- invalid token / missing env vars
- webhook signature mismatch
- duplicate webhook payload
- template not approved
- invalid recipient

---

## Operational Monitoring Plan

Track and alert on:

- failed webhook events (`WhatsappWebhookEvent.status = FAILED`)
- failed sends (`WhatsappMessage.status = FAILED`)
- webhook throughput and processing delay
- template-level failure rates

Recommended follow-up:

- add admin dashboard widgets for WhatsApp delivery health
- add retry tooling for failed sends where appropriate

---

## Product Rollout Phases

### Phase 1 - Foundation (Completed in code)

- Service, webhook, send action, persistence schema

### Phase 2 - Environment + Verification

- Configure Meta + env vars in deployed environment
- Validate end-to-end send/receive

### Phase 3 - Feature Integration

- Add WhatsApp channel option to reminder and emergency workflows
- Keep behind feature flag during rollout

### Phase 4 - Admin UX

- Add UI to send test/template messages from Admin
- Add conversation timeline and delivery status surfaces

### Phase 5 - Hardening

- rate limiting, retry policy, dead-letter handling
- opt-out/consent workflow automation

---

## Immediate Next Steps Checklist

- [ ] Set WhatsApp env vars in production/staging
- [ ] Configure Meta webhook callback + subscriptions
- [ ] Run `pnpm prisma migrate deploy`
- [ ] Test outbound template send via admin endpoint
- [ ] Validate inbound webhook processing and status updates
- [ ] Add basic monitoring query/dashboard for failed events
