const { processMessage } = require("../services/chatbotService");

exports.handleMessage = (req, res) => {
  const { message } = req.body;

  const intent = processMessage(message);

  res.json({
    message,
    intent,
    reply: "Hello from AI 🤖",
  });
};
