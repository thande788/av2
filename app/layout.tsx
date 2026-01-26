import type { Metadata } from "next";
import { Geist_Mono, Inter, Nunito } from "next/font/google";
import "./globals.css";

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
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${nunito.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
