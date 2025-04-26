const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJwt.js");
const chatController = require("../controllers/chatController.js");

// Get all conversations for the current user
router.get("/conversations", verifyJWT, chatController.getConversations);

// Get messages for a specific conversation
router.get("/messages/:conversationId", verifyJWT, chatController.getMessages);

// Create a new conversation
router.post("/conversations", verifyJWT, chatController.createConversation);

// Create a new message
router.post("/messages", verifyJWT, chatController.createMessage);

// Mark messages as read
router.put("/messages/read/:conversationId", verifyJWT, chatController.markMessagesAsRead);

module.exports = router; 