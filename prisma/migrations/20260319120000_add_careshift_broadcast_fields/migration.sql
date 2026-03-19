-- AlterTable
ALTER TABLE "CareShift" ADD COLUMN "broadcastFilter" JSONB;
ALTER TABLE "CareShift" ADD COLUMN "broadcastSentAt" TIMESTAMP(3);
ALTER TABLE "CareShift" ADD COLUMN "broadcastCount" INTEGER NOT NULL DEFAULT 0;
