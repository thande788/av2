/**
 * Navigation types for the Angel Touch website
 */

import type { ReactNode } from "react";

/**
 * Represents a single navigation link item
 */
export interface NavLink {
  /** Route path */
  href: string;
  /** Display label for the link */
  label: string;
  /** Optional icon element */
  icon?: ReactNode;
  /** Optional description for mobile menu */
  description?: string;
  /** Whether this is an external link */
  external?: boolean;
}

/**
 * Props for the Navbar component
 */
export interface NavbarProps {
  /** Custom class name for the navbar container */
  className?: string;
  /** Whether to show the CTA button */
  showCTA?: boolean;
  /** Custom CTA text */
  ctaText?: string;
  /** Custom CTA href */
  ctaHref?: string;
}

/**
 * Props for the mobile navigation menu
 */
export interface MobileNavProps {
  /** Navigation links to display */
  links: NavLink[];
  /** Current pathname for active state */
  pathname: string;
  /** Callback when a link is clicked */
  onLinkClick?: () => void;
}

/**
 * Props for the Logo component
 */
export interface LogoProps {
  /** Custom class name */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to show the text alongside the logo */
  showText?: boolean;
}
