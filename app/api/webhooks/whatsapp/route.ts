import { createHash } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";
import { type Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { normalizePhoneToE164, verifyMetaWebhookSignature } from "@/lib/whatsapp";

type WhatsAppWebhookPayload = {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      field?: string;
      value?: {
        contacts?: Array<{
          wa_id?: string;
          profile?: { name?: string };
        }>;
        messages?: Array<{
          id?: string;
          from?: string;
          timestamp?: string;
          type?: string;
          text?: { body?: string };
          [key: string]: unknown;
        }>;
        statuses?: Array<{
          id?: string;
          status?: string;
          recipient_id?: string;
          timestamp?: string;
          errors?: Array<{ title?: string; message?: string }>;
          [key: string]: unknown;
        }>;
      };
    }>;
  }>;
};

function getLast10Digits(phoneNumber: string): string | null {
  const digits = phoneNumber.replace(/\D/g, "");
  if (digits.length < 10) {
    return null;
  }

  return digits.slice(-10);
}

function toDate(timestamp: string | undefined): Date {
  if (!timestamp) {
    return new Date();
  }

  const parsed = Number.parseInt(timestamp, 10);
  if (Number.isNaN(parsed)) {
    return new Date();
  }

  return new Date(parsed * 1000);
}

function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function mapStatus(status: string | undefined):
  | "SENT"
  | "DELIVERED"
  | "READ"
  | "FAILED"
  | "RECEIVED" {
  if (status === "delivered") return "DELIVERED";
  if (status === "read") return "READ";
  if (status === "failed" || status === "undelivered") return "FAILED";
  if (status === "received") return "RECEIVED";
  return "SENT";
}

async function resolveContactByPhoneOrWaId(input: {
  waId?: string;
  phone?: string;
  displayName?: string;
}) {
  const normalizedPhone = input.phone ? normalizePhoneToE164(input.phone) : null;
  const last10 = normalizedPhone ? getLast10Digits(normalizedPhone) : null;

  const contact =
    (await db.whatsappContact.findFirst({
      where: {
        OR: [
          ...(input.waId ? [{ waId: input.waId }] : []),
          ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
        ],
      },
    })) ||
    (last10
      ? await db.whatsappContact.findFirst({
          where: {
            phone: {
              endsWith: last10,
            },
          },
        })
      : null);

  if (contact) {
    return db.whatsappContact.update({
      where: { id: contact.id },
      data: {
        ...(normalizedPhone ? { phone: normalizedPhone } : {}),
        ...(input.waId ? { waId: input.waId } : {}),
        ...(input.displayName ? { displayName: input.displayName } : {}),
      },
    });
  }

  let portalUserId: string | null = null;
  if (last10) {
    const matchedUser = await db.portalUser.findFirst({
      where: {
        phone: {
          endsWith: last10,
        },
      },
      select: {
        id: true,
      },
    });
    portalUserId = matchedUser?.id || null;
  }

  return db.whatsappContact.create({
    data: {
      portalUserId,
      phone: normalizedPhone || `+${input.waId || Date.now().toString()}`,
      waId: input.waId,
      displayName: input.displayName,
      optedIn: true,
      optedInAt: new Date(),
    },
  });
}

async function processInboundMessages(
  contacts: Array<{ wa_id?: string; profile?: { name?: string } }> | undefined,
  messages: Array<{
    id?: string;
    from?: string;
    timestamp?: string;
    type?: string;
    text?: { body?: string };
    [key: string]: unknown;
  }> | undefined
) {
  if (!messages || messages.length === 0) {
    return;
  }

  const contactsByWaId = new Map<string, string>();
  for (const item of contacts || []) {
    if (item.wa_id && item.profile?.name) {
      contactsByWaId.set(item.wa_id, item.profile.name);
    }
  }

  for (const message of messages) {
    if (!message.from) {
      continue;
    }

    const contact = await resolveContactByPhoneOrWaId({
      waId: message.from,
      phone: message.from,
      displayName: contactsByWaId.get(message.from),
    });

    const baseData = {
      contactId: contact.id,
      portalUserId: contact.portalUserId,
      direction: "INBOUND" as const,
      status: "RECEIVED" as const,
      messageType: message.type || "unknown",
      toPhone: contact.phone,
      fromPhone: normalizePhoneToE164(message.from),
      body: message.text?.body || null,
      payload: toPrismaJson(message),
      sentAt: toDate(message.timestamp),
    };

    if (message.id) {
      await db.whatsappMessage.upsert({
        where: { metaMessageId: message.id },
        create: {
          ...baseData,
          metaMessageId: message.id,
        },
        update: baseData,
      });
    } else {
      await db.whatsappMessage.create({
        data: baseData,
      });
    }
  }
}

async function processStatuses(
  statuses: Array<{
    id?: string;
    status?: string;
    recipient_id?: string;
    timestamp?: string;
    errors?: Array<{ title?: string; message?: string }>;
    [key: string]: unknown;
  }> | undefined
) {
  if (!statuses || statuses.length === 0) {
    return;
  }

  for (const statusItem of statuses) {
    if (!statusItem.id) {
      continue;
    }

    const mappedStatus = mapStatus(statusItem.status);
    const eventTime = toDate(statusItem.timestamp);
    const errorMessage = statusItem.errors?.[0]?.message || statusItem.errors?.[0]?.title || null;

    const existingMessage = await db.whatsappMessage.findUnique({
      where: { metaMessageId: statusItem.id },
    });

    if (existingMessage) {
      await db.whatsappMessage.update({
        where: { id: existingMessage.id },
        data: {
          status: mappedStatus,
          payload: toPrismaJson(statusItem),
          errorMessage,
          sentAt: mappedStatus === "SENT" ? eventTime : existingMessage.sentAt,
          deliveredAt: mappedStatus === "DELIVERED" ? eventTime : existingMessage.deliveredAt,
          readAt: mappedStatus === "READ" ? eventTime : existingMessage.readAt,
          failedAt: mappedStatus === "FAILED" ? eventTime : existingMessage.failedAt,
        },
      });
      continue;
    }

    const contact = await resolveContactByPhoneOrWaId({
      waId: statusItem.recipient_id,
      phone: statusItem.recipient_id,
    });

    await db.whatsappMessage.create({
      data: {
        contactId: contact.id,
        portalUserId: contact.portalUserId,
        direction: "OUTBOUND_TEMPLATE",
        status: mappedStatus,
        messageType: "template",
        metaMessageId: statusItem.id,
        toPhone: contact.phone,
        payload: toPrismaJson(statusItem),
        errorMessage,
        sentAt: mappedStatus === "SENT" ? eventTime : null,
        deliveredAt: mappedStatus === "DELIVERED" ? eventTime : null,
        readAt: mappedStatus === "READ" ? eventTime : null,
        failedAt: mappedStatus === "FAILED" ? eventTime : null,
      },
    });
  }
}

export async function GET(request: NextRequest) {
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode !== "subscribe" || !token || !challenge || !verifyToken) {
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  if (token !== verifyToken) {
    return NextResponse.json({ error: "Invalid verify token" }, { status: 403 });
  }

  return new NextResponse(challenge, { status: 200 });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyMetaWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WhatsAppWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const dedupeKey = createHash("sha256").update(rawBody).digest("hex");

  const existingEvent = await db.whatsappWebhookEvent.findUnique({
    where: { dedupeKey },
    select: { id: true },
  });

  if (existingEvent) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const webhookEvent = await db.whatsappWebhookEvent.create({
    data: {
      dedupeKey,
      eventType: payload.object || "whatsapp_webhook",
      payload: toPrismaJson(payload),
      status: "RECEIVED",
    },
  });

  try {
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;
        await processInboundMessages(value?.contacts, value?.messages);
        await processStatuses(value?.statuses);
      }
    }

    await db.whatsappWebhookEvent.update({
      where: { id: webhookEvent.id },
      data: {
        status: "PROCESSED",
        processedAt: new Date(),
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    await db.whatsappWebhookEvent.update({
      where: { id: webhookEvent.id },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
