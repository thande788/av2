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
  const periodLabels: Record<PricingTier["period"], string> = {
    hour: "hr",
    day: "day",
    week: "wk",
    month: "mo",
  };

  return (
    <Card
      className={cn(
        "relative h-full",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        tier.isPopular &&
          "border-primary/70 ring-2 ring-primary/25 shadow-lg shadow-primary/10 md:-mt-3 md:scale-[1.03]",
        className
      )}
    >
      {tier.isPopular && (
        <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 overflow-hidden">
          <div className="absolute right-[-48px] top-[14px] w-[180px] rotate-45 bg-emerald-500 px-2 py-1 text-center text-[11px] font-semibold tracking-wide text-white shadow-md">
             Popular
          </div>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">{tier.title}</CardTitle>
        <div className="mt-4">
          <div className="text-xs font-medium tracking-wide text-muted-foreground">
            Starting at
          </div>
          <span className="text-4xl font-bold text-primary">${tier.price}</span>
          <span className="text-muted-foreground">/{periodLabels[tier.period]}</span>
        </div>
        <CardDescription className="mt-2">{tier.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          {tier.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <IconCheck className="size-5 text-icon shrink-0 mt-0.5" />
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
