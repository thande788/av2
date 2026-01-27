import type { Metadata } from "next";
import Image from "next/image";

import { FAQSection } from "@/components/faqs";
import { faqs } from "@/data/faqs";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Find answers to common questions about Angel Touch Homecare services, caregiver qualifications, payment options, and getting started with home care.",
  keywords: [
    "home care FAQ",
    "caregiver questions",
    "home care services Lowell",
    "homecare payment options",
    "HIPAA compliant home care",
  ],
  openGraph: {
    title: "Frequently Asked Questions | Angel Touch Homecare",
    description:
      "Find answers to common questions about our compassionate home care services in the Greater Lowell area.",
    type: "website",
  },
};

/**
 * FAQs page
 *
 * Server component that displays frequently asked questions
 * using the FAQSection component from Sprint 3.
 */
export default function FAQsPage() {
  return (
    <main
      className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16"
      aria-label="Frequently Asked Questions"
    >
      {/* Page Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-foreground mb-8 md:mb-12">
        Frequently Asked Questions
      </h1>

      {/* Hero Image */}
      <div className="mb-12 md:mb-16 flex justify-center">
        <div className="bg-card/80 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-border/20 max-w-2xl overflow-hidden">
          <Image
            src="https://images.pexels.com/photos/7551615/pexels-photo-7551615.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="Seniors and family learning together, symbolizing support and knowledge sharing"
            width={1260}
            height={750}
            className="w-full h-auto rounded-xl shadow-md"
            priority={false}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMiMUFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADERIh/9oADAMBAAIRAxEAPwC9u7V0e/ux2TaXDsjqJJC8ShQGAx4gn6KxqKKqKnZRYlcBhOxn/9k="
          />
        </div>
      </div>

      {/* FAQ Section (uses accordion from Sprint 3) */}
      <FAQSection
        items={faqs}
        title=""
        description="Get answers to the most common questions about our home care services."
        showCTA={true}
      />
    </main>
  );
}
