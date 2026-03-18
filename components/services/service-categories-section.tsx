"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { getServiceIcon } from "@/lib/icons";
import { FeatureCarousel, type FeatureSlide } from "@/components/shared/feature-carousel";
import { DetailSheet } from "@/components/shared/detail-sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  serviceCategories as staticCategories,
  type ServiceCategory,
} from "@/data/services";

/**
 * Feature flag: Enable/disable carousel autoplay for service categories
 * Set to 0 to disable autoplay and show manual navigation arrows
 */
const SERVICE_CAROUSEL_AUTOPLAY = 0; // 0 = off, or set ms (e.g., 5000)

/**
 * Category image mapping
 */
const categoryImages: Record<string, string> = {
  "personal-care": "7551617",
  "household-services": "4057758",
  "companionship": "7551442",
};

/**
 * Service category carousel slides - generated from serviceCategories data
 */
function getServiceCategorySlides(categories: ServiceCategory[]): FeatureSlide[] {
  return categories.map((category) => {
    const imageId = categoryImages[category.id] || "7551442";
    return {
      id: category.id,
      title: category.name,
      description: category.description,
      image: `https://images.pexels.com/photos/${imageId}/pexels-photo-${imageId}.jpeg?auto=compress&cs=tinysrgb&w=1600`,
      imageAlt: `${category.name} services`,
      align: "left" as const,
      overlay: "bg-gradient-to-t from-black/85 via-black/55 to-black/35",
    };
  });
}

/**
 * Service detail sheet content - displays service items in an accordion
 */
function ServiceDetailContent({ category }: { category: ServiceCategory }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {category.services.map((service, idx) => (
        <AccordionItem key={idx} value={`service-${idx}`}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "size-10 shrink-0 rounded-full",
                  "bg-gradient-to-br from-icon/20 to-icon/10",
                  "flex items-center justify-center",
                  "text-icon"
                )}
              >
                {getServiceIcon(service.icon, "size-5")}
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-semibold text-sm text-foreground text-left">
                  {service.title}
                </span>
                {service.priceFrom && (
                  <span className="text-xs text-muted-foreground">
                    From <span className="text-primary font-medium">${service.priceFrom}/hr</span>
                  </span>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pl-13 space-y-3">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {service.description}
              </p>
              
              {/* Key Features */}
              {service.features && service.features.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Key Features
                  </p>
                  <ul className="grid grid-cols-1 gap-1.5">
                    {service.features.map((feature, featureIdx) => (
                      <li
                        key={featureIdx}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* CTA */}
              <div className="pt-2">
                <Link 
                  href="/contact" 
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Get Started →
                </Link>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/**
 * Service Categories Section with Carousel and DetailSheet
 * Clicking a carousel slide opens the corresponding DetailSheet
 */
export function ServiceCategoriesSection({ categories }: { categories?: ServiceCategory[] } = {}) {
  const data = categories ?? staticCategories;
  const [selectedCategory, setSelectedCategory] = React.useState<ServiceCategory | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const handleSlideClick = React.useCallback((slideId: string) => {
    const category = data.find((c) => c.id === slideId);
    if (category) {
      setSelectedCategory(category);
      setSheetOpen(true);
    }
  }, [data]);

  const handleSheetOpenChange = React.useCallback((open: boolean) => {
    setSheetOpen(open);
    if (!open) {
      // Small delay before clearing to allow close animation
      setTimeout(() => setSelectedCategory(null), 200);
    }
  }, []);

  const slides = React.useMemo(() => getServiceCategorySlides(data), [data]);

  return (
    <section
      className="px-4 md:px-8 max-w-7xl mx-auto mb-14 md:mb-20"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          Our Service <span className="text-primary">Categories</span>
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Tap on any category to explore comprehensive services
          designed to support your independence and well-being.
        </p>
      </div>

      <FeatureCarousel
        slides={slides}
        autoplayDelay={SERVICE_CAROUSEL_AUTOPLAY}
        showDots
        showArrows
        showArrowsWhenAutoplayOff={false}
        arrowsClassName="hidden md:flex"
        aspectRatio="aspect-[16/9] md:aspect-[21/9]"
        onSlideClick={handleSlideClick}
      />

      {/* DetailSheet for selected category */}
      {selectedCategory && (
        <DetailSheet
          open={sheetOpen}
          onOpenChange={handleSheetOpenChange}
          title={selectedCategory.name}
          description={selectedCategory.description}
          icon={getServiceIcon(selectedCategory.icon, "size-7")}
          headerImage={`https://images.pexels.com/photos/${categoryImages[selectedCategory.id] || "7551442"}/pexels-photo-${categoryImages[selectedCategory.id] || "7551442"}.jpeg?auto=compress&cs=tinysrgb&w=800`}
          headerImageAlt={`${selectedCategory.name} services`}
          footerPrompt={`Ready to get started with ${selectedCategory.name.toLowerCase()}?`}
          ctaText="Contact Us Today"
          ctaHref="/contact"
        >
          <ServiceDetailContent category={selectedCategory} />
        </DetailSheet>
      )}
    </section>
  );
}

export default ServiceCategoriesSection;
