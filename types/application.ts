/**
 * Application-related types for job applications
 * Designed to be Prisma-schema compatible for future database integration
 */

export type ApplicationStatus =
  | "pending"
  | "reviewing"
  | "interview"
  | "offered"
  | "rejected"
  | "hired";

export type Shift = "morning" | "afternoon" | "evening" | "overnight";

export interface ApplicantAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Applicant {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: ApplicantAddress;
}

export interface PreviousEmployer {
  name: string;
  role: string;
  duration: string;
}

export interface Experience {
  yearsOfExperience: number;
  certifications: string[];
  previousEmployers?: PreviousEmployer[];
}

export interface Availability {
  startDate: Date;
  shifts: Shift[];
  hoursPerWeek: number;
}

export interface Documents {
  resumeUrl?: string;
  coverLetterUrl?: string;
  certificationsUrls?: string[];
}

export interface Reference {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Application {
  /** Unique identifier (cuid in production) */
  id: string;
  /** Reference to the job being applied for */
  jobId: string;
  /** Current status of the application */
  status: ApplicationStatus;
  /** Applicant personal information */
  applicant: Applicant;
  /** Work experience details */
  experience: Experience;
  /** Availability information */
  availability: Availability;
  /** Uploaded documents */
  documents: Documents;
  /** Professional references */
  references?: Reference[];
  /** Additional information from applicant */
  additionalInfo?: string;
  /** When the application was submitted */
  submittedAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Form data for job application submission
 * This is what the client sends before it becomes a full Application
 */
export interface ApplicationFormData {
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  yearsOfExperience: number;
  certifications: string[];
  startDate: string; // ISO date string from form
  shifts: Shift[];
  hoursPerWeek: number;
  resume?: File;
  coverLetter?: File;
  additionalInfo?: string;
  // References (optional in initial form)
  references?: Reference[];
}

/**
 * Server action response for application submission
 */
export interface ApplicationSubmitResponse {
  success: boolean;
  message: string;
  applicationId?: string;
  errors?: Record<string, string[]>;
}
