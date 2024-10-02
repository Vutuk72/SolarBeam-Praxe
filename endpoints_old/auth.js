const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { validationResult, matchedData } = require("express-validator");
const {
  loginValidator,
  registerValidator,
} = require("../validations/auth_validations.js");

const auth = require("../middlewares_old/auth.js");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { getUserByEmail, createUser } = require("../db/users.js");

const dotenv = require("dotenv");
dotenv.config();

const jwtSecretKey = process.env.JWT_SECRET_KEY;
const jwtExpireTime = process.env.JWT_EXPIRE_TIME;

function withoutProperty(obj, property) {
  const { [property]: unused, ...rest } = obj;

  return rest;
}

router.get("/user", auth, (req, res) => {
  let dtOut = {};
  dtOut.user = withoutProperty(req.user, "password");
  dtOut.errors = [];
  return res.status(200).json(dtOut);
});

router.post("/login", loginValidator, (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    let data = matchedData(req);
    //check user in DB
    getUserByEmail(data.email).then((user) => {
      if (user) {
        // check password via bcrypt
        bcrypt.compare(data.password, user.password, function (err, result) {
          if (result) {
            let dtOut = {};
            //create JWT and send it to user
            dtOut.user = withoutProperty(user, "password");
            dtOut.token = jwt.sign(
              { _id: user._id, nickname: user.nickname, email: user.email },
              jwtSecretKey,
              { expiresIn: jwtExpireTime }
            );
            dtOut.errors = errors.array();
            return res.status(200).json(dtOut);
          }
          return res
            .status(401)
            .json({ errors: ["Invalid email or password"] });
        });
      } else {
        return res.status(401).json({ errors: ["Invalid email or password"] });
      }
    });
  } else {
    res.status(400).json({ errors: errors.array() });
  }
});

router.post("/register", registerValidator, (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    let data = matchedData(req);
    //check user in DB
    getUserByEmail(data.email).then((user) => {
      if (user) {
        return res
          .status(409)
          .json({ errors: ["User with this email already exists"] });
      } else {
        // hash password
        bcrypt.hash(data.password, saltRounds, function (err, hash) {
          // create user

          (data.password = hash),
            (data.sys = {
              cts: new Date(),
              mts: new Date(),
              rev: 0,
            });
          data.devices = [];
          data.role = [];

          // add user to DB
          createUser(data).then((result) => {
            // create JWT and send it to user
            let dtOut = {};
            dtOut.user = withoutProperty(data, "password");
            dtOut.token = jwt.sign(
              {
                _id: result.insertedId,
                nickname: data.nickname,
                email: data.email,
              },
              jwtSecretKey,
              { expiresIn: jwtExpireTime }
            );
            dtOut.errors = errors.array();
            return res.status(200).json(dtOut);
          });
        });
      }
    });
  } else {
    res.status(400).json({ errors: errors.array() });
  }
});

module.exports = router;
