
"use strict";

const mongoose = require("mongoose");

const lawyerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  picture: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  role: { type: String, enum: ['lawyer'], default: 'lawyer', immutable: true },
  specialization: { type: String, required: true },
  experience: { type: Number, required: true }, // in years
  location: { type: String, required: true },
  googleCalendarToken: {type: String, trim:true},
});

const Lawyer = mongoose.model("Lawyer", lawyerSchema);

module.exports = Lawyer;
