"use strict";

const express = require("express");
const router = express.Router();
const Client = require("../models/Client.js");
require("dotenv").config();
//import controllers
const authControllers = require("../controllers/authControllers.js");
const verifyJWT = require("../middlewares/verifyJwt.js"); 
const User = require("../models/Client.js");


router.get("/", authControllers.checkHealth);
router.get("/auth/google", authControllers.googleLoginRedirect);
router.get("/auth/google/callback", authControllers.googleLogin);
router.post("/consultation", authControllers.createCalendarEvent);
router.post("/testing", verifyJWT, (req,res)=> res.send("NICEE!"));
router.get("/find-user", verifyJWT, authControllers.findUser);
router.get("/users", verifyJWT, authControllers.getAllUsers);
router.get("/clients", verifyJWT, (req, res) => {
  // Only lawyers can see clients
  if (req.user.role !== 'lawyer') {
    return res.status(403).json({ error: 'Unauthorized access' });
  }
  authControllers.getAllClients(req, res);
});
router.get("/lawyers", verifyJWT, (req, res) => {
  // Only clients can see lawyers
  if (req.user.role !== 'client') {
    return res.status(403).json({ error: 'Unauthorized access' });
  }
  authControllers.getAllLawyers(req, res);
});
router.post("/auth/logout", (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: 'Logged out successfully' });
});

// Add a new route for chat validation
router.post("/chat/validate", verifyJWT, (req, res) => {
  const { participantId } = req.body;
  
  // Get participant's role from database
  User.findById(participantId)
    .then(participant => {
      if (!participant) {
        return res.status(404).json({ error: 'Participant not found' });
      }

      // Validate chat rules
      if ((req.user.role === 'client' && participant.role !== 'lawyer') ||
          (req.user.role === 'lawyer' && participant.role !== 'client')) {
        return res.status(403).json({ 
          error: 'Invalid chat: Clients can only chat with lawyers and vice versa' 
        });
      }

      res.json({ valid: true });
    })
    .catch(error => {
      console.error('Error validating chat:', error);
      res.status(500).json({ error: 'Error validating chat' });
    });
});

module.exports = router;
