-- =============================================================================
-- Comprehensive migration: add all tables, enums, columns & indexes that were
-- applied via `prisma db push` but never captured in a migration file.
-- All statements are idempotent (IF NOT EXISTS / IF EXISTS) so this migration
-- is safe to run regardless of current database state.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Missing enums
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TestimonialStatus') THEN
    CREATE TYPE "TestimonialStatus" AS ENUM ('REQUESTED', 'SUBMITTED', 'UNDER_REVIEW', 'PUBLISHED', 'REJECTED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'IncidentType') THEN
    CREATE TYPE "IncidentType" AS ENUM ('FALL', 'MEDICAL_EMERGENCY', 'BEHAVIORAL', 'SAFETY_CONCERN', 'MISSED_MEDICATION', 'PROPERTY_DAMAGE', 'OTHER');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'IncidentSeverity') THEN
    CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'IncidentStatus') THEN
    CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NoteCategory') THEN
    CREATE TYPE "NoteCategory" AS ENUM ('GENERAL', 'CARE_UPDATE', 'MEDICATION', 'INCIDENT', 'HANDOFF');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SwapStatus') THEN
    CREATE TYPE "SwapStatus" AS ENUM ('PENDING', 'ACCEPTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED');
  END IF;
END $$;


-- ---------------------------------------------------------------------------
-- 2. Missing columns on Testimonial
-- ---------------------------------------------------------------------------

ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "status" "TestimonialStatus" NOT NULL DEFAULT 'SUBMITTED';
ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "videoType" TEXT;
ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "requestedAt" TIMESTAMP(3);
ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "requestedBy" TEXT;
ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "requestEmail" TEXT;
ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "reviewedBy" TEXT;
ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "rejectionNote" TEXT;

CREATE INDEX IF NOT EXISTS "Testimonial_status_idx" ON "Testimonial"("status");


-- ---------------------------------------------------------------------------
-- 3. Missing tables
-- ---------------------------------------------------------------------------

-- AdminEmail
CREATE TABLE IF NOT EXISTS "AdminEmail" (
    "id" TEXT NOT NULL,
    "sentBy" TEXT NOT NULL,
    "sentByName" TEXT,
    "toEmail" TEXT NOT NULL,
    "toName" TEXT,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "template" TEXT,
    "entity" TEXT,
    "entityId" TEXT,
    "resendId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminEmail_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AdminEmail_entity_entityId_idx" ON "AdminEmail"("entity", "entityId");
CREATE INDEX IF NOT EXISTS "AdminEmail_sentBy_idx" ON "AdminEmail"("sentBy");
CREATE INDEX IF NOT EXISTS "AdminEmail_createdAt_idx" ON "AdminEmail"("createdAt");


-- AuditLog
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");


-- EmergencyIncident
CREATE TABLE IF NOT EXISTS "EmergencyIncident" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reporterName" TEXT NOT NULL,
    "shiftId" TEXT,
    "clientId" TEXT,
    "type" "IncidentType" NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyIncident_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "EmergencyIncident_reporterId_idx" ON "EmergencyIncident"("reporterId");
CREATE INDEX IF NOT EXISTS "EmergencyIncident_shiftId_idx" ON "EmergencyIncident"("shiftId");
CREATE INDEX IF NOT EXISTS "EmergencyIncident_status_idx" ON "EmergencyIncident"("status");
CREATE INDEX IF NOT EXISTS "EmergencyIncident_severity_idx" ON "EmergencyIncident"("severity");


-- SatisfactionSurvey
CREATE TABLE IF NOT EXISTS "SatisfactionSurvey" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "punctuality" INTEGER,
    "communication" INTEGER,
    "careQuality" INTEGER,
    "comment" TEXT,
    "wouldRecommend" BOOLEAN,
    "requestedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SatisfactionSurvey_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SatisfactionSurvey_shiftId_key" ON "SatisfactionSurvey"("shiftId");
CREATE INDEX IF NOT EXISTS "SatisfactionSurvey_clientId_idx" ON "SatisfactionSurvey"("clientId");
CREATE INDEX IF NOT EXISTS "SatisfactionSurvey_overallRating_idx" ON "SatisfactionSurvey"("overallRating");

-- Foreign key: SatisfactionSurvey -> CareShift
ALTER TABLE "SatisfactionSurvey" DROP CONSTRAINT IF EXISTS "SatisfactionSurvey_shiftId_fkey";
ALTER TABLE "SatisfactionSurvey" ADD CONSTRAINT "SatisfactionSurvey_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "CareShift"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ShiftNote
CREATE TABLE IF NOT EXISTS "ShiftNote" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" "ReviewerType" NOT NULL,
    "content" TEXT NOT NULL,
    "category" "NoteCategory" NOT NULL DEFAULT 'GENERAL',
    "isVisibleToClient" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShiftNote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ShiftNote_shiftId_idx" ON "ShiftNote"("shiftId");
CREATE INDEX IF NOT EXISTS "ShiftNote_authorId_idx" ON "ShiftNote"("authorId");
CREATE INDEX IF NOT EXISTS "ShiftNote_category_idx" ON "ShiftNote"("category");

-- Foreign key: ShiftNote -> CareShift
ALTER TABLE "ShiftNote" DROP CONSTRAINT IF EXISTS "ShiftNote_shiftId_fkey";
ALTER TABLE "ShiftNote" ADD CONSTRAINT "ShiftNote_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "CareShift"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- SwapRequest
CREATE TABLE IF NOT EXISTS "SwapRequest" (
    "id" TEXT NOT NULL,
    "originalBookingId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "targetWorkerId" TEXT,
    "reason" TEXT NOT NULL,
    "status" "SwapStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SwapRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SwapRequest_requesterId_idx" ON "SwapRequest"("requesterId");
CREATE INDEX IF NOT EXISTS "SwapRequest_targetWorkerId_idx" ON "SwapRequest"("targetWorkerId");
CREATE INDEX IF NOT EXISTS "SwapRequest_status_idx" ON "SwapRequest"("status");

-- Foreign key: SwapRequest -> ShiftBooking
ALTER TABLE "SwapRequest" DROP CONSTRAINT IF EXISTS "SwapRequest_originalBookingId_fkey";
ALTER TABLE "SwapRequest" ADD CONSTRAINT "SwapRequest_originalBookingId_fkey" FOREIGN KEY ("originalBookingId") REFERENCES "ShiftBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
