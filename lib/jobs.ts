/**
 * Fetches jobs from the database with fallback to static data.
 *
 * Maps DB model (Prisma enums, flat salary fields) → static Job type
 * used by all marketing career components.
 */

import { db } from "@/lib/db";
import { getActiveJobs, getJobBySlug } from "@/data/jobs";
import type { Job } from "@/types/job";

// Map DB enum values to static type values
const deptMap: Record<string, Job["department"]> = {
  CAREGIVING: "caregiving",
  ADMINISTRATIVE: "administrative",
  NURSING: "nursing",
};

const typeMap: Record<string, Job["type"]> = {
  FULL_TIME: "full-time",
  PART_TIME: "part-time",
  PER_DIEM: "per-diem",
};

const periodMap: Record<string, Job["salaryRange"]["period"]> = {
  HOURLY: "hourly",
  ANNUAL: "annual",
};

type DbJob = {
  id: string;
  slug: string;
  title: string;
  department: string;
  type: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: string;
  description: string;
  responsibilities: string[];
  qualificationsReq: string[];
  qualificationsPref: string[];
  benefits: string[];
  isActive: boolean;
  postedAt: Date;
  closesAt: Date | null;
};

function mapDbJob(j: DbJob): Job {
  return {
    id: j.id,
    slug: j.slug,
    title: j.title,
    department: deptMap[j.department] ?? "caregiving",
    type: typeMap[j.type] ?? "full-time",
    location: j.location,
    salaryRange: {
      min: j.salaryMin,
      max: j.salaryMax,
      period: periodMap[j.salaryPeriod] ?? "hourly",
    },
    description: j.description,
    responsibilities: j.responsibilities,
    qualifications: {
      required: j.qualificationsReq,
      preferred: j.qualificationsPref,
    },
    benefits: j.benefits,
    isActive: j.isActive,
    postedAt: j.postedAt,
    closesAt: j.closesAt ?? undefined,
  };
}

/**
 * Fetch all active jobs from the database.
 * Falls back to static data if DB is unavailable or empty.
 */
export async function fetchActiveJobs(): Promise<Job[]> {
  try {
    const dbJobs = await db.job.findMany({
      where: { isActive: true },
      orderBy: { postedAt: "desc" },
    });

    if (dbJobs.length > 0) {
      return dbJobs.map(mapDbJob);
    }
  } catch {
    // DB unavailable — fall through to static
  }
  return getActiveJobs();
}

/**
 * Fetch a single job by slug from the database.
 * Falls back to static data if DB is unavailable.
 */
export async function fetchJobBySlug(slug: string): Promise<Job | undefined> {
  try {
    const dbJob = await db.job.findUnique({ where: { slug } });
    if (dbJob) {
      return mapDbJob(dbJob);
    }
  } catch {
    // DB unavailable — fall through to static
  }
  return getJobBySlug(slug);
}

/**
 * Fetch all job slugs (for generateStaticParams).
 * Falls back to static data if DB is unavailable.
 */
export async function fetchJobSlugs(): Promise<string[]> {
  try {
    const dbJobs = await db.job.findMany({
      where: { isActive: true },
      select: { slug: true },
    });
    if (dbJobs.length > 0) {
      return dbJobs.map((j) => j.slug);
    }
  } catch {
    // DB unavailable at build time — use static fallback
  }
  return getActiveJobs().map((j) => j.slug);
}
