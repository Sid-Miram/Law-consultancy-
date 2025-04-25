"use strict";

const express = require("express");
const router = express.Router();
const Client = require("../models/Client.js");
require("dotenv").config();
//import controllers
const authControllers = require("../controllers/authControllers.js");

router.get("/", authControllers.checkHealth);
router.get("/auth/google", authControllers.googleLoginRedirect);
router.get("/auth/google/callback", authControllers.googleLogin);

module.exports = router;
