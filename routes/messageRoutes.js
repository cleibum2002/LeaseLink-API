const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");  // ✅ Require authentication

router.post("/", authMiddleware.verifyToken, messageController.sendMessage);  // ✅ Send message
router.get("/:otherUserId", authMiddleware.verifyToken, messageController.getMessages);  // ✅ Get messages

module.exports = router;
