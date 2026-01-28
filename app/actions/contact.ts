/**
 * Contact Form Server Action
 * 
 * Handles contact form submissions with validation,
 * rate limiting, and database persistence.
 */

"use server";

import { db } from "@/lib/db";
import { headers } from "next/headers";
import { z } from "zod";

export type ContactFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

// Validation schema matching the form fields
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  service: z.string().optional(),
  urgency: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  preferredContact: z.enum(["email", "phone"]).default("email"),
});

// Simple in-memory rate limiting (resets on server restart)
// For production, use Redis/Upstash
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // requests
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT) {
    return true; // Rate limited
  }

  record.count++;
  return false;
}

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  try {
    // Get client IP for rate limiting
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

    // Check rate limit
    if (checkRateLimit(ip)) {
      return {
        success: false,
        message: "Too many requests. Please try again in a minute.",
      };
    }

    // Honeypot check (hidden field that bots fill out)
    const honeypot = formData.get("website");
    if (honeypot) {
      // Silently reject but pretend success to confuse bots
      return {
        success: true,
        message: "Thank you for your message!",
      };
    }

    // Extract form data
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") || undefined,
      service: formData.get("service") || undefined,
      urgency: formData.get("urgency") || undefined,
      message: formData.get("message"),
      preferredContact: formData.get("preferredContact") || "email",
    };

    // Validate with Zod
    const result = contactFormSchema.safeParse(rawData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please fix the errors below.",
        errors: fieldErrors as Record<string, string[]>,
      };
    }

    // Save to database
    await db.contactSubmission.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone ?? null,
        service: result.data.service ?? null,
        urgency: result.data.urgency ?? null,
        preferredContact: result.data.preferredContact,
        message: result.data.message,
        source: formData.get("source")?.toString() ?? "contact-page",
      },
    });

    // TODO: Send confirmation email (Phase 3)
    // await sendContactConfirmationEmail(result.data.email, result.data.name);

    // TODO: Send admin notification (Phase 3)
    // await sendAdminNotification('contact', result.data);

    return {
      success: true,
      message:
        "Thank you for reaching out! We'll get back to you within 24 hours.",
    };
  } catch (error) {
    console.error("Contact form error:", error);
    return {
      success: false,
      message:
        "Something went wrong. Please try again or call us at (978) 856-9358.",
    };
  }
}
