"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface InfoTooltipProps {
  /** The help text to display */
  content: string;
  /** Side offset from trigger */
  sideOffset?: number;
  /** Preferred side */
  side?: "top" | "right" | "bottom" | "left";
  /** Icon size class */
  iconClassName?: string;
  /** Additional wrapper class */
  className?: string;
}

/**
 * Contextual info icon that reveals a help tooltip on hover/focus.
 * Touch-friendly: uses Radix's built-in pointer-down-open on mobile.
 *
 * @example
 * ```tsx
 * <InfoTooltip content="This score reflects how well matched the caregiver is to the client." />
 * ```
 */
export function InfoTooltip({
  content,
  sideOffset = 6,
  side = "top",
  iconClassName,
  className,
}: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className={cn(
          "inline-flex items-center justify-center rounded-full p-0.5",
          "text-muted-foreground/60 hover:text-muted-foreground",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
        aria-label="More info"
      >
        <Info className={cn("size-4", iconClassName)} />
      </TooltipTrigger>
      <TooltipContent side={side} sideOffset={sideOffset}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
