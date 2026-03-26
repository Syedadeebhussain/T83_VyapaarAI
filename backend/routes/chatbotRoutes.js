const express = require("express");
const router = express.Router();
const { handleMessage } = require("../controllers/chatbotController");

router.post("/chat", handleMessage);

module.exports = router;
