import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { businessesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateToken, requireAuth } from "../middleware/auth";
import { LoginBody, RegisterBody } from "@workspace/api-zod";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Bad Request", message: "Invalid request body" });
    return;
  }

  const { email, password } = parsed.data;

  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  const user = users[0];
  if (!user) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
    return;
  }

  const businesses = await db
    .select()
    .from(businessesTable)
    .where(eq(businessesTable.id, user.businessId))
    .limit(1);

  const business = businesses[0];

  const token = generateToken({
    userId: user.id,
    businessId: user.businessId,
    email: user.email,
    role: user.role,
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
      businessName: business?.name ?? "",
      ownerName: user.ownerName,
    },
  });
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Bad Request", message: "Invalid request body" });
    return;
  }

  const { email, password, businessName, phone, ownerName } = parsed.data;

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existing.length > 0) {
    res.status(400).json({ error: "Bad Request", message: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [business] = await db
    .insert(businessesTable)
    .values({
      name: businessName,
      phone,
      email,
      ownerName,
      webhookVerifyToken: Math.random().toString(36).substring(2, 15),
    })
    .returning();

  if (!business) {
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }

  const { chatbotConfigsTable } = await import("@workspace/db");
  await db.insert(chatbotConfigsTable).values({ businessId: business.id });

  const [user] = await db
    .insert(usersTable)
    .values({
      businessId: business.id,
      email,
      passwordHash,
      role: "owner",
      ownerName,
    })
    .returning();

  if (!user) {
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }

  const token = generateToken({
    userId: user.id,
    businessId: business.id,
    email: user.email,
    role: user.role,
  });

  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      businessId: business.id,
      businessName: business.name,
      ownerName: user.ownerName,
    },
  });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  const user = req.user!;
  const businesses = await db
    .select()
    .from(businessesTable)
    .where(eq(businessesTable.id, user.businessId))
    .limit(1);
  const business = businesses[0];

  res.json({
    id: user.userId,
    email: user.email,
    role: user.role,
    businessId: user.businessId,
    businessName: business?.name ?? "",
    ownerName: business?.ownerName ?? "",
  });
});

export default router;
