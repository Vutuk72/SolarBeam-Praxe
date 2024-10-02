// Required modules
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcrypt");

const { getUserByEmail, getUserById } = require("../db/users.js");
const {
  loginValidator,
  registerValidator,
  userValidator,
  passwordValidator,
} = require("../validations/users.js");
const User = require("../models/users.js");
const [auth, checkId] = require("../middlewares/users.js");
const [authAdmin] = require("../middlewares/devices.js");

const router = express.Router();

const jwtSecretKey = process.env.JWT_SECRET_KEY;
const jwtExpireTime = process.env.JWT_EXPIRE_TIME;
const saltRounds = process.env.SALT_ROUNDS;

router.post("/user/register", registerValidator, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return a 400 status code with the validation errors
    return res.status(400).json({ errors: errors.array() });
  }

  let reqData = matchedData(req);

  // Creating a new User instance with the data from the request body
  getUserByEmail(reqData.email).then((user) => {
    if (user != null) {
      return res.status(409).json({ errors: ["User already exist"] });
    }
    bcrypt.hash(reqData.password, parseInt(saltRounds), (err, hash) => {
      if (err) {
        return res.status(500).json({ errors: ["Error creating user"] });
      }
      const newUser = new User({
        name: reqData.name,
        lastname: reqData.lastname,
        email: reqData.email,
        password: hash,
      });
      newUser.save().then((dbUser) => {
        return res.status(201).json(dbUser); //asi mělo být return
      });
    });
  });
});

router.get("/users", auth, authAdmin, async (req, res) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

router.get("/user/:id", auth, checkId, authAdmin, async (req, res) => {
  // autorizace každej se muže podívat na každýho
  //nefunguje autorizace
  try {
    getUserById(req.params.id).then((user) => {
      if (user) {
        return res.status(200).json(user);
      } else {
        return res.status(401).json({ errors: ["User not found"] });
      }
    });
  } catch (err) {
    return res.status(500).json({ errors: ["User not found"] });
  }
});

router.delete("/user/:id", checkId, auth, authAdmin, async (req, res) => {
  //co když smažu usera a v devices bude jako owner nebo shared user
  try {
    getUserById(req.params.id).then((user) => {
      if (user) {
        user.archived = true;
        user.save();
        return res.status(200).json({ message: "Deleted user" });
      } else {
        return res.status(500).json({ errors: ["User not found"] });
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/user/login", loginValidator, async (req, res) => {
  // Update the user's email and lastname if they are provided in the request

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return a 400 status code with the validation errors
    return res.status(400).json({ errors: errors.array() });
  }
  let reqData = matchedData(req);

  getUserByEmail(reqData.email).then((user) => {
    if (user) {
      bcrypt.compare(reqData.password, user.password, (err, result) => {
        if (result) {
          let dtOut = {};
          dtOut.user = user;
          dtOut.token = jwt.sign({ _id: user._id }, jwtSecretKey, {
            expiresIn: jwtExpireTime,
          });
          dtOut.errors = errors.array();
          return res.status(200).json(dtOut);
        }
        return res.status(401).json({ errors: ["Invalid email or password"] });
      });
    } else {
      return res.status(401).json({ errors: ["Invalid email or password"] });
    }
  });
});

router.put(
  "/user/:id",
  checkId,
  auth,
  authAdmin,
  userValidator,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let reqData = matchedData(req);
    try {
      getUserById(req.params.id).then((user) => {
        if (user) {
          user.sys.mts = new Date().toISOString();
          user.sys.rev += 1;
          user.name = reqData.name;
          user.lastname = reqData.lastname;
          user.email = reqData.email;

          user.save().then((dbUser) => {
            return res.status(200).json(dbUser);
          });
        } else {
          return res.status(404).json({ errors: "user not found" });
        }
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
);

router.patch(
  "/user/:id",
  checkId,
  auth,
  authAdmin,
  passwordValidator,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let reqData = matchedData(req);
    try {
      getUserById(req.params.id).then((user) => {
        if (user) {
          bcrypt.hash(reqData.password, parseInt(saltRounds), (err, hash) => {
            user.password = hash;

            user.save().then((dbUser) => {
              return res.status(200).json(dbUser);
            });
          });
        }
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
);

router.patch("/user/:id/role", checkId, auth);
module.exports = router;
