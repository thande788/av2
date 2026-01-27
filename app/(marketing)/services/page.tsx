import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconPhone } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { getServiceIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ServiceItemCardGrid } from "@/components/services/service-card";
import { PricingCardGrid } from "@/components/services/pricing-card";
import {
  serviceCategories,
  serviceStats,
  type ServiceCategory,
} from "@/data/services";
import { getActivePricingTiers } from "@/data/pricing";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Professional, compassionate homecare services tailored to your unique needs. Personal care, household services, and companionship in the Greater Lowell area.",
  keywords: [
    "home care services Lowell",
    "personal care assistance",
    "companion care",
    "household help seniors",
    "medication reminders",
    "transportation services elderly",
  ],
  openGraph: {
    title: "Our Care Services | Angel Touch Homecare",
    description:
      "Professional, compassionate homecare tailored to your unique needs. Licensed, insured, and committed to your comfort and independence.",
    type: "website",
  },
};



/**
 * Service detail modal content
 */
function ServiceDetailContent({ category }: { category: ServiceCategory }) {
  return (
    <div className="space-y-6">
      <ServiceItemCardGrid services={category.services} />

      <div className="text-center pt-4 border-t border-border">
        <p className="text-muted-foreground mb-4">
          Ready to get started with {category.name.toLowerCase()}?
        </p>
        <Button asChild size="lg">
          <Link href="/contact">Contact Us Today</Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * Service category card with dialog
 */
function ServiceCategoryCard({ category }: { category: ServiceCategory }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card
          className={cn(
            "group cursor-pointer h-full",
            "bg-gradient-to-br from-card/80 to-card/60",
            "border-border/50 hover:border-primary/30",
            "transition-all duration-300 hover:-translate-y-2 hover:shadow-lg",
            "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          )}
          tabIndex={0}
          role="button"
          aria-label={`View ${category.name} services`}
        >
          {/* Category Image */}
          <div className="relative h-40 overflow-hidden rounded-t-xl">
            <Image
              src={`https://images.pexels.com/photos/${
                category.id === "personal-care"
                  ? "7551617"
                  : category.id === "household-services"
                    ? "4057758"
                    : "7551442"
              }/pexels-photo-${
                category.id === "personal-care"
                  ? "7551617"
                  : category.id === "household-services"
                    ? "4057758"
                    : "7551442"
              }.jpeg?auto=compress&cs=tinysrgb&w=800`}
              alt={`${category.name} services`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/80" />
          </div>

          <CardContent className="text-center pt-6 pb-4">
            {/* Icon */}
            <div
              className={cn(
                "mx-auto mb-4 size-20 rounded-full",
                "bg-gradient-to-br from-primary to-primary/80",
                "flex items-center justify-center",
                "text-primary-foreground shadow-lg",
                "group-hover:scale-110 transition-transform duration-300"
              )}
            >
              {getServiceIcon(category.icon, "size-10")}
            </div>

            <CardTitle className="text-xl md:text-2xl mb-3">
              {category.name}
            </CardTitle>

            <div className="h-1 w-20 bg-gradient-to-r from-primary to-primary/60 rounded-full mx-auto mb-4" />

            <CardDescription className="text-sm md:text-base leading-relaxed mb-4">
              {category.description}
            </CardDescription>

            {/* Service count badge */}
            <Badge variant="secondary" className="mb-4">
              {category.services.length} Services Available
            </Badge>

            {/* Click indicator */}
            <p className="text-primary font-semibold text-sm flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
              Click to View Services
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </p>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "size-16 rounded-full",
                "bg-gradient-to-br from-primary to-primary/80",
                "flex items-center justify-center",
                "text-primary-foreground shadow-lg"
              )}
            >
              {getServiceIcon(category.icon, "size-8")}
            </div>
            <div>
              <DialogTitle className="text-2xl md:text-3xl">
                {category.name}
              </DialogTitle>
              <DialogDescription>{category.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <ServiceDetailContent category={category} />
      </DialogContent>
    </Dialog>
  );
}

/**
 * Services page
 */
export default function ServicesPage() {
  const pricingTiers = getActivePricingTiers();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden mx-4 md:mx-8 mt-4 mb-14 md:mb-18">
        <div className="absolute inset-0">
          <Image
            src="https://images.pexels.com/photos/7551615/pexels-photo-7551615.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Professional homecare services"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-background/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-transparent" />
        </div>

        <div className="relative z-10 px-6 md:px-10 py-14 md:py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Our{" "}
              <span className="text-primary">Comprehensive</span>
              <br />
              Care Services
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Professional, compassionate homecare tailored to your unique
              needs. Licensed, insured, and committed to your comfort and
              independence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/contact">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8">
                <a href="#services">View Services</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {serviceStats.map((stat, idx) => (
            <Card
              key={idx}
              className={cn(
                "text-center p-6 md:p-8",
                "bg-card/50 backdrop-blur-md",
                "border-border/50 hover:border-primary/30",
                "transition-all duration-300 hover:-translate-y-1"
              )}
            >
              <div className="text-primary mb-3 flex justify-center" aria-hidden="true">
                {getServiceIcon(stat.icon, "size-10")}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-muted-foreground font-medium">
                {stat.label}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Service Categories */}
      <section
        id="services"
        className="px-4 md:px-8 max-w-7xl mx-auto mb-14 md:mb-20 scroll-mt-20"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Our Service <span className="text-primary">Categories</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Click on any category to explore our comprehensive services designed
            to support your independence and well-being.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {serviceCategories.map((category) => (
            <ServiceCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
        <Card className="p-8 md:p-12 bg-card/50 border-border/50">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Transparent <span className="text-primary">Pricing</span>
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Quality care shouldn&apos;t break the bank. Our competitive rates
              ensure you get exceptional service at fair prices.
            </p>
          </div>

          <PricingCardGrid tiers={pricingTiers} />
        </Card>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mb-16">
        <Card
          className={cn(
            "p-8 md:p-12 text-center",
            "bg-gradient-to-r from-primary to-primary/80",
            "text-primary-foreground border-0"
          )}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Experience Compassionate Care?
          </h2>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed mb-8">
            Contact us today for a free consultation and personalized care
            assessment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="font-bold">
              <Link href="/contact">Schedule Free Consultation</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <a href="tel:978-856-9358">
                <IconPhone className="mr-2 size-4" />
                Call (978) 856-9358
              </a>
            </Button>
          </div>
        </Card>
      </section>
    </main>
  );
}
