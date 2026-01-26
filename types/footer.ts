import type { ReactNode } from "react";

/**
 * Footer link item
 */
export interface FooterLink {
  /** Display label */
  label: string;
  /** Route path or external URL */
  href: string;
  /** Whether this is an external link */
  external?: boolean;
}

/**
 * Contact information for the footer
 */
export interface ContactInfo {
  /** Phone numbers */
  phones: string[];
  /** Email address */
  email: string;
  /** Service area description */
  serviceArea: string;
}

/**
 * Social media link
 */
export interface SocialLink {
  /** Platform name for aria-label */
  platform: string;
  /** Profile URL */
  href: string;
  /** Icon element */
  icon: ReactNode;
}

/**
 * Props for the Footer component
 */
export interface FooterProps {
  /** Custom class name */
  className?: string;
  /** Whether to show the structured data script */
  includeStructuredData?: boolean;
}
