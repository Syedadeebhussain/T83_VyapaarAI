import { logger } from "../lib/logger";

interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
}

interface SendTextOptions {
  to: string;
  message: string;
}

export async function sendWhatsAppMessage(
  config: WhatsAppConfig,
  options: SendTextOptions
): Promise<boolean> {
  const { phoneNumberId, accessToken } = config;
  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: options.to.replace(/[^0-9]/g, ""),
    type: "text",
    text: { body: options.message },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      logger.error({ status: res.status, errData }, "Failed to send WhatsApp message");
      return false;
    }

    return true;
  } catch (err) {
    logger.error({ err }, "Error sending WhatsApp message");
    return false;
  }
}

export function parseWhatsAppWebhook(body: unknown): {
  phone: string;
  name: string | undefined;
  text: string;
  messageId: string;
} | null {
  try {
    const payload = body as Record<string, unknown>;
    const entry = (payload.entry as unknown[])?.[0] as Record<string, unknown>;
    const changes = (entry?.changes as unknown[])?.[0] as Record<string, unknown>;
    const value = changes?.value as Record<string, unknown>;
    const message = (value?.messages as unknown[])?.[0] as Record<string, unknown>;

    if (!message) return null;

    const phone = message.from as string;
    const messageId = message.id as string;
    const textObj = message.text as Record<string, string> | undefined;
    const text = textObj?.body ?? "";

    const contacts = value?.contacts as Array<{ profile?: { name?: string } }>;
    const name = contacts?.[0]?.profile?.name;

    return { phone, name, text, messageId };
  } catch {
    return null;
  }
}
