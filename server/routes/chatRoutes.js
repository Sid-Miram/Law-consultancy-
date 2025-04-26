const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJwt.js");
const chatController = require("../controllers/chatController.js");

// Apply JWT verification to all chat routes
router.use(verifyJWT);

// Get all conversations for the current user
router.get("/conversations", chatController.getConversations);

// Get messages for a specific conversation
router.get("/messages/:conversationId", chatController.getMessages);

// Create a new conversation
router.post("/conversations", chatController.createConversation);

// Create a new message
router.post("/messages", chatController.createMessage);

// Mark messages as read
router.put("/messages/read/:conversationId", chatController.markMessagesAsRead);


module.exports = router; 