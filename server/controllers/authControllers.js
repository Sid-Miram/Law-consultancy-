"use strict";

const jwt = require("jsonwebtoken");
// const Client = require("../models/Client.js");
const Lawyer = require("../models/Lawyer.js");
const User = require("../models/User.js");


const { getGoogleOAuthUrl, getGoogleOAuthToken ,getGoogleUser} = require("../services/googleOAuthServices.js");
const { google } = require("googleapis");

const authControllers = {
  checkHealth: (req, res) => {
    res.status(200).json({ message: "Server is running" });
  },

  googleLoginRedirect: async (req, res) => {
    try {
      const url = getGoogleOAuthUrl();
      res.redirect(url);
    } catch (error) {
      console.error("Error in googleLoginRedirect:", error);
      res.status(500).json({ error: "Error redirecting to Google" });
    }
  },

 
  googleLogin: async (req, res) => {
    try {
      const code = req.query.code;
      const { id_token, access_token } = await getGoogleOAuthToken(code);
      const googleUser = jwt.decode(id_token)
      console.log("google email",googleUser);
      
      let user = await User.findOne({ email: googleUser.email });
      
      if (!user) {
        // Create new user based on role
        const role = req.query.role || 'client';
        const UserModel = role === 'lawyer' ? Lawyer : Client;
        
        user = new UserModel({
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

      // Set cookie
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

  findUser: async (req, res) => {
    try {
      // Get user ID from the JWT token (req.user.userId)
      const userId = req.user.userId;
      
      // Find user by ID and exclude sensitive fields
      const user = await User.findById(userId)
        .select('-password -__v')
        .lean();

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Add online status
      user.online = true;
      
      res.status(200).json(user);
    } catch (error) {
      console.error('Error in findUser:', error);
      res.status(500).json({ error: 'Error fetching user data' });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      // Exclude the current user from the results
      const users = await User.find(
        { _id: { $ne: req.user._id } },
        { name: 1, email: 1, role: 1, avatar: 1, online: 1 }
      ).sort({ name: 1 });

      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Error fetching users' });
    }
  },

  // getAllClients: async (req, res) => {
  //   try {
  //     const clients = await Client.find(
  //       {},
  //       { 
  //         name: 1, 
  //         email: 1, 
  //         picture: 1, 
  //         phone: 1, 
  //         address: 1,
  //         bio: 1,
  //         online: 1,
  //         createdAt: 1
  //       }
  //     ).sort({ name: 1 });

  //     res.json(clients);
  //   } catch (error) {
  //     console.error('Error fetching clients:', error);
  //     res.status(500).json({ error: 'Error fetching clients' });
  //   }
  // },
  getAllClients: async (req, res) => {
    try {
      const clients = await User.find({}).sort({ name: 1 });
  
      res.json(clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      res.status(500).json({ error: 'Error fetching clients' });
    }
  },
  

  // getAllLawyers: async (req, res) => {
  //   try {
  //     const lawyers = await Lawyer.find(
  //       {},
  //       { 
  //         name: 1, 
  //         email: 1, 
  //         picture: 1, 
  //         phone: 1, 
  //         address: 1,
  //         bio: 1,
  //         specialization: 1,
  //         experience: 1,
  //         online: 1,
  //         createdAt: 1
  //       }
  //     ).sort({ name: 1 });

  //     res.json(lawyers);
  //   } catch (error) {
  //     console.error('Error fetching lawyers:', error);
  //     res.status(500).json({ error: 'Error fetching lawyers' });
  //   }
  // }

  getAllLawyers: async (req, res) => {
    try {
      const lawyers = await Lawyer.find({}).sort({ name: 1 }); // no projection object
  
      res.json(lawyers);
    } catch (error) {
      console.error('Error fetching lawyers:', error);
      res.status(500).json({ error: 'Error fetching lawyers' });
    }
  }
};

module.exports = authControllers;


