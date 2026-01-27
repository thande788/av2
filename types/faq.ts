/**
 * FAQ types
 */

/**
 * Single FAQ item
 */
export interface FAQItem {
  /** Unique identifier */
  id: string;
  /** Question text */
  question: string;
  /** Answer text (can include HTML for rich formatting) */
  answer: string;
  /** Optional category for grouping */
  category?: string;
}

/**
 * Props for the FAQ accordion component
 */
export interface FAQAccordionProps {
  /** Array of FAQ items */
  items: FAQItem[];
  /** Custom class name */
  className?: string;
  /** Allow multiple items open at once */
  allowMultiple?: boolean;
  /** Default open item(s) by ID */
  defaultOpen?: string | string[];
}

/**
 * Props for FAQ section (includes heading and CTA)
 */
export interface FAQSectionProps extends FAQAccordionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Show CTA section at bottom */
  showCTA?: boolean;
}
