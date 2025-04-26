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

// CORS configuration
app.use(cors({
  origin: ['http://localhost:4500', 'http://localhost:3000'], // Add your frontend URLs
  credentials: true, // Allow credentials (cookies)
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
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
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
    console.log(error);
  }
}

// server setup
server.listen(PORT, () => {
  dbConnection();
  console.log(`Server running on http://localhost:${PORT}`);
});

//routes
app.use("/", authRoutes);
app.use("/chat", chatRoutes);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join a room based on user role and ID
  socket.on("join-room", ({ userId, role }) => {
    const room = `${role}-${userId}`;
    socket.join(room);
    console.log(`User ${userId} joined room ${room}`);
  });

  // Handle private messages
  socket.on("private-message", ({ to, message, from }) => {
    const room = `${to.role}-${to.id}`;
    io.to(room).emit("private-message", {
      from,
      message,
      timestamp: new Date()
    });
  });

  // Handle typing status
  socket.on("typing", ({ to, isTyping }) => {
    const room = `${to.role}-${to.id}`;
    io.to(room).emit("typing", { isTyping });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
