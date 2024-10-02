const devices = require("../models/SLC_devices.js");
// const devicesEMS = require("../models/EMS_devices.js");

async function getDeviceById(id) {
  let device;
  try {
    device = await devices.findOne({ _id: id });
  } catch (err) {
    console.log(err);
  }
  return device;
}

module.exports = { getDeviceById };
