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

// Worker registration
export {
  workerRegistrationSchema,
  personalInfoSchema,
  skillsSchema,
  availabilitySchema,
  addressInfoSchema,
  SKILL_OPTIONS,
  CERTIFICATION_OPTIONS,
  LANGUAGE_OPTIONS,
  SHIFT_OPTIONS,
  EXPERIENCE_OPTIONS,
  HOURS_OPTIONS,
  type WorkerRegistrationData,
  type PersonalInfoData,
  type SkillsData,
  type AvailabilityData,
  type AddressInfoData,
} from "./worker-registration";
