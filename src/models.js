import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerId: String,
  customerName: String,
  customerPhone: String,
  items: [String],
  totalPrice: Number,
  status: { type: String, default: "PENDING" },
  paymentLink: String,
  paymentId: String,
  paymentStatus: { type: String, default: "NOT_SENT" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  customerId: String,
  customerName: String,
  customerPhone: String,
  senderType: { type: String, enum: ["CUSTOMER", "BOT"], default: "CUSTOMER" },
  text: String,
  language: { type: String, default: "ENGLISH" },
  intent: String,
  createdAt: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  customerId: String,
  customerName: String,
  customerPhone: String,
  lastMessage: String,
  lastMessageTime: { type: Date, default: Date.now },
  status: { type: String, default: "ACTIVE" },
  createdAt: { type: Date, default: Date.now }
});

export const Order = mongoose.model("Order", orderSchema);
export const Message = mongoose.model("Message", messageSchema);
export const Conversation = mongoose.model("Conversation", conversationSchema);
