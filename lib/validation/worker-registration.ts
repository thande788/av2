/**
 * Worker Registration Validation Schema
 * 
 * Multi-step form validation for worker (caregiver) registration.
 */

import { z } from 'zod';
import { phoneRequiredSchema, emailSchema, nameSchema } from './schemas';

// ============================================
// Step Schemas
// ============================================

/** Step 1: Personal Information */
export const personalInfoSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneRequiredSchema,
});

export type PersonalInfoData = z.infer<typeof personalInfoSchema>;

/** Step 2: Skills & Experience */
export const skillsSchema = z.object({
  skills: z.array(z.string()).min(1, 'Please select at least one skill'),
  certifications: z.array(z.string()),
  languages: z.array(z.string()).min(1, 'Please select at least one language'),
  yearsExperience: z.enum(['0-1', '1-3', '3-5', '5+']),
});

export type SkillsData = z.infer<typeof skillsSchema>;

/** Step 3: Availability */
export const availabilitySchema = z.object({
  shiftsAvailable: z.array(z.string()).min(1, 'Please select at least one shift preference'),
  hoursPerWeek: z.enum(['10-20', '20-30', '30-40', '40+']),
  startDate: z.string().min(1, 'Please select a start date'),
  transportation: z.boolean(),
});

export type AvailabilityData = z.infer<typeof availabilitySchema>;

/** Step 4: Address */
export const addressInfoSchema = z.object({
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().length(2, 'Please use 2-letter state code (e.g., MA)').toUpperCase(),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
});

export type AddressInfoData = z.infer<typeof addressInfoSchema>;

// ============================================
// Combined Schema
// ============================================

export const workerRegistrationSchema = z.object({
  // Step 1
  ...personalInfoSchema.shape,
  // Step 2
  ...skillsSchema.shape,
  // Step 3
  ...availabilitySchema.shape,
  // Step 4
  ...addressInfoSchema.shape,
  // Terms acceptance
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
  agreeToBackgroundCheck: z.boolean().refine((val) => val === true, {
    message: 'You must consent to a background check',
  }),
});

export type WorkerRegistrationData = z.infer<typeof workerRegistrationSchema>;

// ============================================
// Options Data
// ============================================

export const SKILL_OPTIONS = [
  { value: 'personal-care', label: 'Personal Care' },
  { value: 'companionship', label: 'Companionship' },
  { value: 'meal-prep', label: 'Meal Preparation' },
  { value: 'medication-reminders', label: 'Medication Reminders' },
  { value: 'light-housekeeping', label: 'Light Housekeeping' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'dementia-care', label: 'Dementia/Alzheimer\'s Care' },
  { value: 'hoyer-lift', label: 'Hoyer Lift Operation' },
  { value: 'wound-care', label: 'Wound Care' },
  { value: 'catheter-care', label: 'Catheter Care' },
];

export const CERTIFICATION_OPTIONS = [
  { value: 'cna', label: 'Certified Nursing Assistant (CNA)' },
  { value: 'hha', label: 'Home Health Aide (HHA)' },
  { value: 'pca', label: 'Personal Care Assistant (PCA)' },
  { value: 'cpr', label: 'CPR Certified' },
  { value: 'first-aid', label: 'First Aid Certified' },
  { value: 'medication-admin', label: 'Medication Administration' },
  { value: 'dementia-certified', label: 'Dementia Care Certified' },
  { value: 'hospice', label: 'Hospice Care Certified' },
];

export const LANGUAGE_OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'haitian-creole', label: 'Haitian Creole' },
  { value: 'chinese', label: 'Chinese (Mandarin/Cantonese)' },
  { value: 'vietnamese', label: 'Vietnamese' },
  { value: 'french', label: 'French' },
  { value: 'tagalog', label: 'Tagalog' },
];

export const SHIFT_OPTIONS = [
  { value: 'morning', label: 'Morning', time: '6am - 12pm' },
  { value: 'afternoon', label: 'Afternoon', time: '12pm - 6pm' },
  { value: 'evening', label: 'Evening', time: '6pm - 12am' },
  { value: 'overnight', label: 'Overnight', time: '12am - 6am' },
  { value: 'live-in', label: 'Live-In', time: '24-hour care' },
];

export const EXPERIENCE_OPTIONS = [
  { value: '0-1', label: 'Less than 1 year' },
  { value: '1-3', label: '1-3 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5+', label: '5+ years' },
];

export const HOURS_OPTIONS = [
  { value: '10-20', label: '10-20 hours/week' },
  { value: '20-30', label: '20-30 hours/week' },
  { value: '30-40', label: '30-40 hours/week' },
  { value: '40+', label: '40+ hours/week (full-time)' },
];
