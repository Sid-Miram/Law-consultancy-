"use strict";

const express = require("express");
const router = express.Router();
const Client = require("../models/Client.js");
require("dotenv").config();
//import controllers
const authControllers = require("../controllers/authControllers.js");
const verifyJWT = require("../middlewares/verifyJwt.js"); 


router.get("/", authControllers.checkHealth);
router.get("/auth/google", authControllers.googleLoginRedirect);
router.get("/auth/google/callback", authControllers.googleLogin);
router.post("/consultation", authControllers.createCalendarEvent);
router.post("/testing", verifyJWT, (req,res)=> res.send("NICEE!"));
module.exports = router;
