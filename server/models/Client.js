"use strict";

const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  picture: {type: String, required: true},
  email: { type: String, required: true, unique : true, lowercase: true, trim: true },
  role : {type: String, enum: ['client'], default: 'client' , immutable: true},
  googleCalendarToken: {type: String, trim:true},
});

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
