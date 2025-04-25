"use strict";

const jwt = require("jsonwebtoken");
const Client = require("../models/Client.js");
const Lawyer = require("../models/Lawyer.js");

const { getGoogleOAuthUrl, getGoogleOAuthToken } = require("../services/googleOAuthServices.js");

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

    const { id_token } = await getGoogleOAuthToken(authorizationCode);
    const { name, email, picture } = jwt.decode(id_token);

    if (!email) {
      return res.status(400).json({ error: "Invalid ID token. Email not found." });
    }

    // Determine model
    let user;
    if (role === "lawyer") {
      user = await Lawyer.findOneAndUpdate(
        { email },
        { name, picture, role },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    } else {
      role = "client";
      user = await Client.findOneAndUpdate(
        { email },
        { name, picture, role },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }

    const appToken = jwt.sign(
      { _id: user._id, name, email, picture, role },
      process.env.JWT_SECRET || "Why!",
      { expiresIn: "2d" }
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
