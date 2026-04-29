import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable } from "@workspace/db";
import { eq, desc, sql, and, ilike, or } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { CreateOrderBody, UpdateOrderBody } from "@workspace/api-zod";

const router = Router();

// GET /api/orders
router.get("/", requireAuth, async (req, res) => {
  const businessId = req.user!.businessId;
  const page = parseInt((req.query["page"] as string) ?? "1");
  const limit = parseInt((req.query["limit"] as string) ?? "20");
  const status = req.query["status"] as string | undefined;
  const search = req.query["search"] as string | undefined;
  const offset = (page - 1) * limit;

  const conditions = [eq(ordersTable.businessId, businessId)];
  if (status) conditions.push(eq(ordersTable.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(ordersTable.customerPhone, `%${search}%`),
        ilike(ordersTable.customerName, `%${search}%`)
      ) as ReturnType<typeof eq>
    );
  }

  const where = and(...conditions);

  const [countResult, orders] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(where),
    db
      .select()
      .from(ordersTable)
      .where(where)
      .orderBy(desc(ordersTable.createdAt))
      .limit(limit)
      .offset(offset),
  ]);

  res.json({
    orders: orders.map((o) => ({
      ...o,
      totalAmount: Number(o.totalAmount),
    })),
    total: Number(countResult[0]?.count ?? 0),
    page,
    limit,
  });
});

// POST /api/orders
router.post("/", requireAuth, async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Bad Request", message: "Invalid request body" });
    return;
  }

  const { customerPhone, customerName, items, notes } = parsed.data;
  const businessId = req.user!.businessId;

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [order] = await db
    .insert(ordersTable)
    .values({
      businessId,
      customerPhone,
      customerName,
      items: items as unknown as typeof ordersTable.$inferInsert["items"],
      totalAmount: totalAmount.toFixed(2),
      notes,
      status: "pending",
      paymentStatus: "unpaid",
    })
    .returning();

  res.status(201).json({ ...order, totalAmount: Number(order!.totalAmount) });
});

// GET /api/orders/:id
router.get("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] ?? "0");
  const businessId = req.user!.businessId;

  const orders = await db
    .select()
    .from(ordersTable)
    .where(and(eq(ordersTable.id, id), eq(ordersTable.businessId, businessId)))
    .limit(1);

  const order = orders[0];
  if (!order) {
    res.status(404).json({ error: "Not Found" });
    return;
  }

  res.json({ ...order, totalAmount: Number(order.totalAmount) });
});

// PUT /api/orders/:id
router.put("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] ?? "0");
  const businessId = req.user!.businessId;

  const parsed = UpdateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Bad Request" });
    return;
  }

  const [updated] = await db
    .update(ordersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(ordersTable.id, id), eq(ordersTable.businessId, businessId)))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Not Found" });
    return;
  }

  res.json({ ...updated, totalAmount: Number(updated.totalAmount) });
});

export default router;
