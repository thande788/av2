/**
 * Job-related types for the Careers section
 * Designed to be Prisma-schema compatible for future database integration
 */

export type Department = "caregiving" | "administrative" | "nursing";
export type JobType = "full-time" | "part-time" | "per-diem";
export type SalaryPeriod = "hourly" | "annual";

export interface SalaryRange {
  min: number;
  max: number;
  period: SalaryPeriod;
}

export interface Qualifications {
  required: string[];
  preferred: string[];
}

export interface Job {
  /** Database ID — only present when fetched from DB */
  id?: string;
  /** URL-friendly slug for routing (stable identifier) */
  slug: string;
  /** Job title */
  title: string;
  /** Department this job belongs to */
  department: Department;
  /** Employment type */
  type: JobType;
  /** Location(s) for this position */
  location: string;
  /** Salary range information */
  salaryRange: SalaryRange;
  /** Full job description (supports markdown) */
  description: string;
  /** List of job responsibilities */
  responsibilities: string[];
  /** Required and preferred qualifications */
  qualifications: Qualifications;
  /** List of benefits */
  benefits: string[];
  /** Whether the job is currently accepting applications */
  isActive: boolean;
  /** Date when the job was posted */
  postedAt: Date;
  /** Optional closing date for applications */
  closesAt?: Date;
}

/**
 * Minimal job data for cards/listings
 */
export type JobSummary = Pick<
  Job,
  "slug" | "title" | "department" | "type" | "location" | "salaryRange" | "isActive" | "postedAt"
> & { id?: string };

/**
 * Props for JobCard component
 */
export interface JobCardProps {
  job: JobSummary;
  /** Optional: show full details instead of summary */
  expanded?: boolean;
}

/**
 * Props for JobListing (full page) component
 */
export interface JobListingProps {
  job: Job;
}
