"use strict";

const jwt = require("jsonwebtoken");
const Client = require("../models/Client.js");
const Lawyer = require("../models/Lawyer.js");

const { getGoogleOAuthUrl, getGoogleOAuthToken } = require("../services/googleOAuthServices.js");
const { google } = require("googleapis");

module.exports.checkHealth = (req, res) => {
  res.status(200).send("Mango Yummy");
};

module.exports.googleLoginRedirect = (req, res) => {
  const role = req.query.role || "client"; // default to client
  const consentUrl = getGoogleOAuthUrl(role);
  res.redirect(consentUrl);
};

module.exports.googleLogin = async (req, res) => {
  try {
    const { code: authorizationCode, state } = req.query;

    if (!authorizationCode || !state) {
      return res.status(400).json({ error: "Missing authorization code or state" });
    }

    // Extract role from state
    let role;
    try {
      const parsedState = JSON.parse(decodeURIComponent(state));
      role = parsedState.role;
    } catch (e) {
      return res.status(400).json({ error: "Invalid state parameter" });
    }

    const { id_token, access_token } = await getGoogleOAuthToken(authorizationCode);
    const { name, email, picture } = jwt.decode(id_token);

    if (!email) {
      return res.status(400).json({ error: "Invalid ID token. Email not found." });
    }

    let user;
    if (role === "lawyer") {
      user = await Lawyer.findOneAndUpdate(
        { email },
        { name, picture, role, googleCalendarToken: access_token },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    } else {
      role = "client";
      user = await Client.findOneAndUpdate(
        { email },
        { name, picture, role, googleCalendarToken: access_token },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }

    // Create JWT for session
    const appToken = jwt.sign(
      { _id: user._id, name, email, picture, role },
      process.env.JWT_SECRET ,
      { expiresIn: "60m" }
    );

    res.cookie("token", appToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 2 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    const redirectUrl =
      role === "lawyer"
        ? process.env.LAWYER_REDIRECT_URL || "http://localhost:3000/lawyer"
        : process.env.CLIENT_REDIRECT_URL || "http://localhost:3000";

    res.redirect(redirectUrl);
  } catch (err) {
    console.error("Google login error:", err);
    const fallbackRedirect =
      req.query.role === "lawyer"
        ? process.env.LAWYER_REDIRECT_URL || "http://localhost:3000/lawyer"
        : process.env.CLIENT_REDIRECT_URL || "http://localhost:3000";

    res.redirect(`${fallbackRedirect}?error=login_failed`);
  }
};




module.exports.createCalendarEvent = async (req, res) => {
  const { title, description, startTime, endTime, attendees } = req.body;

  const authToken = req.cookies.token;

  if (!authToken) {
    return res.status(403).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const { _id, role } = decoded;

    // Fetch user from DB and get access_token
    const userModel = role === "lawyer" ? Lawyer : Client;
    const user = await userModel.findById(_id);

    if (!user || !user.googleCalendarToken) {
      return res.status(401).json({ error: "Google access token not available" });
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

    return res.status(200).json({
      message: "Consultation booked successfully",
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
    });
  } catch (error) {
    console.error("Error booking consultation:", error);
    return res.status(500).json({ error: "Failed to book consultation" });
  }
};

