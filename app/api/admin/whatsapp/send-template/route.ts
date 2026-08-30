import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { sendWhatsAppTemplateToUser } from "@/app/actions/whatsapp";
import { type WhatsAppTemplateComponent } from "@/lib/whatsapp";

type SendTemplateRequestBody = {
  portalUserId?: string;
  templateName?: string;
  languageCode?: string;
  components?: Array<Record<string, unknown>>;
};

function isTemplateComponent(value: Record<string, unknown>): value is WhatsAppTemplateComponent {
  return typeof value.type === "string";
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const caller = await db.portalUser.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!caller || (caller.role !== "ADMIN" && caller.role !== "MANAGER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as SendTemplateRequestBody;
  if (!body.portalUserId || !body.templateName) {
    return NextResponse.json(
      { error: "portalUserId and templateName are required" },
      { status: 400 }
    );
  }

  const components = body.components?.filter(isTemplateComponent);

  const result = await sendWhatsAppTemplateToUser({
    portalUserId: body.portalUserId,
    templateName: body.templateName,
    languageCode: body.languageCode,
    components,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error || "Failed to send message" }, { status: 400 });
  }

  return NextResponse.json(result);
}
