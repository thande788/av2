"use client";

import Link from "next/link";
import { IconPhone } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FAQAccordionProps, FAQSectionProps } from "@/types/faq";

/**
 * Individual FAQ accordion item
 */
function FAQAccordionItem({ item }: { item: FAQAccordionProps["items"][number] }) {
  return (
    <AccordionItem
      value={item.id}
      className={cn(
        "rounded-xl border border-border/50",
        "bg-card/50 backdrop-blur-sm",
        "transition-colors duration-200",
        "data-[state=open]:bg-card data-[state=open]:border-border"
      )}
    >
      <AccordionTrigger
        className={cn(
          "px-6 py-4 text-left",
          "text-base md:text-lg font-semibold",
          "text-foreground hover:text-primary",
          "hover:no-underline",
          "rounded-xl",
          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        )}
      >
        {item.question}
      </AccordionTrigger>
      <AccordionContent
        className={cn(
          "px-6 pb-4 pt-0",
          "text-sm md:text-base leading-relaxed",
          "text-muted-foreground"
        )}
      >
        {item.answer}
      </AccordionContent>
    </AccordionItem>
  );
}

/**
 * FAQ Accordion component using shadcn/ui Accordion
 * Replaces HeadlessUI Disclosure with Radix-based implementation
 */
export function FAQAccordion({
  items,
  className,
  allowMultiple = false,
  defaultOpen,
}: FAQAccordionProps) {
  // Convert defaultOpen to array format for consistency
  const defaultValue = defaultOpen
    ? Array.isArray(defaultOpen)
      ? defaultOpen
      : [defaultOpen]
    : undefined;

  // Render different accordion types based on allowMultiple
  // This is needed because Radix Accordion uses discriminated unions
  if (allowMultiple) {
    return (
      <Accordion
        type="multiple"
        defaultValue={defaultValue}
        className={cn("space-y-3", className)}
      >
        {items.map((item) => (
          <FAQAccordionItem key={item.id} item={item} />
        ))}
      </Accordion>
    );
  }

  return (
    <Accordion
      type="single"
      defaultValue={defaultValue?.[0]}
      collapsible
      className={cn("space-y-3", className)}
    >
      {items.map((item) => (
        <FAQAccordionItem key={item.id} item={item} />
      ))}
    </Accordion>
  );
}

/**
 * Full FAQ Section with heading and optional CTA
 */
export function FAQSection({
  items,
  className,
  title = "Frequently Asked Questions",
  description,
  showCTA = true,
  ...accordionProps
}: FAQSectionProps) {
  return (
    <section
      className={cn("py-12 md:py-16", className)}
      aria-labelledby="faq-title"
    >
      {/* Header */}
      <div className="mb-8 md:mb-12 text-center">
        <h2
          id="faq-title"
          className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
        >
          {title}
        </h2>
        {description && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </div>

      {/* Accordion */}
      <div className="max-w-3xl mx-auto">
        <FAQAccordion items={items} {...accordionProps} />
      </div>

      {/* CTA Section */}
      {showCTA && (
        <div className="mt-12 md:mt-16">
          <div
            className={cn(
              "max-w-2xl mx-auto rounded-2xl p-6 md:p-8",
              "bg-gradient-to-r from-primary to-primary/80",
              "text-primary-foreground shadow-lg"
            )}
          >
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-center">
              Still Have Questions?
            </h3>
            <p className="text-primary-foreground/90 mb-6 text-base md:text-lg text-center">
              We&apos;re here to help! Contact us for personalized answers to your
              specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="font-bold"
              >
                <Link href="/contact">Contact Us</Link>
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
          </div>
        </div>
      )}
    </section>
  );
}
