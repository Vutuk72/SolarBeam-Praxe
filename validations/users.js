const { body } = require("express-validator");

const loginValidator = [
  body("email", "Email is missing").not().isEmpty(),
  body("email", "Invalid email").isEmail(),
  body("password", "Password is missing").not().isEmpty(),
];

const registerValidator = [
  body("name", "Name is Empty").not().isEmpty(),
  body("name", "Name is invalid, expecting string value").isString(),
  body("lastname", "Lastname is Empty").not().isEmpty(),
  body("lastname", "Lastname is invalid, expecting string value").isString(),
  body("email", "Email is empty").not().isEmpty(),
  body("email", "Invalid email").isEmail(),
  body("email", "Email is invalid, expecting string value").isString(),
  body("password", "Password is Empty").not().isEmpty(),
  body("password", "The minimum password length is 8 characters").isLength({
    min: 8,
  }),
  body("password", "Password is invalid, expecting string value").isString(),
];

const userValidator = [
  body("name", "Name is Empty").not().isEmpty(),
  body("name", "Name is invalid, expecting string value").isString(),
  body("lastname", "lastname is Empty").not().isEmpty(),
  body("lastname", "Lastname is invalid, expecting string value").isString(),
  body("email", "Invalid email").isEmail(),
  body("email", "Email is invalid, expecting string value").isString(),
];

const passwordValidator = [
  body("password", "Password is Empty").not().isEmpty(),
  body("password", "The minimum password length is 8 characters").isLength({
    min: 8,
  }),
];

module.exports = {
  loginValidator,
  registerValidator,
  userValidator,
  passwordValidator,
};
