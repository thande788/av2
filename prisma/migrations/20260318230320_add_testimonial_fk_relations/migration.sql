/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Testimonial` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "serviceCategoryId" TEXT,
ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Testimonial_slug_key" ON "Testimonial"("slug");

-- CreateIndex
CREATE INDEX "Testimonial_serviceCategoryId_idx" ON "Testimonial"("serviceCategoryId");

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "PortalUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
