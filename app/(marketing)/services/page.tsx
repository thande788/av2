import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconPhone } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { getServiceIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PricingCardGrid } from "@/components/services/pricing-card";
import { ServiceCategoriesSection } from "@/components/services/service-categories-section";
import { serviceStats, serviceCategories } from "@/data/services";
import { getActivePricingTiers } from "@/data/pricing";
import { JsonLdGraph } from "@/components/seo";
import { createServiceSchema, localBusinessSchema, getCanonicalAlternates } from "@/lib/seo";

// Generate service schemas from data
const serviceSchemas = serviceCategories.flatMap((category) =>
  category.services.map((service) =>
    createServiceSchema({
      name: service.title,
      description: service.description,
      category: category.name,
    })
  )
);

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
  alternates: getCanonicalAlternates("/services"),
  openGraph: {
    title: "Our Care Services | Angel Touch Homecare",
    description:
      "Professional, compassionate homecare tailored to your unique needs. Licensed, insured, and committed to your comfort and independence.",
    type: "website",
  },
};

/**
 * Services page
 */
export default function ServicesPage() {
  const pricingTiers = getActivePricingTiers();

  return (
    <>
      <JsonLdGraph schemas={[localBusinessSchema, ...serviceSchemas]} />
      <main className="min-h-screen">
        {/* Hero Section */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mt-4 mb-14 md:mb-18">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=1600"
              alt="Professional homecare services"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/35" /> */}
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent/20" />
          </div>

          <div className="relative z-10 px-6 md:px-10 py-14 md:py-20">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 leading-tight">
                Our{" "}
                <span className="text-decorative">Comprehensive</span>
                <br />
                Care Services
              </h1>
              <p className="italic text-xl md:text-2xl text-decorative/70 mb-8 leading-relaxed">
                Professional, compassionate homecare tailored to your unique
                needs. Licensed, insured, and committed to your comfort and
                independence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="px-6 text-base sm:px-8 sm:text-lg"
                >
                  <Link href="/contact">Get Started</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="px-6 text-decorative/80 sm:px-8 sm:text-lg"
                >
                  <a href="#services">View Services</a>
                </Button>
              </div>
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
                "text-center p-4 sm:p-6 md:p-8",
                "bg-card/50 backdrop-blur-md",
                "border-border/50 hover:border-primary/30",
                "transition-all duration-300 hover:-translate-y-1"
              )}
            >
              <div className="text-icon mb-3 flex justify-center" aria-hidden="true">
                {getServiceIcon(stat.icon, "size-10")}
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-muted-foreground font-medium">
                {stat.label}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Service Categories Section - Carousel with DetailSheet */}
      <section id="services" className="scroll-mt-24">
        <ServiceCategoriesSection />
      </section>

      {/* Pricing Section */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mb-16 md:mb-20">
        <Card className="relative overflow-hidden p-6 sm:p-8 md:p-12 bg-card/50 border-border/50">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/0.12),transparent_55%)]"
            aria-hidden="true"
          />
          <div className="relative z-10 text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Transparent <span className="text-accent-rose">Pricing</span>
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Quality care shouldn&apos;t break the bank. Our competitive rates
              ensure you get exceptional service at fair prices.
            </p>
          </div>

          <div className="relative z-10">
            <PricingCardGrid tiers={pricingTiers} />

            <div className="mt-10 md:mt-12 flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground text-center max-w-3xl">
                Rates shown are starting points and may vary based on care needs,
                schedule, and level of support. We&apos;ll provide a clear quote
                after a free consultation.
              </p>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span>Licensed &amp; insured</span>
                <span aria-hidden="true">•</span>
                <span>Compassionate, trained caregivers</span>
                <span aria-hidden="true">•</span>
                <span>Flexible scheduling</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg">
                  <Link href="/contact">Request a Quote</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="tel:978-856-9358">Call to Discuss Care</a>
                </Button>
              </div>
            </div>
          </div>
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
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="font-bold text-base sm:text-lg"
            >
              <Link href="/contact">Schedule Free Consultation</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-sm sm:text-base"
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
    </>
  );
}
