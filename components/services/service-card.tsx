"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { getServiceIcon } from "@/lib/icons";
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
import type { ServiceItem } from "@/data/services";

/**
 * Props for the detailed service item card (used in modals)
 */
export interface ServiceItemCardProps {
  /** Service item data from category */
  service: ServiceItem;
  /** Additional class names */
  className?: string;
  /** Show price if available */
  showPrice?: boolean;
  /** CTA link */
  ctaHref?: string;
}

/**
 * Detailed service item card for modal/detail views
 * Shows icon, description, features list, and optional price
 */
export function ServiceItemCard({
  service,
  className,
  showPrice = true,
  ctaHref = "/contact",
}: ServiceItemCardProps) {
  return (
    <Card
      className={cn(
        "bg-card/50 border-border/50 hover:border-primary/30 transition-colors h-full",
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <span className="text-primary" aria-hidden="true">
            {getServiceIcon(service.icon, "size-6")}
          </span>
          <CardTitle className="text-base">{service.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription>{service.description}</CardDescription>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Key Features
          </p>
          <ul className="grid grid-cols-1 gap-1">
            {service.features.map((feature, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span className="size-1.5 rounded-full bg-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t border-border/50 flex justify-between items-center mt-auto">
        <Button asChild variant="link" className="p-0 h-auto text-primary">
          <Link href={ctaHref}>Get Started →</Link>
        </Button>
        {showPrice && service.priceFrom && (
          <span className="text-sm text-muted-foreground">
            From{" "}
            <span className="text-primary font-semibold">
              ${service.priceFrom}/hr
            </span>
          </span>
        )}
      </CardFooter>
    </Card>
  );
}

/**
 * Grid wrapper for service item cards
 */
export function ServiceItemCardGrid({
  services,
  className,
  ...props
}: {
  services: ServiceItem[];
  className?: string;
} & Omit<ServiceItemCardProps, "service">) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {services.map((service) => (
        <ServiceItemCard key={service.id} service={service} {...props} />
      ))}
    </div>
  );
}

/**
 * Service card component displaying a single service offering
 * Uses shadcn Card with custom styling for Angel Touch brand
 * For simple service list displays (homepage, etc.)
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
          {getServiceIcon(typeof icon === "string" ? icon : "default")}
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
