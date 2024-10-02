const { getDeviceById } = require("../db/devices.js");
const { getUserById } = require("../db/users.js");

const User = require("../models/users.js");
const SLCDevice = require("../models/SLC_devices.js");
// async function checkId(req, res, next) {
//   if (req.params.id.length != 24) {
//     return res.status(401).json({ errors: ["Invalid ID"] }); //return?
//   } else {
//     next();
//   }
// }

async function authUser(req, res, next) {
  try {
    if (
      req.user.role.includes("user") != true &&
      req.params.id != req.user._id
    ) {
      return res.status(403).json({ errors: ["error invalid Role"] });
    }
  } catch (err) {
    res.status(500).json({ errors: ["error invalid Role"] });
  }
  next();
}

async function authAdmin(req, res, next) {
  try {
    req.device = await getDeviceById(req.params.id);
    if (req.device == undefined) {
      return res.status(404).json({ errors: ["Device not found"] });
    }
    if (
      req.user.role.includes("admin") != true &&
      req.device.owner_id != req.user._id
      //TODO: shared_users
    ) {
      return res
        .status(403)
        .json({ errors: ["Forbidden: invalid role or access"] });
    }
  } catch (err) {
    res.status(500).json({ errors: ["error process device"] });
  }
  next();
}

async function checkSn(req, res, next) {
  if (req.body.sn.length == 6 || req.body.sn.length == 12) {
    next();
  } else {
    return res.status(400).json({ errors: ["error serial number"] });
  }
}

module.exports = [authAdmin, checkSn, authUser];
