import { Router } from "express";
import { db } from "@workspace/db";
import { messagesTable, businessesTable } from "@workspace/db";
import { eq, desc, sql, and, ilike, or } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { SendMessageBody } from "@workspace/api-zod";
import { sendWhatsAppMessage } from "../services/whatsapp";

const router = Router();

// GET /api/chats
router.get("/", requireAuth, async (req, res) => {
  const businessId = req.user!.businessId;
  const page = parseInt((req.query["page"] as string) ?? "1");
  const limit = parseInt((req.query["limit"] as string) ?? "20");
  const search = req.query["search"] as string | undefined;
  const offset = (page - 1) * limit;

  // Get latest message per customer
  const latestMessages = await db
    .selectDistinctOn([messagesTable.customerPhone], {
      customerPhone: messagesTable.customerPhone,
      customerName: messagesTable.customerName,
      content: messagesTable.content,
      createdAt: messagesTable.createdAt,
      intent: messagesTable.intent,
      language: messagesTable.language,
      isRead: messagesTable.isRead,
    })
    .from(messagesTable)
    .where(
      and(
        eq(messagesTable.businessId, businessId),
        search
          ? or(
              ilike(messagesTable.customerPhone, `%${search}%`),
              ilike(messagesTable.customerName, `%${search}%`),
              ilike(messagesTable.content, `%${search}%`)
            )
          : undefined
      )
    )
    .orderBy(messagesTable.customerPhone, desc(messagesTable.createdAt));

  const total = latestMessages.length;
  const paged = latestMessages.slice(offset, offset + limit);

  // Get unread counts per customer
  const unreadCountsResult = await db
    .select({
      customerPhone: messagesTable.customerPhone,
      unreadCount: sql<number>`count(*)`,
    })
    .from(messagesTable)
    .where(
      and(
        eq(messagesTable.businessId, businessId),
        eq(messagesTable.isRead, false),
        eq(messagesTable.direction, "inbound")
      )
    )
    .groupBy(messagesTable.customerPhone);

  const unreadMap = new Map(
    unreadCountsResult.map((r) => [r.customerPhone, Number(r.unreadCount)])
  );

  const chats = paged.map((m) => ({
    customerPhone: m.customerPhone,
    customerName: m.customerName,
    lastMessage: m.content,
    lastMessageAt: m.createdAt,
    unreadCount: unreadMap.get(m.customerPhone) ?? 0,
    intent: m.intent,
    language: m.language,
  }));

  res.json({ chats, total, page, limit });
});

// GET /api/chats/recent  — MUST be before /:phone to avoid being matched as a phone param
router.get("/recent", requireAuth, async (req, res) => {
  const businessId = req.user!.businessId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allTodayMessages = await db
    .select()
    .from(messagesTable)
    .where(
      and(
        eq(messagesTable.businessId, businessId),
        sql`${messagesTable.createdAt} >= ${today}`
      )
    );

  const intentBreakdown: Record<string, number> = {};
  const languageBreakdown: Record<string, number> = {};
  let spamCount = 0;

  for (const m of allTodayMessages) {
    intentBreakdown[m.intent] = (intentBreakdown[m.intent] ?? 0) + 1;
    languageBreakdown[m.language] = (languageBreakdown[m.language] ?? 0) + 1;
    if (m.isSpam) spamCount++;
  }

  const recentMessages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.businessId, businessId))
    .orderBy(desc(messagesTable.createdAt))
    .limit(10);

  res.json({
    totalToday: allTodayMessages.length,
    intentBreakdown,
    languageBreakdown,
    spamCount,
    recentMessages,
  });
});

// POST /api/chats/send — MUST be before /:phone
router.post("/send", requireAuth, async (req, res) => {
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Bad Request" });
    return;
  }

  const { customerPhone, message } = parsed.data;
  const businessId = req.user!.businessId;

  // Store message in DB
  const [msg] = await db
    .insert(messagesTable)
    .values({
      businessId,
      customerPhone,
      direction: "outbound",
      content: message,
      messageType: "text",
      intent: "unknown",
      language: "english",
      isSpam: false,
    })
    .returning();

  // Try to send via WhatsApp API if configured
  const businesses = await db
    .select()
    .from(businessesTable)
    .where(eq(businessesTable.id, businessId))
    .limit(1);

  const business = businesses[0];
  if (business?.whatsappPhoneNumberId && business?.whatsappAccessToken) {
    await sendWhatsAppMessage(
      {
        phoneNumberId: business.whatsappPhoneNumberId,
        accessToken: business.whatsappAccessToken,
      },
      { to: customerPhone, message }
    );
  }

  res.json(msg);
});

// GET /api/chats/:phone — parameterized route must come last
router.get("/:phone", requireAuth, async (req, res) => {
  const businessId = req.user!.businessId;
  const phone = req.params["phone"] ?? "";
  const limit = parseInt((req.query["limit"] as string) ?? "50");

  const messages = await db
    .select()
    .from(messagesTable)
    .where(
      and(
        eq(messagesTable.businessId, businessId),
        eq(messagesTable.customerPhone, phone)
      )
    )
    .orderBy(desc(messagesTable.createdAt))
    .limit(limit);

  // Mark as read
  await db
    .update(messagesTable)
    .set({ isRead: true })
    .where(
      and(
        eq(messagesTable.businessId, businessId),
        eq(messagesTable.customerPhone, phone),
        eq(messagesTable.isRead, false)
      )
    );

  res.json(messages.reverse());
});

export default router;
