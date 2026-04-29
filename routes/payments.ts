import { Router } from "express";
import { db } from "@workspace/db";
import { paymentsTable, ordersTable, businessesTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { CreatePaymentLinkBody } from "@workspace/api-zod";
import { createRazorpayPaymentLink } from "../services/razorpay";

const router = Router();

// POST /api/payments/create-link
router.post("/create-link", requireAuth, async (req, res) => {
  const parsed = CreatePaymentLinkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Bad Request", message: "Invalid request body" });
    return;
  }

  const { orderId, amount, customerPhone, customerName, description } = parsed.data;
  const businessId = req.user!.businessId;

  const businesses = await db
    .select()
    .from(businessesTable)
    .where(eq(businessesTable.id, businessId))
    .limit(1);

  const business = businesses[0];

  let paymentLinkUrl: string;
  let razorpayPaymentLinkId: string | undefined;
  let expiresAt: Date | undefined;

  if (business?.razorpayKeyId && business?.razorpayKeySecret) {
    const link = await createRazorpayPaymentLink(
      { keyId: business.razorpayKeyId, keySecret: business.razorpayKeySecret },
      { orderId, amount, customerPhone, customerName: customerName ?? undefined, description: description ?? undefined }
    );

    if (!link) {
      res.status(502).json({ error: "Payment gateway error" });
      return;
    }

    paymentLinkUrl = link.short_url;
    razorpayPaymentLinkId = link.id;
    if (link.expire_by) {
      expiresAt = new Date(link.expire_by * 1000);
    }
  } else {
    // Demo mode: generate a mock payment link
    razorpayPaymentLinkId = `demo_plink_${Date.now()}`;
    paymentLinkUrl = `https://rzp.io/demo/${razorpayPaymentLinkId}`;
    expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  const [payment] = await db
    .insert(paymentsTable)
    .values({
      businessId,
      orderId,
      razorpayPaymentLinkId,
      amount: amount.toFixed(2),
      currency: "INR",
      status: "created",
      customerPhone,
      customerName,
      description,
      paymentLinkUrl,
      expiresAt,
    })
    .returning();

  // Update order with payment link
  if (orderId) {
    await db
      .update(ordersTable)
      .set({ paymentLink: paymentLinkUrl, updatedAt: new Date() })
      .where(eq(ordersTable.id, orderId));
  }

  res.json({
    paymentLinkId: razorpayPaymentLinkId ?? "",
    paymentLinkUrl,
    amount,
    currency: "INR",
    status: "created",
    expiresAt: expiresAt?.toISOString(),
  });
});

// GET /api/payments
router.get("/", requireAuth, async (req, res) => {
  const businessId = req.user!.businessId;
  const page = parseInt((req.query["page"] as string) ?? "1");
  const limit = parseInt((req.query["limit"] as string) ?? "20");
  const status = req.query["status"] as string | undefined;
  const offset = (page - 1) * limit;

  const conditions = [eq(paymentsTable.businessId, businessId)];
  if (status) conditions.push(eq(paymentsTable.status, status));

  const where = and(...conditions);

  const [countResult, payments] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(paymentsTable).where(where),
    db
      .select()
      .from(paymentsTable)
      .where(where)
      .orderBy(desc(paymentsTable.createdAt))
      .limit(limit)
      .offset(offset),
  ]);

  res.json({
    payments: payments.map((p) => ({ ...p, amount: Number(p.amount) })),
    total: Number(countResult[0]?.count ?? 0),
    page,
    limit,
  });
});

export default router;
