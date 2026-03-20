/**
 * ChatWidget - Lazy-loaded floating contact/help widget
 * 
 * A modern chat-style widget for quick contact options.
 * Loads after user interaction or idle time for better performance.
 * 
 * Can be upgraded to AI chat by swapping the content component.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconMessageCircle,
  IconX,
  IconPhone,
  IconMail,
  IconCalendar,
  IconClock,
  IconChevronRight,
  IconSend,
  IconBook,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import { siteMetadata } from "@/lib/seo/site-metadata";
import Link from "next/link";
import { submitChatMessage } from "@/app/actions/chat-widget";

// Types
interface HelpLink {
  label: string;
  href: string;
}

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  href?: string;
  onClick?: () => void;
}

interface ChatWidgetProps {
  /** Delay before showing widget (ms) */
  showDelay?: number;
  /** Position on screen */
  position?: "bottom-right" | "bottom-left";
  /** Custom greeting message */
  greeting?: string;
  /** Show widget immediately (skip delay) */
  immediate?: boolean;
  /** Contextual help links shown in the widget */
  helpLinks?: HelpLink[];
}

// Quick contact actions
const quickActions: QuickAction[] = [
  {
    id: "call",
    icon: <IconPhone className="size-5" />,
    label: "Call Us",
    description: "Speak with our care team",
    href: `tel:${siteMetadata.phone.primaryE164}`,
  },
  {
    id: "email",
    icon: <IconMail className="size-5" />,
    label: "Send Email",
    description: "We'll respond within 24 hours",
    href: `mailto:${siteMetadata.email}`,
  },
  {
    id: "schedule",
    icon: <IconCalendar className="size-5" />,
    label: "Schedule Consultation",
    description: "Book a free care assessment",
    href: "/contact",
  },
];

// Business hours display
function BusinessHours() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <IconClock className="size-3.5" />
      <span>Available 24/7 for care inquiries</span>
    </div>
  );
}

// Chat widget content
function ChatWidgetContent({ 
  onClose, 
  greeting,
  helpLinks,
}: { 
  onClose: () => void;
  greeting: string;
  helpLinks?: HelpLink[];
}) {
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSubmitMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    setError(null);

    const result = await submitChatMessage(message.trim());

    if (result.success) {
      setSubmitted(true);
      setTimeout(() => {
        setMessage("");
        setSubmitted(false);
        setShowMessageForm(false);
      }, 3000);
    } else {
      setError(result.error ?? "Failed to send");
    }

    setIsSending(false);
  }, [message, isSending]);

  return (
    <Card className="w-[calc(100vw-2rem)] sm:w-96 max-w-96 overflow-hidden shadow-2xl border-border/50 py-0 bg-blue-50/60 dark:bg-card">
      {/* Header */}
      <div className="bg-primary p-4 text-primary-foreground rounded-t-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border-2 border-primary-foreground/20">
              <AvatarImage src="/angel_pink.png" alt="Angel Touch" />
              <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-sm font-semibold">
                AT
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">Angel Touch Support</h3>
              <p className="text-xs text-primary-foreground/80">We&apos;re here to help</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={onClose}
            aria-label="Close chat"
          >
            <IconX className="size-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-72 overflow-y-auto">
        {/* Greeting message */}
        <div className="flex gap-3">
          <Avatar className="size-8 shrink-0">
            <AvatarImage src="/angel_pink.png" alt="Angel Touch" />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              AT
            </AvatarFallback>
          </Avatar>
          <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
            <p className="text-sm">{greeting}</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium px-1">Quick Actions</p>
          {quickActions.map((action) => (
            <a
              key={action.id}
              href={action.href}
              onClick={action.onClick}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl",
                "bg-card border border-border/50",
                "hover:bg-muted/50 hover:border-primary/30",
                "transition-all duration-200 group"
              )}
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{action.label}</p>
                <p className="text-xs text-muted-foreground truncate">{action.description}</p>
              </div>
              <IconChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </a>
          ))}
        </div>

        {/* Quick message form */}
        <div className="pt-2 border-t border-border/50">
          {/* Contextual help links */}
          {helpLinks && helpLinks.length > 0 && (
            <div className="mb-3 space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium px-1">Help Articles</p>
              {helpLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                  <IconBook className="size-4 shrink-0 text-primary/60" />
                  {link.label}
                </Link>
              ))}
              <Link
                href="/help"
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-primary transition-colors hover:bg-primary/5"
              >
                Browse all articles
                <IconChevronRight className="size-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Sticky message pill / form */}
      {!showMessageForm ? (
        <div className="border-t border-border/50 px-4 py-3">
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground"
            onClick={() => setShowMessageForm(true)}
          >
            <IconMessageCircle className="size-4 mr-2" />
            Send a quick message...
          </Button>
        </div>
      ) : (
        <div className="border-t border-border/50 p-4">
          <form onSubmit={handleSubmitMessage} className="space-y-2">
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                placeholder="Type your message..."
                className={cn(
                  "w-full min-h-20 p-3 text-sm rounded-xl resize-none",
                  "bg-muted/50 border border-border/50",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                )}
                autoFocus
              />
              <span className="absolute bottom-2 right-3 text-[10px] text-muted-foreground">
                {message.length}/500
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowMessageForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim() || submitted || isSending}
                className="flex-1"
              >
                {submitted ? (
                  "Message Sent!"
                ) : isSending ? (
                  "Sending..."
                ) : (
                  <>
                    <IconSend className="size-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </form>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 bg-muted/30 border-t border-border/50">
        <BusinessHours />
      </div>
    </Card>
  );
}

// Floating button
function ChatButton({ 
  onClick, 
  isOpen,
  hasNotification = false,
}: { 
  onClick: () => void;
  isOpen: boolean;
  hasNotification?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        "size-14 rounded-full shadow-lg",
        "bg-primary hover:bg-primary/90",
        "transition-all duration-300",
        !prefersReducedMotion && "hover:scale-110 active:scale-95"
      )}
      aria-label={isOpen ? "Close chat" : "Open chat"}
      aria-expanded={isOpen}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isOpen ? (
          <motion.div
            key="close"
            initial={prefersReducedMotion ? {} : { rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={prefersReducedMotion ? {} : { rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <IconX className="size-6" />
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={prefersReducedMotion ? {} : { rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={prefersReducedMotion ? {} : { rotate: -90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <IconMessageCircle className="size-6" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Notification dot */}
      {hasNotification && !isOpen && (
        <span className="absolute -top-1 -right-1 size-4 bg-red-500 rounded-full border-2 border-background" />
      )}
    </Button>
  );
}

// Main widget component
export function ChatWidget({
  showDelay = 5000,
  position = "bottom-right",
  greeting = "Hi there! 👋 How can we help you today? Whether you need information about our care services or want to schedule a consultation, we're here for you.",
  immediate = false,
  helpLinks,
}: ChatWidgetProps) {
  const [isVisible, setIsVisible] = useState(immediate);
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Show widget after delay or user interaction
  useEffect(() => {
    if (immediate) return;

    let hasInteracted = false;

    const handleInteraction = () => {
      if (!hasInteracted) {
        hasInteracted = true;
        setIsVisible(true);
      }
    };

    // Show after delay
    const timer = setTimeout(() => setIsVisible(true), showDelay);

    // Or show on scroll/click
    window.addEventListener("scroll", handleInteraction, { once: true, passive: true });
    window.addEventListener("click", handleInteraction, { once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("click", handleInteraction);
    };
  }, [showDelay, immediate]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  if (!isVisible) return null;

  const positionClasses = position === "bottom-right" 
    ? "right-4 sm:right-6" 
    : "left-4 sm:left-6";

  return (
    <>
      {/* Backdrop blur overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div 
        className={cn(
          "fixed bottom-4 sm:bottom-6 z-50",
          positionClasses
        )}
      >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 origin-bottom-right"
          >
            <ChatWidgetContent onClose={handleClose} greeting={greeting} helpLinks={helpLinks} />
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.1 
        }}
        className="flex justify-end"
      >
        <ChatButton onClick={toggleOpen} isOpen={isOpen} />
      </motion.div>
    </div>
    </>
  );
}

export default ChatWidget;
