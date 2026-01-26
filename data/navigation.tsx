import {
  IconHome,
  IconInfoCircle,
  IconFileDescription,
  IconUsers,
  IconMessage,
  IconWorld,
} from "@tabler/icons-react";
import type { NavLink } from "@/types/navigation";

/**
 * Main navigation links for the Angel Touch website
 */
export const navLinks: NavLink[] = [
  {
    href: "/",
    label: "Home",
    icon: <IconHome className="size-5" />,
    description: "Return to our homepage",
  },
  {
    href: "/about",
    label: "About",
    icon: <IconInfoCircle className="size-5" />,
    description: "Learn about our mission and values",
  },
  {
    href: "/services",
    label: "Services",
    icon: <IconFileDescription className="size-5" />,
    description: "Explore our care services",
  },
  {
    href: "/caregivers",
    label: "Caregivers",
    icon: <IconUsers className="size-5" />,
    description: "Meet our dedicated team",
  },
  {
    href: "/testimonials",
    label: "Testimonials",
    icon: <IconMessage className="size-5" />,
    description: "Read what families say about us",
  },
  {
    href: "/client-portal",
    label: "Client Portal",
    icon: <IconWorld className="size-5" />,
    description: "Access your client account",
  },
];

/**
 * CTA button configuration
 */
export const ctaConfig = {
  href: "/contact",
  label: "Book Consultation",
  shortLabel: "Book",
} as const;
