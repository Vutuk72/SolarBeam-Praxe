// auth middleware that returns user data if token is valid
const jwt = require("jsonwebtoken");
const { validationResult, matchedData } = require("express-validator");

const jwtSecretKey = process.env.JWT_SECRET_KEY;

const auth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({
      errors: [
        "No credentials sent!",
        "please insert token in header with Bearer prefix (Bearer <token>)",
      ],
    });
  }
  const token = req.headers.authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwtSecretKey);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ errors: ["Invalid token"] });
  }
};

const auth_with_apikey = (req, res, next) => {
  if (req.query.apiKey === undefined) {
    if (!req.headers.authorization) {
      return res.status(401).json({
        errors: [
          "No credentials sent!",
          "please insert token in header with Bearer prefix (Bearer <token>)",
          'Or insert querry parameter "?apiKey=<API_KEY>"',
        ],
      });
    }
    const token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, jwtSecretKey);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ errors: ["Invalid token"] });
    }
  } else {
    const apiKey = req.query.apiKey;
    req.user = { apiKey: apiKey };
    next();
  }
};

module.exports = [auth, auth_with_apikey];
