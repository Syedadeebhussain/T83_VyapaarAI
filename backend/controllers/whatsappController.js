const { extractMessage } = require("../utils/whatsappHelper");
const { sendWhatsAppMessage } = require("../services/whatsappService");

exports.handleWebhook = async (req, res) => {
  const message = extractMessage(req.body);

  if (message) {
    const from = message.from;
    const text = message.text?.body || "";

    console.log("Incoming message:", text);

    // Simple reply logic (you can replace with AI later)
    let reply = "Hello 👋";

    if (text.toLowerCase().includes("price")) {
      reply = "Price is ₹50 per kg";
    }

    if (text.toLowerCase().includes("order")) {
      reply = "Your order is placed ✅";
    }

    await sendWhatsAppMessage(from, reply);
  }

  res.sendStatus(200);
};

// Webhook verification
exports.verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
};
