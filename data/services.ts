import type { Service } from "@/types/cards";

/**
 * Service categories with their sub-services
 * Backend-ready: structured for future database normalization
 *
 * Icon names reference keys in lib/icons.tsx serviceIconMap
 */
export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string; // Icon name from serviceIconMap
  image?: string;
  services: ServiceItem[];
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon: string; // Icon name from serviceIconMap
  priceFrom?: number;
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: "personal-care",
    name: "Personal Care",
    description:
      "Professional assistance with daily living activities, medication management, and personal hygiene.",
    icon: "personal-care",
    image: "/services/personal-care.jpg",
    services: [
      {
        id: "daily-living",
        title: "Daily Living Assistance",
        description:
          "Help with bathing, grooming, dressing, and personal hygiene",
        features: [
          "Bathing assistance",
          "Hair care",
          "Nail care",
          "Oral hygiene",
          "Dressing support",
        ],
        icon: "bath",
        priceFrom: 35,
      },
      {
        id: "mobility-support",
        title: "Mobility Support",
        description: "Safe transfer assistance and mobility aid support",
        features: [
          "Transfer assistance",
          "Walking support",
          "Wheelchair assistance",
          "Fall prevention",
        ],
        icon: "wheelchair",
        priceFrom: 35,
      },
      {
        id: "medication-management",
        title: "Medication Management",
        description: "Medication reminders and organization",
        features: [
          "Pill organization",
          "Medication reminders",
          "Prescription pickup",
          "Health monitoring",
        ],
        icon: "pill",
        priceFrom: 28,
      },
    ],
  },
  {
    id: "household-services",
    name: "Household Services",
    description:
      "Comprehensive home maintenance, meal preparation, and housekeeping services.",
    icon: "household-services",
    image: "/services/household.jpg",
    services: [
      {
        id: "light-housekeeping",
        title: "Light Housekeeping",
        description: "Maintaining a clean and safe living environment",
        features: [
          "Dusting & vacuuming",
          "Kitchen cleaning",
          "Bathroom maintenance",
          "Laundry assistance",
        ],
        icon: "broom",
        priceFrom: 28,
      },
      {
        id: "meal-preparation",
        title: "Meal Preparation",
        description: "Nutritious meal planning and cooking",
        features: [
          "Menu planning",
          "Grocery shopping",
          "Meal cooking",
          "Special diet accommodation",
        ],
        icon: "kitchen",
        priceFrom: 28,
      },
      {
        id: "home-organization",
        title: "Home Organization",
        description: "Organizing living spaces for safety and comfort",
        features: [
          "Closet organization",
          "Safety modifications",
          "Clutter removal",
          "Accessibility improvements",
        ],
        icon: "package",
        priceFrom: 28,
      },
    ],
  },
  {
    id: "companionship",
    name: "Companionship",
    description:
      "Social engagement, emotional support, and assistance with community activities.",
    icon: "companionship",
    image: "/services/companionship.jpg",
    services: [
      {
        id: "social-companionship",
        title: "Social Companionship",
        description: "Engaging conversation and emotional support",
        features: [
          "Conversation",
          "Games & puzzles",
          "Reading together",
          "Emotional support",
        ],
        icon: "users",
        priceFrom: 28,
      },
      {
        id: "activity-assistance",
        title: "Activity Assistance",
        description:
          "Help with hobbies, crafts, and recreational activities",
        features: [
          "Crafts & hobbies",
          "Exercise programs",
          "Pet care",
          "Technology assistance",
        ],
        icon: "palette",
        priceFrom: 28,
      },
      {
        id: "transportation",
        title: "Transportation Services",
        description: "Safe transportation and errand assistance",
        features: [
          "Medical appointments",
          "Grocery shopping",
          "Social outings",
          "Errands",
        ],
        icon: "car",
        priceFrom: 28,
      },
    ],
  },
];

/**
 * Flat list of services derived from categories for simple card displays
 */
export const services: Service[] = serviceCategories.flatMap((category) =>
  category.services.map((service) => ({
    id: service.id,
    title: service.title,
    description: service.description,
    href: `/services#${category.id}`,
    icon: service.icon,
  }))
);

/**
 * Statistics for the services page hero
 */
export const serviceStats = [
  { number: "500+", label: "Families Served", icon: "families-served" },
  { number: "24/7", label: "Available Support", icon: "available-support" },
  { number: "15+", label: "Years Experience", icon: "experience" },
  { number: "100%", label: "Licensed & Insured", icon: "licensed-insured" },
];

/**
 * Get services by category ID
 */
export function getServicesByCategory(categoryId: string): ServiceItem[] {
  const category = serviceCategories.find((cat) => cat.id === categoryId);
  return category?.services ?? [];
}

/**
 * Get a single service category
 */
export function getServiceCategory(
  categoryId: string
): ServiceCategory | undefined {
  return serviceCategories.find((cat) => cat.id === categoryId);
}
