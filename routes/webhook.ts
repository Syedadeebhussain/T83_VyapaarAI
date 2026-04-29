import { Router } from "express";
import { db } from "@workspace/db";
import { messagesTable, businessesTable, chatbotConfigsTable, chatbotResponsesTable, ordersTable, paymentsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "../lib/logger";
import { processMessage } from "../services/nlp";
import { parseWhatsAppWebhook, sendWhatsAppMessage } from "../services/whatsapp";

const router = Router();

// GET /api/webhook/whatsapp - Webhook verification
router.get("/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe") {
    // In production, verify against business's stored token
    res.status(200).send(challenge);
    return;
  }

  res.status(403).json({ error: "Forbidden" });
});

// POST /api/webhook/whatsapp - Receive messages
router.post("/whatsapp", async (req, res) => {
  // Always respond 200 quickly
  res.status(200).json({ status: "ok" });

  try {
    const parsed = parseWhatsAppWebhook(req.body);
    if (!parsed) return;

    const { phone, name, text, messageId } = parsed;
    if (!text.trim()) return;

    // Find business by WhatsApp phone number ID from request
    const entry = (req.body as Record<string, unknown>).entry as Array<Record<string, unknown>>;
    const changes = entry?.[0]?.changes as Array<Record<string, unknown>>;
    const value = changes?.[0]?.value as Record<string, unknown>;
    const phoneNumberId = value?.metadata as { phone_number_id?: string };

    const businesses = await db.select().from(businessesTable).limit(50);
    let business = businesses.find(
      (b) => b.whatsappPhoneNumberId === phoneNumberId?.phone_number_id
    );

    // Fallback: use first active business
    if (!business) {
      business = businesses.find((b) => b.isActive) ?? businesses[0];
    }
    if (!business) return;

    // NLP processing
    const nlpResult = processMessage(text);

    // Store message
    await db.insert(messagesTable).values({
      businessId: business.id,
      customerPhone: phone,
      customerName: name,
      direction: "inbound",
      content: text,
      messageType: "text",
      intent: nlpResult.intent,
      language: nlpResult.language,
      isSpam: nlpResult.isSpam,
      entities: nlpResult.entities as Record<string, unknown>,
      whatsappMessageId: messageId,
    });

    if (nlpResult.isSpam) return;

    // Get chatbot config
    const configs = await db
      .select()
      .from(chatbotConfigsTable)
      .where(eq(chatbotConfigsTable.businessId, business.id))
      .limit(1);

    const config = configs[0];
    if (!config?.isEnabled) return;
    if (!business.whatsappPhoneNumberId || !business.whatsappAccessToken) return;

    // Look for custom response
    const customResponses = await db
      .select()
      .from(chatbotResponsesTable)
      .where(
        and(
          eq(chatbotResponsesTable.businessId, business.id),
          eq(chatbotResponsesTable.intent, nlpResult.intent),
          eq(chatbotResponsesTable.isActive, true)
        )
      );

    let replyText: string | null = null;

    // Find matching custom response
    const matchingResponse = customResponses.find((r) => {
      const lang = r.language;
      return lang === "all" || lang === nlpResult.language;
    });

    if (matchingResponse) {
      replyText = matchingResponse.responseText;
    } else {
      // Default responses by intent
      switch (nlpResult.intent) {
        case "greeting":
          replyText = config.greetingMessage;
          break;
        case "order":
          replyText = "Thank you for your order interest! Please share the product name and quantity, and we will process your order.";
          break;
        case "payment":
          replyText = "For payment related queries, please contact our team and we will send you a secure payment link.";
          break;
        case "complaint":
          replyText = "We apologize for the inconvenience. Our team will look into your complaint and get back to you shortly.";
          break;
        case "query":
          replyText = "Thank you for your query! Our team will respond with the information you need.";
          break;
        default:
          replyText = config.fallbackMessage;
      }
    }

    if (replyText) {
      // Store outbound reply
      await db.insert(messagesTable).values({
        businessId: business.id,
        customerPhone: phone,
        direction: "outbound",
        content: replyText,
        messageType: "text",
        intent: "unknown",
        language: "english",
        isSpam: false,
      });

      await sendWhatsAppMessage(
        {
          phoneNumberId: business.whatsappPhoneNumberId,
          accessToken: business.whatsappAccessToken,
        },
        { to: phone, message: replyText }
      );
    }
  } catch (err) {
    logger.error({ err }, "Error processing WhatsApp webhook");
  }
});

// POST /api/webhook/razorpay - Payment status updates
router.post("/razorpay", async (req, res) => {
  res.status(200).json({ status: "ok" });

  try {
    const event = req.body as Record<string, unknown>;
    const eventType = event["event"] as string;

    if (eventType === "payment_link.paid") {
      const payload = event["payload"] as Record<string, unknown>;
      const paymentLink = (payload?.["payment_link"] as Record<string, unknown>)?.entity as Record<string, unknown>;

      if (paymentLink?.id) {
        const pLinkId = paymentLink.id as string;

        await db
          .update(paymentsTable)
          .set({ status: "paid", updatedAt: new Date() })
          .where(eq(paymentsTable.razorpayPaymentLinkId, pLinkId));

        // Also update the related order
        const payments = await db
          .select()
          .from(paymentsTable)
          .where(eq(paymentsTable.razorpayPaymentLinkId, pLinkId))
          .limit(1);

        if (payments[0]?.orderId) {
          await db
            .update(ordersTable)
            .set({ paymentStatus: "paid", status: "confirmed", updatedAt: new Date() })
            .where(eq(ordersTable.id, payments[0].orderId));
        }
      }
    }
  } catch (err) {
    logger.error({ err }, "Error processing Razorpay webhook");
  }
});

export default router;
