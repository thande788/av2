"use client";

import Image from "next/image";
import Link from "next/link";
import {
  IconBath,
  IconUsers,
  IconToolsKitchen2,
  IconPill,
  IconCar,
  IconSparkles,
} from "@tabler/icons-react";
import { Brush } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ServiceCardProps, Service } from "@/types/cards";

/**
 * Icon mapping for service types
 */
const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Personal Care": IconBath,
  "Companionship & Supervision": IconUsers,
  "Meal Planning & Preparation": IconToolsKitchen2,
  "Medication Reminders": IconPill,
  "Light Housekeeping & Laundry": Brush,
  "Transportation & Escort": IconCar,
};

/**
 * Get icon for a service, with fallback
 */
function getServiceIcon(title: string) {
  const Icon = serviceIcons[title] || IconSparkles;
  return <Icon className="size-8" />;
}

/**
 * Service card component displaying a single service offering
 * Uses shadcn Card with custom styling for Angel Touch brand
 */
export function ServiceCard({
  service,
  className,
  showActions = true,
  onLearnMore,
  onAddToPlan,
}: ServiceCardProps) {
  const { title, description, image, imageAlt, href, icon } = service;

  const cardContent = (
    <Card
      className={cn(
        "group h-full transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1",
        "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
        className
      )}
      tabIndex={href ? -1 : 0}
      aria-label={`${title} service details`}
    >
      {image && (
        <div className="relative h-32 overflow-hidden rounded-t-xl">
          <Image
            src={image}
            alt={imageAlt || `${title} - home care service illustration`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
      )}

      <CardHeader>
        <div
          className="mb-2 flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary"
          aria-hidden="true"
        >
          {icon || getServiceIcon(title)}
        </div>
        <CardTitle className="text-lg font-semibold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <CardDescription className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </CardDescription>
      </CardContent>

      {showActions && (
        <CardFooter className="mt-auto gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLearnMore?.(service)}
            aria-label={`Learn more about ${title}`}
          >
            Learn More
          </Button>
          <Button
            size="sm"
            onClick={() => onAddToPlan?.(service)}
            aria-label={`Add ${title} to care plan`}
          >
            Add to Plan
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  // Wrap in Link if href is provided
  if (href) {
    return (
      <Link href={href} className="block h-full focus:outline-none">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

/**
 * Grid wrapper for displaying multiple service cards
 */
export function ServiceCardGrid({
  services,
  className,
  ...props
}: {
  services: Service[];
  className?: string;
} & Omit<ServiceCardProps, "service">) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} {...props} />
      ))}
    </div>
  );
}
