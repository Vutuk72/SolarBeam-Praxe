const User = require("../models/users.js");

async function getUserByEmail(email) {
  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
  }
  return user;
}

async function getUserById(id) {
  let user;
  try {
    user = await User.findOne({ _id: id });
  } catch (err) {
    console.log(err);
  }
  return user;
}

module.exports = { getUserByEmail, getUserById };
