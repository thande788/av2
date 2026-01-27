import Link from "next/link";
import { IconCheck } from "@tabler/icons-react";

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
import { Badge } from "@/components/ui/badge";
import type { PricingTier } from "@/data/pricing";

export interface PricingCardProps {
  /** Pricing tier data */
  tier: PricingTier;
  /** Additional class names */
  className?: string;
  /** Show CTA button */
  showCTA?: boolean;
}

/**
 * Pricing card component displaying a single pricing tier
 * Backend-ready: accepts PricingTier from data or API
 */
export function PricingCard({
  tier,
  className,
  showCTA = true,
}: PricingCardProps) {
  const ctaText = tier.ctaText ?? "Get Started";
  const ctaHref = tier.ctaHref ?? "/contact";

  return (
    <Card
      className={cn(
        "relative h-full",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        tier.isPopular && "border-primary ring-2 ring-primary/20",
        className
      )}
    >
      {tier.isPopular && (
        <Badge
          className="absolute -top-3 left-1/2 -translate-x-1/2"
          variant="default"
        >
          Most Popular
        </Badge>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">{tier.title}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold text-primary">${tier.price}</span>
          <span className="text-muted-foreground">/{tier.period}</span>
        </div>
        <CardDescription className="mt-2">{tier.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          {tier.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <IconCheck className="size-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      {showCTA && (
        <CardFooter>
          <Button
            asChild
            className="w-full"
            variant={tier.isPopular ? "default" : "outline"}
          >
            <Link href={ctaHref}>{ctaText}</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Grid wrapper for displaying multiple pricing cards
 */
export function PricingCardGrid({
  tiers,
  className,
  ...props
}: {
  tiers: PricingTier[];
  className?: string;
} & Omit<PricingCardProps, "tier">) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-8 md:grid-cols-3 max-w-5xl mx-auto",
        className
      )}
    >
      {tiers.map((tier) => (
        <PricingCard key={tier.id} tier={tier} {...props} />
      ))}
    </div>
  );
}
