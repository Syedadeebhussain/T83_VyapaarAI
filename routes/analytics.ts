import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, messagesTable, paymentsTable } from "@workspace/db";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /api/analytics/dashboard
router.get("/dashboard", requireAuth, async (req, res) => {
  const businessId = req.user!.businessId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalRevenueResult,
    todayRevenueResult,
    totalOrdersResult,
    todayOrdersResult,
    totalMessagesResult,
    todayMessagesResult,
    activeCustomersResult,
    pendingOrdersResult,
  ] = await Promise.all([
    db
      .select({ total: sql<number>`coalesce(sum(${paymentsTable.amount}), 0)` })
      .from(paymentsTable)
      .where(and(eq(paymentsTable.businessId, businessId), eq(paymentsTable.status, "paid"))),
    db
      .select({ total: sql<number>`coalesce(sum(${paymentsTable.amount}), 0)` })
      .from(paymentsTable)
      .where(
        and(
          eq(paymentsTable.businessId, businessId),
          eq(paymentsTable.status, "paid"),
          gte(paymentsTable.createdAt, today)
        )
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(ordersTable)
      .where(eq(ordersTable.businessId, businessId)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(ordersTable)
      .where(and(eq(ordersTable.businessId, businessId), gte(ordersTable.createdAt, today))),
    db
      .select({ count: sql<number>`count(*)` })
      .from(messagesTable)
      .where(and(eq(messagesTable.businessId, businessId), eq(messagesTable.direction, "inbound"))),
    db
      .select({ count: sql<number>`count(*)` })
      .from(messagesTable)
      .where(
        and(
          eq(messagesTable.businessId, businessId),
          eq(messagesTable.direction, "inbound"),
          gte(messagesTable.createdAt, today)
        )
      ),
    db
      .select({ count: sql<number>`count(distinct ${messagesTable.customerPhone})` })
      .from(messagesTable)
      .where(eq(messagesTable.businessId, businessId)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(ordersTable)
      .where(and(eq(ordersTable.businessId, businessId), eq(ordersTable.status, "pending"))),
  ]);

  const totalRevenue = Number(totalRevenueResult[0]?.total ?? 0);
  const totalOrders = Number(totalOrdersResult[0]?.count ?? 0);

  res.json({
    totalRevenue,
    revenueToday: Number(todayRevenueResult[0]?.total ?? 0),
    totalOrders,
    ordersToday: Number(todayOrdersResult[0]?.count ?? 0),
    totalMessages: Number(totalMessagesResult[0]?.count ?? 0),
    messagesToday: Number(todayMessagesResult[0]?.count ?? 0),
    activeCustomers: Number(activeCustomersResult[0]?.count ?? 0),
    pendingOrders: Number(pendingOrdersResult[0]?.count ?? 0),
    conversionRate: totalOrders > 0 ? Math.min(100, (Number(pendingOrdersResult[0]?.count ?? 0) / totalOrders) * 100) : 0,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
  });
});

// GET /api/analytics/revenue
router.get("/revenue", requireAuth, async (req, res) => {
  const businessId = req.user!.businessId;
  const days = parseInt((req.query["days"] as string) ?? "30");

  const result = await db.execute(sql`
    SELECT 
      DATE(created_at) as date,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as revenue,
      COUNT(*) as orders
    FROM payments
    WHERE business_id = ${businessId}
      AND created_at >= NOW() - INTERVAL '${sql.raw(String(days))} days'
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `);

  const rows = result.rows as Array<{ date: string; revenue: string; orders: string }>;
  res.json(rows.map((r) => ({ date: r.date, revenue: Number(r.revenue), orders: Number(r.orders) })));
});

// GET /api/analytics/top-products
router.get("/top-products", requireAuth, async (req, res) => {
  const businessId = req.user!.businessId;
  const limit = parseInt((req.query["limit"] as string) ?? "10");

  const result = await db.execute(sql`
    SELECT
      item->>'productName' as product_name,
      SUM((item->>'quantity')::int) as total_quantity,
      SUM((item->>'quantity')::int * (item->>'price')::numeric) as total_revenue,
      COUNT(DISTINCT o.id) as order_count
    FROM orders o,
    jsonb_array_elements(items) as item
    WHERE o.business_id = ${businessId}
      AND o.status != 'cancelled'
    GROUP BY item->>'productName'
    ORDER BY total_quantity DESC
    LIMIT ${limit}
  `);

  const rows = result.rows as Array<{
    product_name: string;
    total_quantity: string;
    total_revenue: string;
    order_count: string;
  }>;

  res.json(
    rows.map((r) => ({
      productName: r.product_name,
      totalQuantity: Number(r.total_quantity),
      totalRevenue: Number(r.total_revenue),
      orderCount: Number(r.order_count),
    }))
  );
});

// GET /api/analytics/customer-insights
router.get("/customer-insights", requireAuth, async (req, res) => {
  const businessId = req.user!.businessId;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [totalCustomers, newCustomers, avgMessages, langCounts] = await Promise.all([
    db
      .select({ count: sql<number>`count(distinct customer_phone)` })
      .from(messagesTable)
      .where(eq(messagesTable.businessId, businessId)),
    db
      .select({ count: sql<number>`count(distinct customer_phone)` })
      .from(messagesTable)
      .where(and(eq(messagesTable.businessId, businessId), gte(messagesTable.createdAt, monthStart))),
    db.execute(sql`
      SELECT COALESCE(AVG(msg_count), 0) as avg
      FROM (
        SELECT COUNT(*) as msg_count
        FROM messages
        WHERE business_id = ${businessId}
        GROUP BY customer_phone
      ) sub
    `),
    db
      .select({
        language: messagesTable.language,
        count: sql<number>`count(*)`,
      })
      .from(messagesTable)
      .where(eq(messagesTable.businessId, businessId))
      .groupBy(messagesTable.language)
      .orderBy(desc(sql`count(*)`)),
  ]);

  const total = Number(totalCustomers[0]?.count ?? 0);
  const newThisMonth = Number(newCustomers[0]?.count ?? 0);
  const avgRows = avgMessages.rows as Array<{ avg: string }>;
  const avgVal = Number(avgRows[0]?.avg ?? 0);

  res.json({
    totalCustomers: total,
    newCustomersThisMonth: newThisMonth,
    returningCustomers: Math.max(0, total - newThisMonth),
    avgMessagesPerCustomer: parseFloat(avgVal.toFixed(1)),
    topLanguages: langCounts.map((l) => ({ language: l.language, count: Number(l.count) })),
  });
});

// GET /api/analytics/intent-breakdown
router.get("/intent-breakdown", requireAuth, async (req, res) => {
  const businessId = req.user!.businessId;

  const results = await db
    .select({
      intent: messagesTable.intent,
      count: sql<number>`count(*)`,
    })
    .from(messagesTable)
    .where(and(eq(messagesTable.businessId, businessId), eq(messagesTable.direction, "inbound")))
    .groupBy(messagesTable.intent)
    .orderBy(desc(sql`count(*)`));

  const total = results.reduce((sum, r) => sum + Number(r.count), 0);

  res.json(
    results.map((r) => ({
      intent: r.intent,
      count: Number(r.count),
      percentage: total > 0 ? Math.round((Number(r.count) / total) * 100) : 0,
    }))
  );
});

export default router;
