/**
 * Upload marketing hero/background images to Azure Blob Storage.
 *
 * Usage:
 *   pnpm tsx scripts/migrate-marketing-hero-images-to-azure.ts --dry-run
 *   pnpm tsx scripts/migrate-marketing-hero-images-to-azure.ts
 */

import { config } from "dotenv";

import { getStorageContainer, uploadBufferToAzureBlob } from "../lib/azure-blob";

config({ path: ".env" });
config({ path: ".env.local", override: true });

type MarketingAsset = {
  key: string;
  sourceUrl: string;
  blobName: string;
};

const assets: MarketingAsset[] = [
  {
    key: "homeHero",
    sourceUrl:
      "https://images.pexels.com/photos/7345465/pexels-photo-7345465.jpeg?auto=compress&cs=tinysrgb&w=1600",
    blobName: "marketing/site-heroes/home-hero.jpg",
  },
  {
    key: "aboutHero",
    sourceUrl:
      "https://images.pexels.com/photos/4342498/pexels-photo-4342498.jpeg?auto=compress&cs=tinysrgb&w=1600",
    blobName: "marketing/site-heroes/about-hero.jpg",
  },
  {
    key: "servicesHero",
    sourceUrl:
      "https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=1600",
    blobName: "marketing/site-heroes/services-hero.jpg",
  },
  {
    key: "faqsHero",
    sourceUrl:
      "https://images.pexels.com/photos/7551615/pexels-photo-7551615.jpeg?auto=compress&cs=tinysrgb&w=1600",
    blobName: "marketing/site-heroes/faqs-hero.jpg",
  },
  {
    key: "testimonialsHero",
    sourceUrl:
      "https://images.pexels.com/photos/5493781/pexels-photo-5493781.jpeg?auto=compress&cs=tinysrgb&w=1600",
    blobName: "marketing/site-heroes/testimonials-hero.jpg",
  },
  {
    key: "caregiversHero",
    sourceUrl:
      "https://images.pexels.com/photos/5452228/pexels-photo-5452228.jpeg?auto=compress&cs=tinysrgb&w=1600",
    blobName: "marketing/site-heroes/caregivers-hero.jpg",
  },
  {
    key: "whyChooseUsPersonalizedCare",
    sourceUrl:
      "https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=1600",
    blobName: "marketing/site-heroes/why-choose-us-personalized-care.jpg",
  },
  {
    key: "whyChooseUsConsistentCaregivers",
    sourceUrl:
      "https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=1600",
    blobName: "marketing/site-heroes/why-choose-us-consistent-caregivers.jpg",
  },
  {
    key: "whyChooseUsLocalRoots",
    sourceUrl:
      "https://images.pexels.com/photos/7551664/pexels-photo-7551664.jpeg?auto=compress&cs=tinysrgb&w=1600",
    blobName: "marketing/site-heroes/why-choose-us-local-roots.jpg",
  },
  {
    key: "whyChooseUsClearPricing",
    sourceUrl:
      "https://images.pexels.com/photos/7176325/pexels-photo-7176325.jpeg?auto=compress&cs=tinysrgb&w=1600",
    blobName: "marketing/site-heroes/why-choose-us-clear-pricing.jpg",
  },
  {
    key: "servicesCategoryPersonalCare",
    sourceUrl:
      "https://images.pexels.com/photos/7551617/pexels-photo-7551617.jpeg?auto=compress&cs=tinysrgb&w=1600",
    blobName: "marketing/site-heroes/services-category-personal-care.jpg",
  },
  {
    key: "servicesCategoryHouseholdServices",
    sourceUrl:
      "https://images.pexels.com/photos/4057758/pexels-photo-4057758.jpeg?auto=compress&cs=tinysrgb&w=1600",
    blobName: "marketing/site-heroes/services-category-household-services.jpg",
  },
  {
    key: "servicesCategoryCompanionship",
    sourceUrl:
      "https://images.pexels.com/photos/7551442/pexels-photo-7551442.jpeg?auto=compress&cs=tinysrgb&w=1600",
    blobName: "marketing/site-heroes/services-category-companionship.jpg",
  },
];

function guessContentType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes(".png")) return "image/png";
  if (lower.includes(".webp")) return "image/webp";
  if (lower.includes(".avif")) return "image/avif";
  return "image/jpeg";
}

async function fetchSource(url: string): Promise<{ data: Buffer; contentType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type")?.split(";")[0]?.trim();

  return {
    data: Buffer.from(arrayBuffer),
    contentType: contentType || guessContentType(url),
  };
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const container = getStorageContainer("AZURE_STORAGE_MARKETING_CONTAINER", "uploads");

  if (dryRun) {
    for (const asset of assets) {
      console.log(`[DRY-RUN] ${asset.key} -> ${container}/${asset.blobName}`);
    }
    return;
  }

  const uploadedByKey: Record<string, string> = {};

  for (const asset of assets) {
    const source = await fetchSource(asset.sourceUrl);
    const uploaded = await uploadBufferToAzureBlob({
      container,
      blobName: asset.blobName,
      data: source.data,
      contentType: source.contentType,
    });

    uploadedByKey[asset.key] = uploaded.url;
    console.log(`[UPLOADED] ${asset.key} -> ${uploaded.url}`);
  }

  console.log("---");
  console.log("Use these URLs in code:");
  console.log(JSON.stringify(uploadedByKey, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
