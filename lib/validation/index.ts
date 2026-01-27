/**
 * Validation utilities barrel export
 */

export {
  // Field schemas
  nameSchema,
  emailSchema,
  phoneSchema,
  phoneRequiredSchema,
  messageSchema,
  addressSchema,
  // Form schemas
  contactFormSchema,
  applicationFormSchema,
  careInquirySchema,
  newsletterSchema,
  // Types
  type ContactFormData,
  type ApplicationFormData,
  type CareInquiryData,
  type NewsletterData,
  // Utilities
  formatPhone,
  toE164,
  safeValidate,
  // Patterns
  phonePattern,
  emailPattern,
} from "./schemas";
