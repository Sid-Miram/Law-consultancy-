"use strict";

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes.js");
const http = require('http');
const { Server } = require('socket.io');
const socketService = require('./services/socketService');
require("dotenv").config();
const chatRoutes = require("./routes/chatRoutes.js");
const verifyJWT  = require('./middlewares/verifyJwt.js');
const User = require('./models/User');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

// CORS configuration
app.use(cors({
  origin: ['http://localhost:4500', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:4500'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// Initialize socket service
socketService(io);

//.env imports
const dbURI = process.env.dbURI;
const PORT = process.env.PORT || 3000;

// DB connection
async function dbConnection() {
  try {
    await mongoose.connect(dbURI);
    console.log("DB connected");
  } catch (error) {
    console.log("DB connection error:", error);
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

//routes
app.use("/", authRoutes);
app.use("/chat", verifyJWT, chatRoutes);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join conversation room
  socket.on("join", async ({ conversationId }) => {
    socket.join(conversationId);
    console.log(`User joined conversation: ${conversationId}`);
  });

  // Handle messages
  socket.on("message", async (message) => {
    try {
      // Save message to database
      const savedMessage = await Message.create({
        conversation: message.conversationId,
        sender: message.sender,
        content: message.content
      });

      // Update conversation's last message
      await Conversation.findByIdAndUpdate(
        message.conversationId,
        { lastMessage: message.content, updatedAt: Date.now() }
      );

      // Emit message to conversation room
      io.to(message.conversationId).emit("message", savedMessage);
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  // Handle typing status
  socket.on("typing", ({ conversationId, isTyping }) => {
    socket.to(conversationId).emit("typing", { isTyping });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// server setup
server.listen(PORT, () => {
  dbConnection();
  console.log(`Server running on http://localhost:${PORT}`);
});
