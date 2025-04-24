"use strict";

const { getGoogleOAuthUrl, getGoogleOAuthToken } = require("../services/googleOauthServices.js");

module.exports.checkHealth = (req, res) => {
  res.status(200).send("Mango Yummy");
};

module.exports.googleLoginRedirect = (req, res) => {
  const consentUrl = getGoogleOAuthUrl();
  res.redirect(consentUrl);
};

module.exports.googleLogin = async (req, res) => {
  const authorizationCode = req.query.code;
  const token = await getGoogleOAuthToken(authorizationCode);
  console.log(token);
  res.send("NICEE")
};
