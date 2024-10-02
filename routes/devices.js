const express = require("express");
const mongoose = require("mongoose");
const { validationResult, matchedData } = require("express-validator");

const { getDeviceById } = require("../db/devices.js");
const { getUserById } = require("../db/users.js");
const {
  createDeviceValidator,
  updateDeviceValidator,
  updateDeviceShareValidator,
  updateDeviceAssignValidator,
} = require("../validations/devices.js");
const SLCDevice = require("../models/SLC_devices.js");

// const EMSDevice = require("../models/EMS_devices.js"); //nefunguje
const [authAdmin, checkSn] = require("../middlewares/devices.js");
const [auth, checkId] = require("../middlewares/users.js");

const router = express.Router();
/**
 * Všechny endpointy fungují jenom pro slc, jelikož je chyba s namontování
 * modulu models/EMS_devices.js
 * Nejspíš je to chyba mongodb, že nezvládá mít v jedné colection dva modely pro data.
 */

router.post(
  "/device/create",
  auth,
  createDeviceValidator,
  checkSn,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let reqData = matchedData(req);
    if (reqData.type == "EMS") {
      try {
        const newDevice = new EMSDevice({
          name: reqData.name,
          type: reqData.type,
          sn: reqData.sn,
          owner_id: req.user._id,
          instaler_id: req.user._id,
        });

        newDevice.save().then((dbDevice) => {
          return res.status(201).json(dbDevice);
        });
      } catch (err) {
        return res.status(500).json("err EMS");
      }
    } else if (reqData.type == "SLC") {
      try {
        const newDevice = new SLCDevice({
          name: reqData.name,
          type: reqData.type,
          sn: reqData.sn,
          owner_id: req.user._id,
          instaler_id: req.user._id,
        });
        // console.log(newDevice);
        newDevice.save().then((dbDevice) => {
          return res.status(201).json(dbDevice);
        });
      } catch (err) {
        return res.status(500).json("err SLC");
      }
    } else {
      return res.status(500).json("Error create device");
    }
  }
);

router.delete("/device/:id", checkId, auth, authAdmin, async (req, res) => {
  try {
    getDeviceById(req.params.id).then((device) => {
      if (device) {
        if (device.archived == true) {
          return res.status(400).json({ error: ["device already archived"] });
        }
        device.archived = true;
        device.save();
        return res.status(200).json({ message: ["Deleted device"] });
      } else {
        return res.status(404).json({ errors: ["Device not found"] });
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

//admin only
router.get("/devices", auth, async (req, res) => {
  try {
    const devices = await SLCDevice.find({});
    return res.status(200).json(devices);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});
//me as owner and isnt archived
router.get("/devices/active", auth, async (req, res) => {
  try {
    const devices = await SLCDevice.find({ archived: false });
    return res.status(200).json(devices);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});
//me as owner and is archived
router.get("/devices/archived", auth, async (req, res) => {
  try {
    const devices = await SLCDevice.find({ archived: true });
    return res.status(200).json(devices);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});
//me in shared users
router.get("/devices/shared", auth, async (req, res) => {
  try {
    const devices = await SLCDevice.find({ shared_users: req.user._id });
    const devices1 = await SLCDevice.find({
      shared_users: { $elemMatch: { $in: req.user._id } },
    });
    return res.status(200).json(devices1);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

router.get("/device/:id", checkId, auth, authAdmin, async (req, res) => {
  try {
    if (req.device) {
      return res.status(200).json(req.device); // Odpověď odeslána pouze jednou
    } else {
      return res.status(404).json({ errors: ["Device not found"] });
    }
  } catch (err) {
    if (!res.headersSent) {
      //Zkontroluj, zda odpověď již nebyla odeslána
      res.status(500).json({ errors: ["Server error, device not found"] });
    }
  }
});

router.put(
  "/device/:id",
  checkId,
  auth,
  authAdmin,
  updateDeviceValidator,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      let reqData = matchedData(req);
      getDeviceById(req.params.id).then((device) => {
        if (device) {
          device.sys.mts = new Date().toISOString();
          device.sys.rev += 1;
          device.name = reqData.name;
          device.instaler_id = reqData.instaler_id; //je potřeba ošetřit at to nemůže dělat user

          device.config.type = reqData.config.type;
          device.config.time.window_1.start_time =
            reqData.config.time.window_1.start_time;
          device.config.time.window_1.end_time =
            reqData.config.time.window_1.end_time;
          device.config.time.window_1.temp = reqData.config.time.window_1.temp;
          device.config.time.window_1.enabled =
            reqData.config.time.window_1.enabled;
          device.config.time.window_2.start_time =
            reqData.config.time.window_2.start_time;
          device.config.time.window_2.end_time =
            reqData.config.time.window_2.end_time;
          device.config.time.window_2.temp = reqData.config.time.window_2.temp;
          device.config.time.window_2.enabled =
            reqData.config.time.window_2.enabled;
          device.config.time.window_3.start_time =
            reqData.config.time.window_3.start_time;
          device.config.time.window_3.end_time =
            reqData.config.time.window_3.end_time;
          device.config.time.window_3.temp = reqData.config.time.window_3.temp;
          device.config.time.window_3.enabled =
            reqData.config.time.window_3.enabled;

          device.config.batery.min_soc = reqData.config.batery.min_soc;
          device.config.batery.max_soc = reqData.config.batery.max_soc;
          device.config.batery.temp = reqData.config.batery.temp;
          device.config.batery.flag = reqData.config.batery.flag;
          device.config.batery.enabled = reqData.config.batery.enabled;

          device.config.export.power = reqData.config.export.power;
          device.config.export.temp = reqData.config.export.temp;
          device.config.export.flag_l1 = reqData.config.export.flag_l1;
          device.config.export.flag_l2 = reqData.config.export.flag_l2;
          device.config.export.flag_l3 = reqData.config.export.flag_l3;
          device.config.export.flag = reqData.config.export.flag;
          device.config.export.enabled = reqData.config.export.enabled;

          device.save().then((dbDevice) => {
            return res.status(200).json(dbDevice);
          });
        } else {
          return res.status(404).json({ errors: ["Device not found"] });
        }
      });
    } catch (err) {
      return res.status(500).json({ errors: [err] });
    }
  }
);

router.post(
  "/device/:id/assign",
  checkId,
  auth,
  updateDeviceAssignValidator,
  authAdmin, //middleware authAdmin sem nesedí, protože i user může assignout k zařízení
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let reqData = matchedData(req);
      console.log();
      if ((user = (await getUserById(reqData.owner_id)) == null)) {
        return res.status(404).json({ errors: ["User not found"] });
      }

      getDeviceById(req.params.id).then((device) => {
        if (device) {
          try {
            if (device.owner_id.includes(reqData.owner_id) == true) {
              return res.status(400).json({ error: ["User already assign."] });
            }
          } catch (err) {
            return res.status(404).json({ errors: ["User not found"] });
          }

          device.owner_id = reqData.owner_id;
          device.save().then((dbDevice) => {
            return res.status(200).json(dbDevice);
          });
        } else {
          return res.status(401).json({ errors: ["Device not found"] });
        }
      });
    } catch (err) {
      return res.status(500).json({ errors: [err] });
    }
  }
);

router.post(
  "/device/:id/share", //je potřeba pořádně otestova, nefunguje čekování majitelů asi musí být jiný middleware
  checkId,
  auth,
  authAdmin,
  updateDeviceShareValidator,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      let reqData = matchedData(req);
      if ((await getUserById(reqData.shared_users)) == null) {
        return res.status(500).json({ errors: ["User not found"] });
      }

      getDeviceById(req.params.id).then((device) => {
        if (device) {
          try {
            if (device.shared_users.includes(reqData.shared_users) == true) {
              return res.status(400).json({ error: ["User already shared."] });
            }
          } catch (err) {
            return res.status(500).json({ errors: ["User not found"] });
          }
          device.shared_users.push(reqData.shared_users);
          device.save().then((dbDevice) => {
            return res.status(200).json(dbDevice);
          });
        } else {
          return res.status(404).json({ errors: ["Device not found"] });
        }
      });
    } catch (err) {
      return res.status(400).json({ errors: [err] });
    }
  }
);

router.post(
  "/device/:id/remove", //je potřeba pořádně otestova, nefunguje čekování majitelů asi musí být jiný middleware
  checkId,
  auth,
  authAdmin,
  updateDeviceShareValidator,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let reqData = matchedData(req);
      if ((user = (await getUserById(reqData.shared_users)) == null)) {
        return res.status(404).json({ errors: ["User not found"] });
      }

      getDeviceById(req.params.id).then((device) => {
        if (device) {
          try {
            if (device.shared_users.includes(reqData.shared_users) == true) {
              device.shared_users.remove(reqData.shared_users);
              device.save().then((dbDevice) => {
                return res.status(200).json(dbDevice);
              });
            } else {
              return res.status(400).json({ errors: ["User not found"] });
            }
          } catch (err) {
            return res.status(500).json({ errors: ["User not found"] });
          }
        } else {
          return res.status(404).json({ errors: ["Device not found"] });
        }
      });
    } catch (err) {
      return res.status(500).json({ errors: [err] });
    }
  }
);
module.exports = router;
