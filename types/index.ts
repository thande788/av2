/**
 * Centralized type exports for Angel Touch Homecare
 * 
 * Import types from this file for convenience:
 * @example
 * import type { Service, Testimonial, Caregiver } from "@/types";
 */

// Navigation types
export type {
  NavLink,
  NavbarProps,
  MobileNavProps,
  LogoProps,
} from "./navigation";

// Footer types
export type {
  FooterLink,
  ContactInfo,
  SocialLink,
  FooterProps,
} from "./footer";

// Card types
export type {
  Service,
  ServiceCardProps,
  Testimonial,
  TestimonialCardProps,
  Caregiver,
  CaregiverCardProps,
} from "./cards";

// FAQ types
export type {
  FAQItem,
  FAQAccordionProps,
  FAQSectionProps,
} from "./faq";

// Job types
export type {
  Department,
  JobType,
  SalaryPeriod,
  SalaryRange,
  Qualifications,
  Job,
  JobSummary,
  JobCardProps,
  JobListingProps,
} from "./job";

// Application types
export type {
  ApplicationStatus,
  Shift,
  ApplicantAddress,
  Applicant,
  PreviousEmployer,
  Experience,
  Availability,
  Documents,
  Reference,
  Application,
  ApplicationFormData,
  ApplicationSubmitResponse,
} from "./application";
