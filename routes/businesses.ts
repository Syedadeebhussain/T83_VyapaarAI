import { Router } from "express";
import { db } from "@workspace/db";
import { businessesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { UpdateBusinessBody } from "@workspace/api-zod";

const router = Router();

// GET /api/businesses
router.get("/", requireAuth, async (req, res) => {
  const businesses = await db.select().from(businessesTable);
  res.json(
    businesses.map((b) => ({
      id: b.id,
      name: b.name,
      phone: b.phone,
      email: b.email,
      category: b.category,
      address: b.address,
      whatsappPhoneNumberId: b.whatsappPhoneNumberId,
      isActive: b.isActive,
      createdAt: b.createdAt,
    }))
  );
});

// GET /api/businesses/:id
router.get("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] ?? "0");
  const businesses = await db
    .select()
    .from(businessesTable)
    .where(eq(businessesTable.id, id))
    .limit(1);

  const business = businesses[0];
  if (!business) {
    res.status(404).json({ error: "Not Found" });
    return;
  }

  res.json({
    id: business.id,
    name: business.name,
    phone: business.phone,
    email: business.email,
    category: business.category,
    address: business.address,
    whatsappPhoneNumberId: business.whatsappPhoneNumberId,
    isActive: business.isActive,
    createdAt: business.createdAt,
  });
});

// PUT /api/businesses/:id
router.put("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] ?? "0");
  if (req.user!.businessId !== id && req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const parsed = UpdateBusinessBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Bad Request" });
    return;
  }

  const { whatsappAccessToken, ...publicFields } = parsed.data;
  const updateData: Record<string, unknown> = { ...publicFields, updatedAt: new Date() };
  if (whatsappAccessToken !== undefined) {
    updateData["whatsappAccessToken"] = whatsappAccessToken;
  }

  const [updated] = await db
    .update(businessesTable)
    .set(updateData)
    .where(eq(businessesTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Not Found" });
    return;
  }

  res.json({
    id: updated.id,
    name: updated.name,
    phone: updated.phone,
    email: updated.email,
    category: updated.category,
    address: updated.address,
    whatsappPhoneNumberId: updated.whatsappPhoneNumberId,
    isActive: updated.isActive,
    createdAt: updated.createdAt,
  });
});

export default router;
