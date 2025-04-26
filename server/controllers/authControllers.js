"use strict";

const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const { getGoogleOAuthUrl, getGoogleOAuthToken } = require("../services/googleOAuthServices.js");

const authControllers = {
  // Health Check
  checkHealth: (req, res) => {
    res.status(200).json({ message: "Server is running" });
  },

  // Google OAuth Redirect
  googleLoginRedirect: async (req, res) => {
    try {
      const url = getGoogleOAuthUrl();
      res.redirect(url);
    } catch (error) {
      console.error("Error in googleLoginRedirect:", error);
      res.status(500).json({ error: "Error redirecting to Google" });
    }
  },

  // Google OAuth Callback
  googleLogin: async (req, res) => {
    try {
      const code = req.query.code;
      const { id_token, access_token } = await getGoogleOAuthToken(code);

      const googleUser = jwt.decode(id_token);
      // console.log("Google email:", googleUser);

      let user = await User.findOne({ email: googleUser.email });

      if (!user) {
        // Create new user
        const role = req.query.role || 'client'; // default role = client
        user = new User({
          name: googleUser.name,
          email: googleUser.email,
          picture: googleUser.picture,
          role: role
        });
        await user.save();
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Set token cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      // Redirect to frontend
      res.redirect('http://localhost:4500/');
    } catch (error) {
      console.error("Error in googleLogin:", error);
      res.redirect('http://localhost:4500/login?error=authentication_failed');
    }
  },

  // Create Calendar Event (optional, if you use Google Calendar)
  createCalendarEvent: async (req, res) => {
    try {
      const { summary, description, startTime, endTime, timeZone } = req.body;
      const event = await createCalendarEvent(summary, description, startTime, endTime, timeZone);
      res.json(event);
    } catch (error) {
      console.error("Error creating calendar event:", error);
      res.status(500).json({ error: "Error creating calendar event" });
    }
  },

  // Find Current User (from token)
 

  // Get All Users (except current user)
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find(
        { _id: { $ne: req.user.userId } },
        { name: 1, email: 1, role: 1, picture: 1, online: 1 }
      ).sort({ name: 1 });

      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Error fetching users' });
    }
  },

  // Get All Clients (users with role = 'client')
  getAllClients: async (req, res) => {
    try {
      const clients = await User.find(
        { role: 'client' },
        { 
          name: 1, 
          email: 1, 
          picture: 1, 
          phone: 1, 
          address: 1,
          bio: 1,
          online: 1,
          createdAt: 1
        }
      ).sort({ name: 1 });

      res.json(clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      res.status(500).json({ error: 'Error fetching clients' });
    }
  },

  // Get All Lawyers (users with role = 'lawyer')
  getAllLawyers: async (req, res) => {
    try {
      const lawyers = await User.find(
        { role: 'lawyer' },
        { 
          name: 1, 
          email: 1, 
          picture: 1, 
          phone: 1, 
          address: 1,
          bio: 1,
          specialization: 1,
          experience: 1,
          online: 1,
          createdAt: 1
        }
      ).sort({ name: 1 });

      res.json(lawyers);
    } catch (error) {
      console.error('Error fetching lawyers:', error);
      res.status(500).json({ error: 'Error fetching lawyers' });
    }
  }
};

module.exports = authControllers;
