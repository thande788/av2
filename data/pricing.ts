/**
 * Pricing data for Angel Touch Homecare
 * Backend-ready: Prisma-compatible structure
 */

export type PricingPeriod = "hour" | "day" | "week" | "month";

export interface PricingTier {
  /** Unique identifier */
  id: string;
  /** Tier display name */
  title: string;
  /** Price amount */
  price: number;
  /** Billing period */
  period: PricingPeriod;
  /** Short description */
  description: string;
  /** List of included features */
  features: string[];
  /** Highlight as popular/recommended */
  isPopular?: boolean;
  /** Active status for soft delete */
  isActive?: boolean;
  /** Display order */
  sortOrder?: number;
  /** CTA button text override */
  ctaText?: string;
  /** CTA link override */
  ctaHref?: string;
}

export const pricingTiers: PricingTier[] = [
  {
    id: "companion",
    title: "Companion Care",
    price: 28,
    period: "hour",
    description: "Light housekeeping, meal prep, medication reminders",
    features: [
      "Light housekeeping",
      "Meal preparation",
      "Medication reminders",
      "Transportation",
      "Social companionship",
    ],
    isPopular: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "personal",
    title: "Personal Care",
    price: 35,
    period: "hour",
    description: "Daily living assistance, bathing, grooming, mobility",
    features: [
      "All Companion Care services",
      "Bathing & grooming assistance",
      "Dressing support",
      "Mobility assistance",
      "Toileting support",
    ],
    isPopular: true,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "specialized",
    title: "Specialized Care",
    price: 40,
    period: "hour",
    description: "Memory care, post-surgery recovery, complex needs",
    features: [
      "All Personal Care services",
      "Dementia/Alzheimer's care",
      "Post-surgery recovery",
      "Chronic condition support",
      "Specialized training",
    ],
    isPopular: false,
    isActive: true,
    sortOrder: 3,
  },
];

/**
 * Get active pricing tiers sorted by order
 */
export function getActivePricingTiers(): PricingTier[] {
  return pricingTiers
    .filter((tier) => tier.isActive !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

/**
 * Get pricing tier by ID
 */
export function getPricingTier(id: string): PricingTier | undefined {
  return pricingTiers.find((tier) => tier.id === id);
}

/**
 * Format price with period
 */
export function formatPrice(tier: PricingTier): string {
  const periodLabels: Record<PricingPeriod, string> = {
    hour: "hr",
    day: "day",
    week: "wk",
    month: "mo",
  };
  return `$${tier.price}/${periodLabels[tier.period]}`;
}
