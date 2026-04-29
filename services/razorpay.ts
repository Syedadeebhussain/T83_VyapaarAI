import crypto from "crypto";
import { logger } from "../lib/logger";

interface RazorpayConfig {
  keyId: string;
  keySecret: string;
}

interface CreatePaymentLinkOptions {
  amount: number; // in rupees
  currency?: string;
  customerPhone: string;
  customerName?: string;
  description?: string;
  orderId?: number;
  callbackUrl?: string;
}

interface RazorpayPaymentLink {
  id: string;
  short_url: string;
  status: string;
  expire_by?: number;
}

export async function createRazorpayPaymentLink(
  config: RazorpayConfig,
  options: CreatePaymentLinkOptions
): Promise<RazorpayPaymentLink | null> {
  const { keyId, keySecret } = config;
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24 hours

  const body: Record<string, unknown> = {
    amount: Math.round(options.amount * 100), // convert to paise
    currency: options.currency ?? "INR",
    accept_partial: false,
    expire_by: expiresAt,
    description: options.description ?? `Order #${options.orderId ?? "N/A"}`,
    customer: {
      contact: options.customerPhone.replace(/[^0-9]/g, ""),
      name: options.customerName ?? "Customer",
    },
    notify: {
      sms: true,
      whatsapp: false,
    },
    reminder_enable: true,
  };

  if (options.callbackUrl) {
    body["callback_url"] = options.callbackUrl;
    body["callback_method"] = "get";
  }

  try {
    const res = await fetch("https://api.razorpay.com/v1/payment_links", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      logger.error({ status: res.status, err }, "Failed to create Razorpay payment link");
      return null;
    }

    const data = (await res.json()) as RazorpayPaymentLink;
    return data;
  } catch (err) {
    logger.error({ err }, "Error creating Razorpay payment link");
    return null;
  }
}

export function verifyRazorpaySignature(
  body: string,
  signature: string,
  webhookSecret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}
