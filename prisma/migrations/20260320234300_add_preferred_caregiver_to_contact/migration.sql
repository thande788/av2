-- AlterTable: add preferredCaregiverId column to ContactSubmission (IF NOT EXISTS)
ALTER TABLE "ContactSubmission" ADD COLUMN IF NOT EXISTS "preferredCaregiverId" TEXT;

-- CreateIndex (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS "ContactSubmission_preferredCaregiverId_idx" ON "ContactSubmission"("preferredCaregiverId");

-- AddForeignKey (idempotent: drop if exists then recreate)
ALTER TABLE "ContactSubmission" DROP CONSTRAINT IF EXISTS "ContactSubmission_preferredCaregiverId_fkey";
ALTER TABLE "ContactSubmission" ADD CONSTRAINT "ContactSubmission_preferredCaregiverId_fkey" FOREIGN KEY ("preferredCaregiverId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
