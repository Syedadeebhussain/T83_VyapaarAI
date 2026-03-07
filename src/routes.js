import express from "express";
import {
  whatsappWebhook,
  getOrders,
  getOrderById,
  getConversations,
  getConversation,
  getMessages,
  getCustomerMessages,
  getDashboardStats,
  updateOrderStatus
} from "./controllers.js";

const router = express.Router();

// ========== WhatsApp Webhook ==========
router.post("/webhook/whatsapp", whatsappWebhook);

// ========== Orders API ==========
router.get("/orders", getOrders);
router.get("/orders/:orderId", getOrderById);
router.patch("/orders/:orderId", updateOrderStatus);

// ========== Conversations API ==========
router.get("/conversations", getConversations);
router.get("/conversations/:customerId", getConversation);

// ========== Messages API ==========
router.get("/messages", getMessages);
router.get("/messages/:customerId", getCustomerMessages);

// ========== Dashboard API ==========
router.get("/dashboard/stats", getDashboardStats);

export default router;
