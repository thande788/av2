import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconPhone } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TestimonialCardGrid } from "@/components/testimonials/testimonial-card";
import { testimonials } from "@/data/testimonials";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Read stories from families who trust Angel Touch Homecare for compassionate, personalized home care services in the Greater Lowell area.",
  keywords: [
    "home care testimonials",
    "caregiver reviews",
    "Angel Touch reviews",
    "home care Lowell reviews",
    "family caregiver testimonials",
  ],
  openGraph: {
    title: "Client Testimonials | Angel Touch Homecare",
    description:
      "Hear from the families and clients who have experienced the compassionate care that makes Angel Touch special.",
    type: "website",
  },
};

/**
 * Testimonials page
 *
 * Displays client testimonials in a responsive grid layout
 * replacing the legacy carousel with a more accessible approach.
 */
export default function TestimonialsPage() {
  return (
    <main
      className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto"
      aria-label="Client Testimonials"
    >
      {/* Hero Section */}
      <section className="text-center mb-16">
        <Card
          className={cn(
            "p-10 md:p-16",
            "bg-gradient-to-br from-card/85 via-card/70 to-card/85",
            "border-border/30 shadow-lg backdrop-blur-md"
          )}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
            Stories from Our Families
          </h1>

          {/* Hero Image */}
          <div className="max-w-md mx-auto mb-8 rounded-3xl overflow-hidden shadow-lg">
            <Image
              src="https://images.pexels.com/photos/7551442/pexels-photo-7551442.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Care and trust between families and caregivers"
              width={800}
              height={600}
              className="w-full h-auto object-cover"
              priority
              sizes="(min-width: 900px) 500px, 90vw"
            />
          </div>

          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base md:text-lg">
            Hear from the families and clients who have experienced the
            compassionate care that makes Angel Touch special.
          </p>
        </Card>
      </section>

      {/* Testimonials Grid */}
      <section className="mb-20" aria-labelledby="testimonials-heading">
        <h2 id="testimonials-heading" className="sr-only">
          Client Testimonials
        </h2>
        <TestimonialCardGrid testimonials={testimonials} />
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <Card
          className={cn(
            "p-10 md:p-14",
            "bg-gradient-to-r from-primary to-primary/80",
            "text-primary-foreground border-0 shadow-lg"
          )}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Experience Compassionate Care?
          </h2>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed mb-8">
            Join the families who trust Angel Touch for reliable, personalized
            home care services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="font-bold">
              <Link href="/contact">Schedule Your Free Consultation</Link>
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
