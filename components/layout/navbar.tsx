"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconMenu2 } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { Logo } from "./logo";
import { navLinks, ctaConfig } from "@/data/navigation";
import type { NavbarProps } from "@/types/navigation";

/**
 * Main navigation component with responsive design
 * - Desktop: Horizontal navigation with full links
 * - Mobile: Hamburger menu with Sheet slide-out
 */
export function Navbar({
  className,
  showCTA = true,
  ctaText = ctaConfig.label,
  ctaHref = ctaConfig.href,
}: NavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrollState, setScrollState] = React.useState({
    scrolled: false,
    compact: false,
  });

  // Throttled scroll listener for performance
  React.useEffect(() => {
    let pending = false;

    const onScroll = () => {
      if (pending) return;
      pending = true;

      requestAnimationFrame(() => {
        pending = false;
        const y = window.scrollY;
        setScrollState((prev) => {
          const next = { scrolled: y > 20, compact: y > 140 };
          return prev.scrolled !== next.scrolled || prev.compact !== next.compact
            ? next
            : prev;
        });
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "sticky top-0 w-full max-w-[100vw] box-border overflow-x-hidden",
        "flex items-center gap-2 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10",
        "z-50 transition-colors duration-300",
        scrollState.scrolled
          ? "shadow-lg border-b border-border/20 backdrop-blur-md bg-background/80"
          : "bg-transparent backdrop-blur-md",
        scrollState.compact ? "py-2 min-h-14" : "py-3 min-h-16",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center min-w-0 flex-1 lg:flex-none mr-2 lg:mr-4 xl:mr-2">
        <Logo size={scrollState.compact ? "sm" : "md"} />
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex flex-1 justify-center px-2 lg:px-4 xl:px-6">
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-1 xl:gap-2">
          {navLinks.map(({ href, label, icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1 px-2 py-2 sm:px-3 sm:py-3",
                  "no-underline font-medium text-xs sm:text-sm lg:text-xs xl:text-sm",
                  "rounded-lg transition-all duration-300",
                  "min-h-10 sm:min-h-12 lg:min-w-12 xl:min-w-14",
                  "justify-center whitespace-nowrap",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  "active:scale-95 sm:hover:-translate-y-0.5 sm:hover:shadow-md",
                  isActive
                    ? "text-primary-foreground bg-primary font-semibold border border-primary/30 shadow-lg"
                    : "text-foreground/90 sm:hover:text-foreground sm:hover:bg-muted active:bg-muted/80"
                )}
              >
                {icon}
                <span className="truncate font-medium tracking-tight">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop CTA & Theme Toggle */}
      {showCTA && (
        <div className="hidden lg:flex items-center justify-end gap-2 flex-shrink-0 ml-1 xl:ml-2">
          <AnimatedThemeToggle />
          <Button asChild size="lg" className="rounded-full font-semibold">
            <Link href={ctaHref}>
              <span className="lg:hidden xl:inline">{ctaText}</span>
              <span className="hidden lg:inline xl:hidden">{ctaConfig.shortLabel}</span>
            </Link>
          </Button>
        </div>
      )}

      {/* Mobile Menu */}
      <div className="flex items-center gap-2 lg:hidden ml-auto">
        <AnimatedThemeToggle />
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
              suppressHydrationWarning
            >
              <IconMenu2 className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0">
            <SheetHeader className="border-b border-border p-4">
              <SheetTitle className="text-left font-bold">Menu</SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col p-4" aria-label="Mobile navigation">
              <ul className="space-y-1">
                {navLinks.map(({ href, label, icon, description }) => {
                  const isActive = pathname === href;

                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setIsOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3",
                          "rounded-lg text-sm font-medium",
                          "transition-all duration-200",
                          "active:scale-[0.98] sm:hover:scale-[1.02]",
                          isActive
                            ? "text-primary bg-primary/10 font-semibold border border-primary/20"
                            : "text-foreground/80 hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <span className="flex-shrink-0">{icon}</span>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{label}</span>
                          {description && (
                            <span className="text-xs text-muted-foreground truncate">
                              {description}
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Mobile CTA */}
              {showCTA && (
                <div className="mt-6 pt-4 border-t border-border">
                  <Button asChild className="w-full rounded-full font-semibold">
                    <Link href={ctaHref} onClick={() => setIsOpen(false)}>
                      {ctaText}
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
