import { createHmac, timingSafeEqual } from "node:crypto";

export type WhatsAppTemplateComponent = {
  type: string;
  parameters?: Array<Record<string, unknown>>;
  sub_type?: string;
  index?: number;
};

export type SendWhatsAppTemplateInput = {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: WhatsAppTemplateComponent[];
};

export type SendWhatsAppTemplateResult = {
  success: boolean;
  messageId?: string;
  error?: string;
  statusCode?: number;
};

type MetaMessageResponse = {
  messages?: Array<{ id?: string }>;
  error?: { message?: string };
};

export function normalizePhoneToE164(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  if (value.startsWith("+") && digits.length > 0) {
    return `+${digits}`;
  }

  return `+${digits}`;
}

export function toWhatsAppRecipientId(phoneNumber: string): string {
  return normalizePhoneToE164(phoneNumber).replace(/^\+/, "");
}

export function isWhatsAppConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

export function verifyMetaWebhookSignature(payload: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret || !signatureHeader) {
    return false;
  }

  const expected = `sha256=${createHmac("sha256", appSecret).update(payload).digest("hex")}`;
  const expectedBuffer = Buffer.from(expected, "utf8");
  const actualBuffer = Buffer.from(signatureHeader, "utf8");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

export async function sendWhatsAppTemplateMessage(
  input: SendWhatsAppTemplateInput
): Promise<SendWhatsAppTemplateResult> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0";

  if (!accessToken || !phoneNumberId) {
    return {
      success: false,
      error: "WhatsApp Cloud API is not configured",
    };
  }

  const response = await fetch(
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: toWhatsAppRecipientId(input.to),
        type: "template",
        template: {
          name: input.templateName,
          language: {
            code: input.languageCode || "en_US",
          },
          ...(input.components && input.components.length > 0
            ? { components: input.components }
            : {}),
        },
      }),
    }
  );

  const data = (await response.json()) as MetaMessageResponse;

  if (!response.ok) {
    return {
      success: false,
      error: data.error?.message || "Failed to send WhatsApp template message",
      statusCode: response.status,
    };
  }

  return {
    success: true,
    messageId: data.messages?.[0]?.id,
    statusCode: response.status,
  };
}
