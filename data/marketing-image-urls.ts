const DEFAULT_MARKETING_ASSET_BASE_URL =
  "https://stangeltouch08291737.blob.core.windows.net/images/marketing/site-heroes";

const MARKETING_ASSET_BASE_URL = DEFAULT_MARKETING_ASSET_BASE_URL;

function getMarketingAssetUrl(fileName: string): string {
  return `${MARKETING_ASSET_BASE_URL}/${fileName}`;
}

export const marketingImageUrls = {
  homeHero: getMarketingAssetUrl("home-hero.jpg"),
  aboutHero: getMarketingAssetUrl("about-hero.jpg"),
  servicesHero: getMarketingAssetUrl("services-hero.jpg"),
  faqsHero: getMarketingAssetUrl("faqs-hero.jpg"),
  testimonialsHero: getMarketingAssetUrl("testimonials-hero.jpg"),
  caregiversHero: getMarketingAssetUrl("caregivers-hero.jpg"),
  whyChooseUsPersonalizedCare: getMarketingAssetUrl("why-choose-us-personalized-care.jpg"),
  whyChooseUsConsistentCaregivers: getMarketingAssetUrl("why-choose-us-consistent-caregivers.jpg"),
  whyChooseUsLocalRoots: getMarketingAssetUrl("why-choose-us-local-roots.jpg"),
  whyChooseUsClearPricing: getMarketingAssetUrl("why-choose-us-clear-pricing.jpg"),
  servicesCategoryPersonalCare: getMarketingAssetUrl("services-category-personal-care.jpg"),
  servicesCategoryHouseholdServices: getMarketingAssetUrl("services-category-household-services.jpg"),
  servicesCategoryCompanionship: getMarketingAssetUrl("services-category-companionship.jpg"),
} as const;
