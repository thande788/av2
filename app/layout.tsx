import type { Metadata } from "next";
import { Geist_Mono, Inter, Nunito } from "next/font/google";
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { ThemeProvider } from "@/components/theme-provider";
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${nunito.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <div className="min-h-screen">
            <header className="mx-auto flex w-full max-w-4xl items-center justify-end px-6 py-4">
              <AnimatedThemeToggle />
            </header>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
