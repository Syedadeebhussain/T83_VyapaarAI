import { Router } from "express";
import { db } from "@workspace/db";
import { chatbotConfigsTable, chatbotResponsesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { UpdateChatbotConfigBody, CreateChatbotResponseBody } from "@workspace/api-zod";

const router = Router();

// GET /api/chatbot/config
router.get("/config", requireAuth, async (req, res) => {
  const businessId = req.user!.businessId;

  const configs = await db
    .select()
    .from(chatbotConfigsTable)
    .where(eq(chatbotConfigsTable.businessId, businessId))
    .limit(1);

  let config = configs[0];
  if (!config) {
    const [created] = await db
      .insert(chatbotConfigsTable)
      .values({ businessId })
      .returning();
    config = created!;
  }

  res.json(config);
});

// PUT /api/chatbot/config
router.put("/config", requireAuth, async (req, res) => {
  const businessId = req.user!.businessId;
  const parsed = UpdateChatbotConfigBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Bad Request" });
    return;
  }

  const configs = await db
    .select()
    .from(chatbotConfigsTable)
    .where(eq(chatbotConfigsTable.businessId, businessId))
    .limit(1);

  let updated;
  if (configs.length === 0) {
    const [created] = await db
      .insert(chatbotConfigsTable)
      .values({ businessId, ...parsed.data })
      .returning();
    updated = created;
  } else {
    const [upd] = await db
      .update(chatbotConfigsTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(chatbotConfigsTable.businessId, businessId))
      .returning();
    updated = upd;
  }

  res.json(updated);
});

// GET /api/chatbot/responses
router.get("/responses", requireAuth, async (req, res) => {
  const businessId = req.user!.businessId;
  const responses = await db
    .select()
    .from(chatbotResponsesTable)
    .where(eq(chatbotResponsesTable.businessId, businessId));

  res.json(responses);
});

// POST /api/chatbot/responses
router.post("/responses", requireAuth, async (req, res) => {
  const businessId = req.user!.businessId;
  const parsed = CreateChatbotResponseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Bad Request" });
    return;
  }

  const [response] = await db
    .insert(chatbotResponsesTable)
    .values({ businessId, ...parsed.data })
    .returning();

  res.status(201).json(response);
});

// PUT /api/chatbot/responses/:id
router.put("/responses/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] ?? "0");
  const businessId = req.user!.businessId;
  const parsed = CreateChatbotResponseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Bad Request" });
    return;
  }

  const [updated] = await db
    .update(chatbotResponsesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(chatbotResponsesTable.id, id), eq(chatbotResponsesTable.businessId, businessId)))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Not Found" });
    return;
  }

  res.json(updated);
});

// DELETE /api/chatbot/responses/:id
router.delete("/responses/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] ?? "0");
  const businessId = req.user!.businessId;

  await db
    .delete(chatbotResponsesTable)
    .where(and(eq(chatbotResponsesTable.id, id), eq(chatbotResponsesTable.businessId, businessId)));

  res.json({ success: true, message: "Deleted" });
});

export default router;
