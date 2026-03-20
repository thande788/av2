-- AlterTable
ALTER TABLE "PortalUser" ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3);
ALTER TABLE "PortalUser" ADD COLUMN "onboardingStep" INTEGER NOT NULL DEFAULT 0;
