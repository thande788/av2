/**
 * Job Application Server Action
 * 
 * Handles job application submissions with validation
 * and database persistence.
 */

"use server";

import { db } from "@/lib/db";
import { getJobBySlug } from "@/data/jobs";
import { headers } from "next/headers";
import { z } from "zod";

export type ApplicationFormState = {
  success: boolean;
  message: string;
  applicationId?: string;
  errors?: Record<string, string[]>;
};

// Validation schema for job applications
const applicationSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  yearsOfExperience: z.coerce.number().min(0).default(0),
  certifications: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  shifts: z.array(z.enum(["morning", "afternoon", "evening", "overnight"])).min(1, "Select at least one shift"),
  hoursPerWeek: z.coerce.number().min(1).max(60).default(20),
  additionalInfo: z.string().max(2000).optional(),
});

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 3; // applications per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT) {
    return true;
  }

  record.count++;
  return false;
}

export async function submitApplication(
  prevState: ApplicationFormState,
  formData: FormData
): Promise<ApplicationFormState> {
  try {
    // Get client IP
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

    // Rate limit
    if (checkRateLimit(ip)) {
      return {
        success: false,
        message: "You've submitted multiple applications recently. Please try again later.",
      };
    }

    // Honeypot
    if (formData.get("website")) {
      return { success: true, message: "Application submitted!", applicationId: "fake" };
    }

    // Get job info from static data (using slug)
    const jobSlug = formData.get("jobSlug")?.toString();
    const jobId = formData.get("jobId")?.toString();
    
    if (!jobSlug && !jobId) {
      return { success: false, message: "Invalid job posting." };
    }

    // Look up job in static data
    const job = jobSlug ? getJobBySlug(jobSlug) : null;
    if (!job || !job.isActive) {
      return { success: false, message: "This position is no longer available." };
    }

    // Parse shifts from form (multiple checkboxes)
    const shifts = formData.getAll("shifts") as Array<"morning" | "afternoon" | "evening" | "overnight">;

    // Build raw data object matching form field names
    const rawData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      street: formData.get("street") || undefined,
      city: formData.get("city") || undefined,
      state: formData.get("state") || undefined,
      zip: formData.get("zip") || undefined,
      yearsOfExperience: formData.get("yearsOfExperience"),
      certifications: formData.get("certifications") || undefined,
      startDate: formData.get("startDate"),
      shifts,
      hoursPerWeek: formData.get("hoursPerWeek"),
      additionalInfo: formData.get("additionalInfo") || undefined,
    };

    // Validate
    const result = applicationSchema.safeParse(rawData);

    if (!result.success) {
      return {
        success: false,
        message: "Please fix the errors below.",
        errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Parse certifications string to array
    const certifications = result.data.certifications
      ? result.data.certifications.split(",").map((c) => c.trim()).filter(Boolean)
      : [];

    // Check for duplicate application (same email + job within 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const existingApplication = await db.application.findFirst({
      where: {
        jobId: job.id,
        email: result.data.email,
        submittedAt: { gte: thirtyDaysAgo },
      },
    });

    if (existingApplication) {
      return {
        success: false,
        message: "You've already applied for this position. We'll be in touch if you're selected.",
      };
    }

    // Save to database
    // Convert shifts to uppercase for DB enum
    const dbShifts = result.data.shifts.map(s => s.toUpperCase()) as Array<"MORNING" | "AFTERNOON" | "EVENING" | "OVERNIGHT">;
    
    const application = await db.application.create({
      data: {
        jobId: job.id,
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        email: result.data.email,
        phone: result.data.phone,
        street: result.data.street ?? null,
        city: result.data.city ?? null,
        state: result.data.state ?? null,
        zip: result.data.zip ?? null,
        yearsExperience: result.data.yearsOfExperience,
        certifications,
        availableStart: new Date(result.data.startDate),
        shifts: dbShifts,
        hoursPerWeek: result.data.hoursPerWeek,
        resumeUrl: null,
        coverLetterUrl: null,
        additionalInfo: result.data.additionalInfo ?? null,
      },
    });

    // TODO: Send confirmation email (Phase 3)
    // TODO: Send admin notification (Phase 3)

    return {
      success: true,
      message: `Thank you for applying to the ${job.title} position! We'll review your application and contact you within 5-7 business days.`,
      applicationId: application.id,
    };
  } catch (error) {
    console.error("Application submission error:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again or contact us directly.",
    };
  }
}
