import {
  IconBath,
  IconWheelchair,
  IconPill,
  IconToolsKitchen2,
  IconPackage,
  IconUsers,
  IconPalette,
  IconCar,
  IconUser,
  IconHome,
  IconHeart,
  IconSparkles,
  IconUsersGroup,
  IconClock24,
  IconStar,
  IconShield,
} from "@tabler/icons-react";
import { Bubbles } from "lucide-react";
import type { ComponentType } from "react";

/**
 * Central icon registry for services
 * Maps icon names to Tabler icon components
 */
export const serviceIconMap: Record<
  string,
  ComponentType<{ className?: string }>
> = {
  // Personal Care
  bath: IconBath,
  wheelchair: IconWheelchair,
  pill: IconPill,

  // Household Services
  broom: Bubbles,
  kitchen: IconToolsKitchen2,
  package: IconPackage,

  // Companionship
  users: IconUsers,
  palette: IconPalette,
  car: IconCar,

  // Category-level icons
  "personal-care": IconUser,
  "household-services": IconHome,
  companionship: IconHeart,

  // Stat icons
  "families-served": IconUsersGroup,
  "available-support": IconClock24,
  experience: IconStar,
  "licensed-insured": IconShield,

  // Fallback
  default: IconSparkles,
};

/**
 * Get icon component by name
 */
export function getServiceIcon(
  iconName: string,
  className = "size-8"
): React.ReactNode {
  const Icon = serviceIconMap[iconName] || serviceIconMap.default;
  return <Icon className={className} />;
}

/**
 * Get icon component class by name (for custom rendering)
 */
export function getServiceIconComponent(
  iconName: string
): ComponentType<{ className?: string }> {
  return serviceIconMap[iconName] || serviceIconMap.default;
}
