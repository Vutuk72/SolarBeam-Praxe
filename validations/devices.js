const { body } = require("express-validator");

const createDeviceValidator = [
  body("name", "Name is Empty").not().isEmpty(),
  body("name", "Name is invalid, expecting string value").isString(),
  body("type", "Type is Empty").not().isEmpty(),
  body("type", "Type is invalid, expecting string value").isString(),
  body("sn", "Serial Number is Empty").not().isEmpty(),
  body("sn", "Serial Numbe is invalid, expecting string value").isString(),
];

const updateDeviceValidator = [
  body("name", "Name is Empty").not().isEmpty(),
  body("name", "Name is invalid, expecting string value").isString(),
  body("type", "Type is Empty").not().isEmpty(),
  body("type", "Type is invalid, expecting string value").isString(),
  // body("owner_id", "Owner is Empty").not().isEmpty(),                          //nejspíš není potřeba, ale projistotu tu necham
  // body("owner_id", "Owner is invalid, expecting string value").isString(),
  body("archived", "Archived is Empty").not().isEmpty(),
  body("archived", "Archived is invalid, expecting boolean value").isBoolean(),
  body("config", "Config is Empty or not array").isObject().not().isEmpty(),
  body("instaler_id", "Instaler_id is Empty").isString().not().isEmpty(),
  body(
    "instaler_id",
    "Instaler_id is invalid, expecting string value" //bude to v budoucnu dělat problem
  ).isString(),
];

const updateDeviceAssignValidator = [
  body("owner_id", "owner_id is Empty").not().isEmpty(),
  body("owner_id", "Owner is invalid, expecting string value").isString(),
  body("owner_id", "Owner_users is invalid Id").isLength({
    min: 24,
    max: 26,
  }),
];
const updateDeviceShareValidator = [
  body("shared_users", "Shared_users is Empty").not().isEmpty(),
  body("shared_users", "Shared_users is invalid Id").isLength({
    min: 24,
    max: 24,
  }),
  body(
    "shared_users",
    "Shared_users is invalid, expecting string value"
  ).isString(),
];
module.exports = {
  createDeviceValidator,
  updateDeviceValidator,
  updateDeviceShareValidator,
  updateDeviceAssignValidator,
};
