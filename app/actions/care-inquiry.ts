/**
 * Care Inquiry Server Action
 * 
 * Handles care service inquiry submissions.
 */

"use server";

import { db } from "@/lib/db";
import { headers } from "next/headers";
import { z } from "zod";

export type CareInquiryFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

// Validation schema
const careInquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  serviceType: z.string().min(1, "Please select a service type"),
  careRecipient: z.string().optional(),
  startDate: z.string().optional().transform((s) => s ? new Date(s) : null),
  hoursNeeded: z.coerce.number().optional(),
  message: z.string().max(2000).optional(),
});

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  const LIMIT = 5;
  const WINDOW = 60 * 1000; // 1 minute

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW });
    return false;
  }

  if (record.count >= LIMIT) return true;
  record.count++;
  return false;
}

export async function submitCareInquiry(
  prevState: CareInquiryFormState,
  formData: FormData
): Promise<CareInquiryFormState> {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

    if (checkRateLimit(ip)) {
      return {
        success: false,
        message: "Too many requests. Please try again in a minute.",
      };
    }

    // Honeypot
    if (formData.get("website")) {
      return { success: true, message: "Thank you!" };
    }

    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      serviceType: formData.get("serviceType"),
      careRecipient: formData.get("careRecipient") || undefined,
      startDate: formData.get("startDate") || undefined,
      hoursNeeded: formData.get("hoursNeeded") || undefined,
      message: formData.get("message") || undefined,
    };

    const result = careInquirySchema.safeParse(rawData);

    if (!result.success) {
      return {
        success: false,
        message: "Please fix the errors below.",
        errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    await db.serviceInquiry.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone,
        serviceType: result.data.serviceType,
        careRecipient: result.data.careRecipient ?? null,
        startDate: result.data.startDate,
        hoursNeeded: result.data.hoursNeeded ?? null,
        message: result.data.message ?? null,
      },
    });

    // TODO: Send confirmation email (Phase 3)
    // TODO: Send admin notification (Phase 3)

    return {
      success: true,
      message: "Thank you for your inquiry! Our care coordinator will contact you within 24 hours to discuss your needs.",
    };
  } catch (error) {
    console.error("Care inquiry error:", error);
    return {
      success: false,
      message: "Something went wrong. Please call us at (978) 856-9358.",
    };
  }
}
