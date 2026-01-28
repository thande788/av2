'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Validation schema for job creation/update
const jobSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  title: z.string().min(1, 'Title is required'),
  department: z.enum(['CAREGIVING', 'ADMINISTRATIVE', 'NURSING']),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'PER_DIEM']),
  location: z.string().min(1, 'Location is required'),
  salaryMin: z.number().min(0),
  salaryMax: z.number().min(0),
  salaryPeriod: z.enum(['HOURLY', 'ANNUAL']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  responsibilities: z.array(z.string()).min(1, 'At least one responsibility required'),
  qualificationsReq: z.array(z.string()).min(1, 'At least one required qualification needed'),
  qualificationsPref: z.array(z.string()).optional().default([]),
  benefits: z.array(z.string()).optional().default([]),
  isActive: z.boolean().default(true),
  closesAt: z.date().nullable().optional(),
});

export type JobFormData = z.infer<typeof jobSchema>;

export async function createJob(data: JobFormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const validated = jobSchema.parse(data);

  const job = await db.job.create({
    data: validated,
  });

  revalidatePath('/admin/jobs');
  revalidatePath('/careers');
  
  return { success: true, job };
}

export async function updateJob(jobId: string, data: Partial<JobFormData>) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const existingJob = await db.job.findUnique({ where: { id: jobId } });
  if (!existingJob) throw new Error('Job not found');

  const validated = jobSchema.partial().parse(data);

  const job = await db.job.update({
    where: { id: jobId },
    data: validated,
  });

  revalidatePath('/admin/jobs');
  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath('/careers');
  revalidatePath(`/careers/${job.slug}`);
  
  return { success: true, job };
}

export async function deleteJob(jobId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // Check if job has applications
  const applicationCount = await db.application.count({
    where: { jobId },
  });

  if (applicationCount > 0) {
    throw new Error(`Cannot delete job with ${applicationCount} applications. Archive it instead.`);
  }

  await db.job.delete({
    where: { id: jobId },
  });

  revalidatePath('/admin/jobs');
  revalidatePath('/careers');
  
  return { success: true };
}

export async function toggleJobActive(jobId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const job = await db.job.findUnique({ where: { id: jobId } });
  if (!job) throw new Error('Job not found');

  const updatedJob = await db.job.update({
    where: { id: jobId },
    data: { isActive: !job.isActive },
  });

  revalidatePath('/admin/jobs');
  revalidatePath('/careers');
  
  return { success: true, isActive: updatedJob.isActive };
}
