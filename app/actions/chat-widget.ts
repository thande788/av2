"use server";

import { db } from "@/lib/db";
import { notifyAdmin, formatContactForAdmin } from "@/lib/email";
import { headers } from "next/headers";
import { z } from "zod";

const chatMessageSchema = z.object({
  message: z.string().min(2, "Message is too short").max(2000),
});

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  const LIMIT = 5;
  const WINDOW = 60 * 1000;

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW });
    return false;
  }

  if (record.count >= LIMIT) return true;
  record.count++;
  return false;
}

export async function submitChatMessage(
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

    if (checkRateLimit(ip)) {
      return { success: false, error: "Too many messages. Please try again shortly." };
    }

    const parsed = chatMessageSchema.safeParse({ message });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid message" };
    }

    await db.contactSubmission.create({
      data: {
        name: "Chat Widget Visitor",
        email: "unknown@chat-widget",
        message: parsed.data.message,
        source: "chat-widget",
      },
    });

    // Notify admin of new chat message
    notifyAdmin(
      "New Chat Widget Message",
      formatContactForAdmin({
        name: "Chat Widget Visitor",
        email: "N/A",
        message: parsed.data.message,
      })
    ).catch((err) => console.error("Failed to send chat notification:", err));

    return { success: true };
  } catch (error) {
    console.error("Chat widget error:", error);
    return { success: false, error: "Failed to send message" };
  }
}
