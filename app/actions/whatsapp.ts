"use server";

import { db } from "@/lib/db";
import { isAdminOrManager } from "@/lib/auth";
import {
  normalizePhoneToE164,
  sendWhatsAppTemplateMessage,
  type WhatsAppTemplateComponent,
} from "@/lib/whatsapp";

export type SendWhatsAppTemplateActionInput = {
  portalUserId: string;
  templateName: string;
  languageCode?: string;
  components?: WhatsAppTemplateComponent[];
};

export type SendWhatsAppTemplateActionResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

function getLast10Digits(phoneNumber: string): string | null {
  const digits = phoneNumber.replace(/\D/g, "");
  if (digits.length < 10) {
    return null;
  }

  return digits.slice(-10);
}

export async function sendWhatsAppTemplateToUser(
  input: SendWhatsAppTemplateActionInput
): Promise<SendWhatsAppTemplateActionResult> {
  const isAdmin = await isAdminOrManager();
  if (!isAdmin) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  const targetUser = await db.portalUser.findUnique({
    where: { id: input.portalUserId },
    select: {
      id: true,
      phone: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!targetUser) {
    return {
      success: false,
      error: "Target user not found",
    };
  }

  if (!targetUser.phone) {
    return {
      success: false,
      error: "Target user does not have a phone number",
    };
  }

  const normalizedPhone = normalizePhoneToE164(targetUser.phone);
  const last10 = getLast10Digits(normalizedPhone);

  const existingContact =
    (await db.whatsappContact.findFirst({
      where: {
        OR: [{ portalUserId: targetUser.id }, { phone: normalizedPhone }],
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

  const contact = existingContact
    ? await db.whatsappContact.update({
        where: { id: existingContact.id },
        data: {
          portalUserId: targetUser.id,
          phone: normalizedPhone,
          displayName: `${targetUser.firstName} ${targetUser.lastName}`,
          optedIn: true,
          optedInAt: existingContact.optedInAt || new Date(),
        },
      })
    : await db.whatsappContact.create({
        data: {
          portalUserId: targetUser.id,
          phone: normalizedPhone,
          displayName: `${targetUser.firstName} ${targetUser.lastName}`,
          optedIn: true,
          optedInAt: new Date(),
        },
      });

  const sendResult = await sendWhatsAppTemplateMessage({
    to: normalizedPhone,
    templateName: input.templateName,
    languageCode: input.languageCode,
    components: input.components,
  });

  await db.whatsappMessage.create({
    data: {
      contactId: contact.id,
      portalUserId: targetUser.id,
      direction: "OUTBOUND_TEMPLATE",
      status: sendResult.success ? "SENT" : "FAILED",
      messageType: "template",
      templateName: input.templateName,
      metaMessageId: sendResult.messageId,
      toPhone: normalizedPhone,
      payload: {
        languageCode: input.languageCode || "en_US",
        components: input.components || [],
      },
      errorMessage: sendResult.error,
      sentAt: sendResult.success ? new Date() : null,
      failedAt: sendResult.success ? null : new Date(),
    },
  });

  return {
    success: sendResult.success,
    messageId: sendResult.messageId,
    error: sendResult.error,
  };
}
