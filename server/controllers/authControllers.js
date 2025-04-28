"use strict";

const Meeting = require("../models/Meeting"); // Import the Meeting model at top
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const {
  getGoogleOAuthUrl,
  getGoogleOAuthToken,
} = require("../services/googleOAuthServices.js");
const { google } = require("googleapis");

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
        const role = req.query.role || "client"; // default role = client
        user = new User({
          name: googleUser.name,
          email: googleUser.email,
          picture: googleUser.picture,
          role: role,
          googleCalendarToken: access_token, 
        });
        await user.save();
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      // Set token cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      // Redirect to frontend
      res.redirect("http://localhost:4500/");
    } catch (error) {
      console.error("Error in googleLogin:", error);
      res.redirect("http://localhost:4500/login?error=authentication_failed");
    }
  },

  // Create Calendar Event (optional, if you use Google Calendar)


createCalendarEvent: async (req, res) => {
  const { title, description, startTime, endTime, attendees } = req.body;

  const authToken = req.cookies.token;

  if (!authToken) {
    return res.status(403).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const { userId, role } = decoded;
    console.log(decoded);

    const user = await User.findById(userId);
    console.log(user);

    if (!user || !user.googleCalendarToken) {
      return res
        .status(401)
        .json({ error: "Google access token not available" });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: user.googleCalendarToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
      summary: title,
      description,
      start: {
        dateTime: startTime,
        timeZone: "UTC",
      },
      end: {
        dateTime: endTime,
        timeZone: "UTC",
      },
      attendees: attendees.map((email) => ({ email })),
      reminders: {
        useDefault: true,
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    // 🔥 NEW: Save meeting into MongoDB
    const attendeeUsers = await User.find({ email: { $in: attendees } });
    console.log(startTime);
    

    const meeting = new Meeting({
      title,
      description,
      startTime,
      endTime,
      attendees: attendeeUsers.map((u) => u._id), // Save user IDs
      meetLink: response.data.hangoutLink || response.data.htmlLink, // Use meet link
      status: "scheduled",
    });

    await meeting.save();

    return res.status(200).json({
      message: "Consultation booked successfully",
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
    });
  } catch (error) {
    console.error("Error booking consultation:", error);
    return res.status(500).json({ error: "Failed to book consultation" });
  }
},


  getUserMeetings: async (req, res) => {
  const authToken = req.cookies.token; // or from headers (Authorization)

  if (!authToken) {
    return res.status(403).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const meetings = await Meeting.find({ attendees: userId })
      .populate("attendees", "name email")
      .sort({ startTime: 1 });

    const formattedMeetings = meetings.map(meeting => ({
      title: meeting.title,
      description: meeting.description,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      meetLink: meeting.meetLink,
      status: meeting.status,
      attendees: meeting.attendees.map(attendee => ({
        name: attendee.name,
        email: attendee.email,
      })),
    }));

    return res.status(200).json(formattedMeetings);
  } catch (error) {
    console.error("Error fetching user meetings:", error);
    return res.status(500).json({ error: "Failed to fetch user meetings" });
  }
},

 // Get All Users (except current user)
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find(
        { _id: { $ne: req.user.userId } },
        { name: 1, email: 1, role: 1, picture: 1, online: 1 },
      ).sort({ name: 1 });

      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Error fetching users" });
    }
  },

  // Get All Clients (users with role = 'client')
  getAllClients: async (req, res) => {
    try {
      const clients = await User.find(
        { role: "client" },
        {
          name: 1,
          email: 1,
          picture: 1,
          phone: 1,
          address: 1,
          bio: 1,
          online: 1,
          createdAt: 1,
        },
      ).sort({ name: 1 });

      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ error: "Error fetching clients" });
    }
  },

  // Get All Lawyers (users with role = 'lawyer')
  getAllLawyers: async (req, res) => {
    try {
      const lawyers = await User.find(
        { role: "lawyer" },
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
          createdAt: 1,
        },
      ).sort({ name: 1 });

      res.json(lawyers);
    } catch (error) {
      console.error("Error fetching lawyers:", error);
      res.status(500).json({ error: "Error fetching lawyers" });
    }
  },
};

module.exports = authControllers;