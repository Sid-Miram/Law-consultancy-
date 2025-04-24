"use strict";

const express = require("express");
const router = express.Router();
const Client = require("../models/Client.js");
require("dotenv").config();
//import controllers
const authController = require("../controllers/authControllers.js");

router.get("/", authController.checkHealth);
router.get("/auth/google", authController.googleLoginRedirect);
router.get("/auth/google/callback", authController.googleLogin);

module.exports = router;
