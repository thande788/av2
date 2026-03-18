-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "submittedById" TEXT;

-- CreateIndex
CREATE INDEX "Testimonial_submittedById_idx" ON "Testimonial"("submittedById");
