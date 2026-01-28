/**
 * MotionWrapper Component
 * 
 * A wrapper around framer-motion that respects prefers-reduced-motion.
 * Provides consistent animation patterns across the app.
 * 
 * @example
 * ```tsx
 * <MotionWrapper
 *   initial={{ opacity: 0, y: 20 }}
 *   animate={{ opacity: 1, y: 0 }}
 *   transition={{ duration: 0.3 }}
 * >
 *   <Card>Content</Card>
 * </MotionWrapper>
 * ```
 */

"use client";

import { motion, type MotionProps, type Variants } from "motion/react";
import { forwardRef, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// Common animation presets
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Default transition
export const defaultTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number], // ease-out-quart
};

interface MotionWrapperProps extends Omit<MotionProps, "children"> {
  children: ReactNode;
  className?: string;
  /** Use a preset animation */
  preset?: "fadeIn" | "fadeInUp" | "fadeInDown" | "fadeInLeft" | "fadeInRight" | "scaleIn";
  /** Delay before animation starts (in seconds) */
  delay?: number;
  /** Animation duration (in seconds) */
  duration?: number;
  /** Whether to animate only once (when element enters viewport) */
  once?: boolean;
  /** The HTML element to render as */
  as?: "div" | "section" | "article" | "aside" | "main" | "header" | "footer" | "span";
}

const presets: Record<string, Variants> = {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
};

export const MotionWrapper = forwardRef<HTMLDivElement, MotionWrapperProps>(
  function MotionWrapper(
    {
      children,
      className,
      preset,
      delay = 0,
      duration = 0.3,
      once = true,
      as = "div",
      initial,
      animate,
      variants,
      transition,
      whileInView,
      viewport,
      ...props
    },
    ref
  ) {
    const prefersReducedMotion = useReducedMotion();

    // If user prefers reduced motion, render without animations
    if (prefersReducedMotion) {
      const Component = as;
      return (
        <Component ref={ref} className={className}>
          {children}
        </Component>
      );
    }

    // Use preset variants if specified
    const resolvedVariants = preset ? presets[preset] : variants;
    const resolvedInitial = preset ? "hidden" : initial;
    const resolvedAnimate = preset ? "visible" : animate;

    // Build transition with delay and duration
    const resolvedTransition = {
      ...defaultTransition,
      ...transition,
      duration,
      delay,
    };

    const MotionComponent = motion[as];

    // Use whileInView for viewport-triggered animations
    if (whileInView || preset) {
      const whileInViewValue = whileInView ?? resolvedAnimate;
      return (
        <MotionComponent
          ref={ref}
          className={className}
          initial={resolvedInitial}
          whileInView={whileInViewValue as string | string[]}
          viewport={{ once, margin: "-100px", ...viewport }}
          variants={resolvedVariants}
          transition={resolvedTransition}
          {...props}
        >
          {children}
        </MotionComponent>
      );
    }

    return (
      <MotionComponent
        ref={ref}
        className={className}
        initial={initial}
        animate={animate}
        variants={variants}
        transition={resolvedTransition}
        {...props}
      >
        {children}
      </MotionComponent>
    );
  }
);

/**
 * Stagger container for animating lists of items
 */
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  as?: "div" | "ul" | "ol" | "section";
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  as = "div",
}: StaggerContainerProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionComponent = motion[as];

  if (prefersReducedMotion) {
    const Component = as;
    return <Component className={className}>{children}</Component>;
  }

  return (
    <MotionComponent
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </MotionComponent>
  );
}

/**
 * Stagger item to be used inside StaggerContainer
 */
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}

export function StaggerItem({ children, className, as = "div" }: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionComponent = motion[as];

  if (prefersReducedMotion) {
    const Component = as;
    return <Component className={className}>{children}</Component>;
  }

  return (
    <MotionComponent className={className} variants={fadeInUp}>
      {children}
    </MotionComponent>
  );
}

export default MotionWrapper;
