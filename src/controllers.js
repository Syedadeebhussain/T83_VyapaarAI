import { Order, Message, Conversation } from "./models.js";
import { detectLanguage, detectIntent, generateReply } from "./language.js";
import { sendWhatsAppMessage } from "./whatsapp.js";
import { generatePaymentLink, sendPaymentLink } from "./payment.js";

// WhatsApp webhook endpoint - handles incoming messages
export const whatsappWebhook = async (req, res) => {
  try {
    const { senderId, senderName, message } = req.body;
    console.log("Webhook - Received:", { senderId, senderName, message });

    if (!senderId || !message) {
      return res.status(400).json({ error: "Missing senderId or message" });
    }

    const language = detectLanguage(message);
    const intent = detectIntent(message, language);
    const reply = generateReply(intent, language);

    console.log("Webhook - Processing:", { language, intent });

    // Save messages to DB
    try {
      await Message.create({
        customerId: senderId,
        customerName: senderName || "Unknown",
        customerPhone: senderId,
        senderType: "CUSTOMER",
        text: message,
        language,
        intent
      });

      await Message.create({
        customerId: senderId,
        customerName: "VyapaarAI Bot",
        customerPhone: senderId,
        senderType: "BOT",
        text: reply,
        language,
        intent
      });

      console.log("Webhook - Messages saved");
    } catch (dbErr) {
      console.error("DB Error saving messages:", dbErr.message);
    }

    // Update conversation
    try {
      let conversation = await Conversation.findOne({ customerId: senderId });
      if (!conversation) {
        conversation = await Conversation.create({
          customerId: senderId,
          customerName: senderName || "Unknown",
          customerPhone: senderId,
          lastMessage: message,
          lastMessageTime: new Date()
        });
      } else {
        conversation.lastMessage = message;
        conversation.lastMessageTime = new Date();
        await conversation.save();
      }
      console.log("Webhook - Conversation updated");
    } catch (convErr) {
      console.error("Conversation Error:", convErr.message);
    }

    // Handle order creation
    if (intent === "PLACE_ORDER") {
      try {
        const order = await Order.create({
          customerId: senderId,
          customerName: senderName || "Unknown",
          customerPhone: senderId,
          items: ["Product"],
          totalPrice: 499,
          status: "PENDING"
        });

        const { paymentId, paymentLink } = generatePaymentLink(order._id, 499, senderId);
        
        await Order.findByIdAndUpdate(order._id, {
          paymentLink,
          paymentId,
          paymentStatus: "NOT_SENT"
        });

        await sendPaymentLink(senderId, paymentLink, 499);

        console.log("Webhook - Order created:", order._id);

        return res.json({
          status: "ok",
          reply,
          orderId: order._id,
          paymentLink
        });
      } catch (orderErr) {
        console.error("Order Error:", orderErr.message);
        return res.status(500).json({ error: "Order creation failed" });
      }
    }

    // Send WhatsApp message
    await sendWhatsAppMessage(senderId, reply);

    res.json({
      status: "ok",
      intent,
      language,
      reply
    });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

// Get all orders (for dashboard)
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({
      total: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all conversations (for dashboard)
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find().sort({ lastMessageTime: -1 });
    res.json({
      total: conversations.length,
      conversations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get conversation by customer ID
export const getConversation = async (req, res) => {
  try {
    const { customerId } = req.params;
    const conversation = await Conversation.findOne({ customerId });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all messages (for dashboard)
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json({
      total: messages.length,
      messages
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get messages by customer ID
export const getCustomerMessages = async (req, res) => {
  try {
    const { customerId } = req.params;
    const messages = await Message.find({ customerId }).sort({ createdAt: 1 });

    res.json({
      customerId,
      total: messages.length,
      messages
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalConversations = await Conversation.countDocuments();
    const totalMessages = await Message.countDocuments();
    
    const pendingOrders = await Order.countDocuments({ status: "PENDING" });
    const paidOrders = await Order.countDocuments({ paymentStatus: "PAID" });
    
    const todayOrders = await Order.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    res.json({
      stats: {
        totalOrders,
        totalConversations,
        totalMessages,
        pendingOrders,
        paidOrders,
        todayOrders
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

