/**
 * Form Validation Patterns
 * 
 * Zod schemas for common form validation patterns.
 * Use with React Hook Form or standalone.
 * 
 * @example
 * ```tsx
 * import { contactFormSchema } from "@/lib/validation";
 * 
 * const form = useForm({
 *   resolver: zodResolver(contactFormSchema),
 * });
 * ```
 */

import { z } from "zod";

// ============================================
// Base Patterns
// ============================================

/** US phone number pattern */
export const phonePattern = /^(\+1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;

/** Email with common TLDs */
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ============================================
// Field Schemas
// ============================================

export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes");

export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .max(255, "Email must be less than 255 characters");

export const phoneSchema = z
  .string()
  .regex(phonePattern, "Please enter a valid phone number (e.g., (978) 555-1234)")
  .or(z.literal("")) // Allow empty for optional fields
  .optional();

export const phoneRequiredSchema = z
  .string()
  .min(10, "Phone number is required")
  .regex(phonePattern, "Please enter a valid phone number (e.g., (978) 555-1234)");

export const messageSchema = z
  .string()
  .min(10, "Message must be at least 10 characters")
  .max(2000, "Message must be less than 2000 characters");

export const addressSchema = z.object({
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().length(2, "Please use 2-letter state code (e.g., MA)"),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code"),
});

// ============================================
// Form Schemas
// ============================================

/** Contact form schema */
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  subject: z.string().min(1, "Please select a subject").optional(),
  message: messageSchema,
  preferredContact: z.enum(["email", "phone"]).default("email"),
  newsletter: z.boolean().default(false),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

/** Job application form schema */
export const applicationFormSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneRequiredSchema,
  address: addressSchema.optional(),
  position: z.string().min(1, "Position is required"),
  experience: z.enum(["0-1", "1-3", "3-5", "5+"]).optional(),
  availability: z.enum(["full-time", "part-time", "per-diem", "flexible"]),
  startDate: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  coverLetter: z.string().max(5000, "Cover letter must be less than 5000 characters").optional(),
  resumeUrl: z.string().url("Please upload a valid resume").optional(),
  referralSource: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms",
  }),
});

export type ApplicationFormData = z.infer<typeof applicationFormSchema>;

/** Care inquiry form schema */
export const careInquirySchema = z.object({
  // Contact info
  contactName: nameSchema,
  contactRelation: z.enum(["self", "spouse", "child", "sibling", "friend", "professional", "other"]),
  email: emailSchema,
  phone: phoneRequiredSchema,
  preferredContactTime: z.enum(["morning", "afternoon", "evening", "anytime"]).default("anytime"),
  
  // Care recipient
  recipientName: nameSchema.optional(),
  recipientAge: z.number().min(0).max(120).optional(),
  
  // Care needs
  careTypes: z.array(z.string()).min(1, "Please select at least one care type"),
  hoursPerWeek: z.enum(["1-10", "10-20", "20-40", "40+", "unsure"]),
  startTimeline: z.enum(["immediately", "1-2-weeks", "1-month", "planning-ahead"]),
  
  // Additional
  additionalInfo: z.string().max(2000).optional(),
  insuranceType: z.enum(["private-pay", "ltc-insurance", "medicaid", "medicare", "va", "other", "unsure"]).optional(),
});

export type CareInquiryData = z.infer<typeof careInquirySchema>;

/** Newsletter signup schema */
export const newsletterSchema = z.object({
  email: emailSchema,
  firstName: z.string().optional(),
});

export type NewsletterData = z.infer<typeof newsletterSchema>;

// ============================================
// Utility Functions
// ============================================

/**
 * Format phone number for display
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Format phone number for E.164 (international) format
 */
export function toE164(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+${cleaned}`;
  }
  return phone;
}

/**
 * Validate and return parsed data or null
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
