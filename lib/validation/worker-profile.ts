/**
 * Worker Marketing Profile Validation Schema
 *
 * Validates employee-authored marketing profile data
 * submitted for admin approval.
 */

import { z } from 'zod';

export const marketingProfileSchema = z.object({
  marketingBio: z
    .string()
    .min(50, 'Bio must be at least 50 characters')
    .max(1000, 'Bio must not exceed 1000 characters'),
  marketingSpecialties: z
    .array(z.string())
    .min(1, 'Please select at least one specialty'),
  marketingLanguages: z
    .array(z.string())
    .min(1, 'Please select at least one language'),
  marketingCertifications: z.array(z.string()),
  yearsExperience: z
    .number()
    .int()
    .min(0, 'Years of experience must be 0 or more')
    .max(50, 'Please enter a valid number of years'),
});

export type MarketingProfileData = z.infer<typeof marketingProfileSchema>;

export const MARKETING_SPECIALTY_OPTIONS = [
  'Personal Care',
  'Companionship',
  'Dementia Care',
  "Alzheimer's Care",
  'Meal Preparation',
  'Light Housekeeping',
  'Medication Reminders',
  'Transportation',
  'Post-Surgery Care',
  'Mobility Assistance',
  'Hoyer Lift',
  'Hospice Support',
  'Respite Care',
  'Live-In Care',
] as const;

export const MARKETING_LANGUAGE_OPTIONS = [
  'English',
  'Spanish',
  'Portuguese',
  'Khmer',
  'Vietnamese',
  'Haitian Creole',
  'French',
  'Mandarin',
  'Cantonese',
] as const;

export const MARKETING_CERTIFICATION_OPTIONS = [
  'CNA (Certified Nursing Assistant)',
  'HHA (Home Health Aide)',
  'CPR/First Aid',
  'BLS Certified',
  'Dementia Care Certified',
  "Alzheimer's Trained",
  'Hoyer Lift Certified',
  'Medication Administration',
] as const;
