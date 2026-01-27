import type { ReactNode } from "react";

/**
 * Service card types
 */
export interface Service {
  /** Unique identifier */
  id: string;
  /** Service title */
  title: string;
  /** Short description */
  description: string;
  /** Icon component or emoji */
  icon?: ReactNode;
  /** Optional image URL */
  image?: string;
  /** Image alt text */
  imageAlt?: string;
  /** Link to service detail page */
  href?: string;
}

export interface ServiceCardProps {
  /** Service data */
  service: Service;
  /** Custom class name */
  className?: string;
  /** Show CTA buttons */
  showActions?: boolean;
  /** Callback for learn more action */
  onLearnMore?: (service: Service) => void;
  /** Callback for add to plan action */
  onAddToPlan?: (service: Service) => void;
}

/**
 * Testimonial card types
 */
export interface Testimonial {
  /** Unique identifier */
  id: string;
  /** Author name */
  name: string;
  /** Testimonial text/quote */
  text: string;
  /** Relation to client (e.g., "Daughter of client") */
  relation: string;
  /** Optional rating (1-5) */
  rating?: number;
  /** Optional avatar image URL */
  avatarUrl?: string;
  /** Optional date */
  date?: string;
}

export interface TestimonialCardProps {
  /** Testimonial data */
  testimonial: Testimonial;
  /** Custom class name */
  className?: string;
  /** Card size variant */
  size?: "default" | "compact";
}

/**
 * Caregiver card types
 */
export interface Caregiver {
  /** Unique identifier */
  id: string;
  /** Full name */
  fullName: string;
  /** Photo base name (without extension) */
  photoBase?: string;
  /** Direct photo URL (alternative to photoBase) */
  photoUrl?: string;
  /** Short biography */
  bio: string;
  /** Years of experience */
  yearsExperience: number;
  /** Rating (1-5) */
  rating: number;
  /** List of specialties */
  specialties: string[];
  /** Certifications */
  certifications?: string[];
  /** Languages spoken */
  languages?: string[];
  /** Availability status */
  available?: boolean;
}

export interface CaregiverCardProps {
  /** Caregiver data */
  caregiver: Caregiver;
  /** Custom class name */
  className?: string;
  /** Callback when card is selected */
  onSelect?: (caregiver: Caregiver) => void;
  /** Show full details or compact view */
  variant?: "default" | "compact";
}
