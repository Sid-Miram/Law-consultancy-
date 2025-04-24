"use strict";

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const authRoutes = require("./routes/authRoutes.js");
require("dotenv").config();

//.env imports
const dbURI = process.env.dbURI;
const PORT = 3000;

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

app.listen(PORT, () => {
  dbConnection();
  console.log(`Server running on http://localhost:${PORT}`);
});

//routes
app.use(authRoutes);
