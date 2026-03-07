export const detectIntent = (msg) => {
  msg = msg.toLowerCase();

  if (msg.includes("hi") || msg.includes("hello")) return "GREETING";
  if (msg.includes("price") || msg.includes("cost")) return "PRICE_ENQUIRY";
  if (msg.includes("buy") || msg.includes("order")) return "PLACE_ORDER";
  if (msg.includes("status")) return "ORDER_STATUS";

  return "UNKNOWN";
};

export const generateReply = (intent) => {
  if (intent === "GREETING") return "Hello 👋 Welcome to VyapaarAI. How can I help you?";
  if (intent === "PRICE_ENQUIRY") return "Our product price starts from ₹499. Would you like to place an order?";
  if (intent === "PLACE_ORDER") return "Great! Your order is created. Please complete payment using this link: https://pay.link/demo";
  if (intent === "ORDER_STATUS") return "Your order is being processed. You will be notified soon.";

  return "Sorry 😅 I didn't understand that. Can you please rephrase?";
};
