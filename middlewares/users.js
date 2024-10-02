// auth middleware that returns user data if token is valid
const jwt = require("jsonwebtoken");
const { getUserById } = require("../db/users.js");

const jwtSecretKey = process.env.JWT_SECRET_KEY;

async function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No credentials sent!");
    return res.status(401).json({
      errors: [
        "No credentials sent!",
        "Please insert token in header with Bearer prefix (Bearer <token>)",
      ],
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwtSecretKey);
    // Optional: Fetch the user by ID from the decoded token and attach to req.user
    req.user = await getUserById(decoded._id);
    if (!req.user) {
      console.log("User not found");
      return res.status(401).json({ errors: ["User not found"] });
    }
    next();
  } catch (err) {
    console.log(err);
    console.log("Invalid token");
    return res.status(500).json({ errors: ["Invalid token"] });
  }
}

async function checkId(req, res, next) {
  if (req.params.id.length != 24) {
    return res.status(401).json({ errors: ["Invalid ID"] });
  } else {
    next();
  }
}

module.exports = [auth, checkId];
