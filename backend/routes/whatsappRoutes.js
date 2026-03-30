const express = require("express");
const router = express.Router();
const {
  handleWebhook,
  verifyWebhook,
} = require("../controllers/whatsappController");

router.get("/", verifyWebhook);
router.post("/", handleWebhook);

module.exports = router;
