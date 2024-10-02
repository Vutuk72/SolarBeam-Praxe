const bcrypt = require("bcrypt");
const saltRounds = 10;

const pwd = "EE49A4";

bcrypt.hash(pwd, saltRounds, function (err, hash) {
  console.log(hash);
});
