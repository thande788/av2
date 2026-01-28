import type { Metadata } from "next";
import { Geist_Mono, Inter, Nunito } from "next/font/google";
import { ClerkProvider } from "@/components/clerk-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar, Footer, SkipLink } from "@/app/layout";
import { LazyChatWidget } from "@/components/shared";
import { getBrandAccentsAttribute } from "@/data/site-config";
import { siteMetadata } from "@/lib/seo/site-metadata";
import "./globals.css";

// const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.url),
  title: {
    default: "Angel Touch Homecare Services",
    template: "%s | Angel Touch Homecare",
  },
  description:
    "Compassionate, professional homecare services supporting independence, dignity, and quality of life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const brandAccents = getBrandAccentsAttribute();

  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        {...(brandAccents && { "data-accents": brandAccents })}
      >
        <body className={`${inter.variable} ${nunito.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <SkipLink />
            <Navbar />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
            <LazyChatWidget />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
