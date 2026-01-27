/**
 * Dynamic Open Graph Image Generation
 * 
 * Generates social sharing images for the home page
 * Used by social platforms when the site URL is shared
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
 */

import { ImageResponse } from "next/og";
import { siteMetadata } from "@/lib/seo";

// Image dimensions for OG
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Optionally export alt text
export const alt = `${siteMetadata.name} - Compassionate Home Care Services`;

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#030314",
          backgroundImage:
            "radial-gradient(circle at 30% 20%, rgba(231, 169, 182, 0.15), transparent 60%), radial-gradient(circle at 70% 80%, rgba(227, 115, 131, 0.1), transparent 65%)",
        }}
      >
        {/* Logo and Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #e7a9b6 0%, #e37383 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 20,
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            Angel Touch Homecare
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#e7a9b6",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
            marginBottom: 40,
          }}
        >
          Compassionate, Reliable In-Home Care
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 20,
            color: "rgba(255, 255, 255, 0.7)",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.5,
          }}
        >
          Professional home care services for seniors and individuals with disabilities in Greater Lowell, MA
        </div>

        {/* Service Areas */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
          }}
        >
          {["Lowell", "Dracut", "Chelmsford", "Tewksbury", "Billerica"].map(
            (city) => (
              <div
                key={city}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 20,
                  padding: "8px 16px",
                  fontSize: 14,
                  color: "rgba(255, 255, 255, 0.8)",
                }}
              >
                {city}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
