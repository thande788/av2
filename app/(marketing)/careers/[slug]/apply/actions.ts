"use server";

import { z } from "zod";

/**
 * Validation schema for job applications
 */
export const applicationFormSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  jobSlug: z.string().min(1, "Job slug is required"),
  
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(
    /^[\d\s\-\(\)\+]+$/,
    "Please enter a valid phone number"
  ).min(10, "Phone number must be at least 10 digits"),
  
  // Address (optional)
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  
  // Experience
  yearsOfExperience: z.coerce.number().min(0, "Years must be 0 or greater").max(50, "Please enter a valid number"),
  certifications: z.string().optional(), // Comma-separated in form, parsed to array
  
  // Availability
  startDate: z.string().min(1, "Start date is required"),
  shifts: z.array(z.enum(["morning", "afternoon", "evening", "overnight"])).min(1, "Please select at least one shift"),
  hoursPerWeek: z.coerce.number().min(1, "Hours per week is required").max(60, "Maximum 60 hours per week"),
  
  // Additional
  additionalInfo: z.string().optional(),
  
  // Honeypot for spam protection
  website: z.string().optional(),
});

export type ApplicationFormData = z.infer<typeof applicationFormSchema>;

export type ApplicationFormState = {
  success: boolean;
  message: string;
  applicationId?: string;
  errors?: Record<string, string[]>;
};

/**
 * Server action to handle job application submissions
 */
export async function submitApplication(
  prevState: ApplicationFormState,
  formData: FormData
): Promise<ApplicationFormState> {
  // Parse shifts from form (multiple checkboxes)
  const shifts = formData.getAll("shifts") as string[];
  
  const rawData = {
    jobId: formData.get("jobId"),
    jobSlug: formData.get("jobSlug"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    street: formData.get("street"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip: formData.get("zip"),
    yearsOfExperience: formData.get("yearsOfExperience"),
    certifications: formData.get("certifications"),
    startDate: formData.get("startDate"),
    shifts: shifts,
    hoursPerWeek: formData.get("hoursPerWeek"),
    additionalInfo: formData.get("additionalInfo"),
    website: formData.get("website"), // honeypot
  };

  // Validate form data
  const validated = applicationFormSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Please fix the errors below and try again.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  // Honeypot check - if filled, silently succeed (it's a bot)
  if (validated.data.website) {
    // Simulate success to fool bots
    return {
      success: true,
      message: "Thank you for your application!",
      applicationId: "fake-id",
    };
  }

  // Parse certifications string to array
  const certifications = validated.data.certifications
    ? validated.data.certifications.split(",").map((c) => c.trim()).filter(Boolean)
    : [];

  // In a real app, this would:
  // 1. Save to database
  // 2. Upload resume/documents to storage
  // 3. Send confirmation email
  // 4. Notify HR team
  
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Generate a mock application ID (in production, this would come from DB)
  const applicationId = `APP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  console.log("Application submitted:", {
    applicationId,
    jobId: validated.data.jobId,
    applicant: `${validated.data.firstName} ${validated.data.lastName}`,
    email: validated.data.email,
    certifications,
    shifts: validated.data.shifts,
  });

  return {
    success: true,
    message: "Thank you for your application! We've received your submission and will review it within 3-5 business days. You'll receive a confirmation email shortly.",
    applicationId,
  };
}
