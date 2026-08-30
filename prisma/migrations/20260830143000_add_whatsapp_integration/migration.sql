-- =============================================================================
-- WhatsApp integration schema
-- =============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WhatsappMessageDirection') THEN
    CREATE TYPE "WhatsappMessageDirection" AS ENUM ('INBOUND', 'OUTBOUND_TEMPLATE', 'OUTBOUND_SESSION');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WhatsappMessageStatus') THEN
    CREATE TYPE "WhatsappMessageStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'RECEIVED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WhatsappWebhookStatus') THEN
    CREATE TYPE "WhatsappWebhookStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'FAILED');
  END IF;
END $$;

DO $$ BEGIN
  ALTER TYPE "NotificationChannel" ADD VALUE IF NOT EXISTS 'WHATSAPP';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "WhatsappContact" (
  "id" TEXT NOT NULL,
  "portalUserId" TEXT,
  "phone" TEXT NOT NULL,
  "waId" TEXT,
  "displayName" TEXT,
  "optedIn" BOOLEAN NOT NULL DEFAULT false,
  "optedInAt" TIMESTAMP(3),
  "optedOutAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WhatsappContact_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WhatsappContact_portalUserId_key" ON "WhatsappContact"("portalUserId");
CREATE UNIQUE INDEX IF NOT EXISTS "WhatsappContact_phone_key" ON "WhatsappContact"("phone");
CREATE UNIQUE INDEX IF NOT EXISTS "WhatsappContact_waId_key" ON "WhatsappContact"("waId");
CREATE INDEX IF NOT EXISTS "WhatsappContact_phone_idx" ON "WhatsappContact"("phone");
CREATE INDEX IF NOT EXISTS "WhatsappContact_waId_idx" ON "WhatsappContact"("waId");

CREATE TABLE IF NOT EXISTS "WhatsappMessage" (
  "id" TEXT NOT NULL,
  "contactId" TEXT,
  "portalUserId" TEXT,
  "direction" "WhatsappMessageDirection" NOT NULL,
  "status" "WhatsappMessageStatus" NOT NULL DEFAULT 'QUEUED',
  "messageType" TEXT NOT NULL,
  "templateName" TEXT,
  "metaMessageId" TEXT,
  "toPhone" TEXT NOT NULL,
  "fromPhone" TEXT,
  "body" TEXT,
  "payload" JSONB,
  "errorMessage" TEXT,
  "sentAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "readAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WhatsappMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WhatsappMessage_metaMessageId_key" ON "WhatsappMessage"("metaMessageId");
CREATE INDEX IF NOT EXISTS "WhatsappMessage_contactId_idx" ON "WhatsappMessage"("contactId");
CREATE INDEX IF NOT EXISTS "WhatsappMessage_portalUserId_idx" ON "WhatsappMessage"("portalUserId");
CREATE INDEX IF NOT EXISTS "WhatsappMessage_status_idx" ON "WhatsappMessage"("status");
CREATE INDEX IF NOT EXISTS "WhatsappMessage_createdAt_idx" ON "WhatsappMessage"("createdAt");

CREATE TABLE IF NOT EXISTS "WhatsappWebhookEvent" (
  "id" TEXT NOT NULL,
  "dedupeKey" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "status" "WhatsappWebhookStatus" NOT NULL DEFAULT 'RECEIVED',
  "errorMessage" TEXT,
  "processedAt" TIMESTAMP(3),
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WhatsappWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WhatsappWebhookEvent_dedupeKey_key" ON "WhatsappWebhookEvent"("dedupeKey");
CREATE INDEX IF NOT EXISTS "WhatsappWebhookEvent_status_idx" ON "WhatsappWebhookEvent"("status");
CREATE INDEX IF NOT EXISTS "WhatsappWebhookEvent_receivedAt_idx" ON "WhatsappWebhookEvent"("receivedAt");

ALTER TABLE "WhatsappContact" DROP CONSTRAINT IF EXISTS "WhatsappContact_portalUserId_fkey";
ALTER TABLE "WhatsappContact"
  ADD CONSTRAINT "WhatsappContact_portalUserId_fkey"
  FOREIGN KEY ("portalUserId") REFERENCES "PortalUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WhatsappMessage" DROP CONSTRAINT IF EXISTS "WhatsappMessage_contactId_fkey";
ALTER TABLE "WhatsappMessage"
  ADD CONSTRAINT "WhatsappMessage_contactId_fkey"
  FOREIGN KEY ("contactId") REFERENCES "WhatsappContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WhatsappMessage" DROP CONSTRAINT IF EXISTS "WhatsappMessage_portalUserId_fkey";
ALTER TABLE "WhatsappMessage"
  ADD CONSTRAINT "WhatsappMessage_portalUserId_fkey"
  FOREIGN KEY ("portalUserId") REFERENCES "PortalUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
