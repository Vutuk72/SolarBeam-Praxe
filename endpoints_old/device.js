const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();
const { validationResult, matchedData } = require("express-validator");
const {
  createDeviceValidator,
  tokenValidator,
  updateDeviceValidator,
  updateConfigValidator,
} = require("../validations/device_validations.js");
const moment = require("moment");

const {
  createDevice,
  updateDevice,
  getActiveDevices,
  getArchivedDevices,
  getSharedDevices,
  deleteDevice,
  getDevice,
} = require("../db/devices.js");

const [auth, auth_with_apikey] = require("../middlewares/auth.js");
const { readLastData, readData } = require("../db/influx.js");

function withoutProperty(obj, property) {
  const { [property]: unused, ...rest } = obj;

  return rest;
}

// router.get("/devices", tokenValidator, auth, (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }
//   getActiveDevices(req.user._id).then((active_devices) => {
//     getArchivedDevices(req.user._id).then((archived_devices) => {
//       getSharedDevices(req.user._id).then((shared_devices) => {
//         let devices = {
//           active_devices: active_devices,
//           archived_devices: archived_devices,
//           shared_devices: shared_devices,
//         };
//         return res.status(200).json(devices);
//       });
//     });
//   });
// });

router.get("/device/:id/data", auth_with_apikey, (req, res) => {
  let device_id = req.params.id;
  console.log("debug");

  getDevice(device_id).then((device) => {
    console.log(device, req.user);
    if (!device) {
      return res.status(404).json({ errors: ["Device not found"] });
    }
    if (req.user.apiKey !== undefined) {
      if (device.apiKey !== req.user.apiKey) {
        return res.status(403).json({ errors: ["Forbidden"] });
      }
    } else {
      if (device.owner_id !== req.user._id) {
        if (
          device.shared_users.filter((user) => user.id === req.user._id)
            .length === 0
        ) {
          return res.status(403).json({ errors: ["Forbidden"] });
        }
      }
    }
    let dtOut = {};
    readLastData(device.sn)
      .then((data) => {
        console.log(data);
        dtOut.data = data;
        dtOut.errors = [];
        return res.status(200).json(dtOut);
      })
      .catch((err) => {
        console.log(err);
        dtOut.data = {};
        dtOut.errors = ["Internal Server Error"];
        return res.status(500).json(dtOut);
      });
  });
});

router.get("/device/:id/history", auth_with_apikey, (req, res) => {
  const format = "YYYY-MM-DDTHH:mm:ss.SSSZ";
  console.log(req.query);
  let start;
  let stop;
  let agregation;
  if (req.query.start === undefined) {
    return res.status(400).json({
      errors: [
        "Bad request",
        "Start parameter missing",
        'Please provide start parameter if "YYYY-MM-DDTHH:mm:ss.SSSZ" format',
      ],
    });
  } else {
    start = moment(req.query.start, format, true);
    if (!start.isValid()) {
      return res.status(400).json({
        errors: [
          "Bad request",
          "Start parameter invalid",
          'Please provide start parameter if "YYYY-MM-DDTHH:mm:ss.SSSZ" format',
        ],
      });
    }
  }
  if (req.query.stop === undefined) {
    stop = moment();
  } else {
    stop = moment(req.query.stop, format, true);
  }

  if (!stop.isValid()) {
    return res.status(400).json({
      errors: [
        "Bad request",
        "Stop parameter invalid",
        'Please provide stop parameter if "YYYY-MM-DDTHH:mm:ss.SSSZ" format',
      ],
    });
  }

  if (stop.isBefore(start)) {
    return res.status(400).json({
      errors: ["Bad request", "Stop parameter is before start parameter"],
    });
  }

  if (
    req.query.agregation !== undefined &&
    req.query.agregation.match(/^[0-9]+[m|h]$/)
  ) {
    agregation = req.query.agregation;
  } else {
    let time_diff = stop.diff(start, "hours");
    if (time_diff < 1) {
      agregation = "5m";
    } else if (time_diff < 12) {
      agregation = "5m";
    } else if (time_diff < 24) {
      agregation = "5m";
    } else {
      agregation = "15m";
    }
  }

  let device_id = req.params.id;

  getDevice(device_id).then((device) => {
    console.log(device, req.user);
    if (!device) {
      return res.status(404).json({ errors: ["Device not found"] });
    }
    if (req.user.apiKey !== undefined) {
      if (device.apiKey !== req.user.apiKey) {
        return res.status(403).json({ errors: ["Forbidden"] });
      }
    } else {
      if (device.owner_id !== req.user._id) {
        if (
          device.shared_users.filter((user) => user.id === req.user._id)
            .length === 0
        ) {
          return res.status(403).json({ errors: ["Forbidden"] });
        }
      }
    }
    let dtOut = {};
    let device_id = device.sn;
    readData(device_id, start.format(format), stop.format(format), agregation)
      .then((data) => {
        dtOut.data = data;
        dtOut.config = device.config;

        dtOut.errors = [];
        return res.status(200).json(dtOut);
      })
      .catch((err) => {
        console.log(err);
        dtOut.data = {};
        dtOut.errors = ["Internal DB Server Error"];
        return res.status(500).json(dtOut);
      });
  });
});

router.get("/device/:id", tokenValidator, auth, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let device_id = req.params.id;

  console.log(req.user);

  //check if device exists and belongs to user
  getDevice(device_id).then((device) => {
    if (!device) {
      return res.status(404).json({ errors: ["Device not found"] });
    }

    console.log(device);

    if (device.owner_id !== req.user._id) {
      if (
        device.shared_users.filter((user) => user.id === req.user._id)
          .length === 0
      ) {
        return res.status(403).json({ errors: ["Forbidden"] });
      } else {
        return res.status(200).json(device);
      }
    } else {
      return res.status(200).json(device);
    }
  });
});

router.post("/device/create", createDeviceValidator, auth, (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    let data = matchedData(req);

    let new_device = {
      sys: {
        cts: new Date().toISOString(),
        mts: new Date().toISOString(),
        ver: 0,
      },
      name: data.name,
      owner_id: req.user._id,
      owner_name: req.user.nickname,
      archived: data.archived || false,
      shared_users: data.shared_users || [],
      type: data.type,
    };

    if (data.type === "EMS") {
      new_device.sn = data.sn;
      (new_device.slcs = []),
        (new_device.config = {
          enable_export_limit: false,
          export_limit: 0,
          enable_import_limit: false,
          import_limit: 0,
          enable_boiler_control: false,
          min_soc_boiler: 93,
          max_soc_boiler: 98,
          boiler_flag: false,
        });
    } else if (data.type === "SLC") {
      new_device.sn = data.sn;
      new_device.config = {
        min_temp: 50,
        max_temp: 60,
        power: 2000,
        type: 1,
        max_heat: 70,
        time_end: "17:00",
        time_start: "15:00",
        time_control: false,
        battery_control: false,
        min_battery: 95,
        max_battery: 100,
        export_control: false,
        battery_flag: false,
      };
    } else {
      return res.status(400).json({ errors: ["Invalid device type"] });
    }

    createDevice(new_device).then((result) => {
      if (result.acknowledged) {
        return res.status(201).json(new_device);
      } else {
        return res.status(500).json({ errors: ["Internal Server Error"] });
      }
    });
  } else {
    res.status(400).json({ errors: errors.array() });
  }
});

router.delete("/device/:id", tokenValidator, auth, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let device_id = req.params.id;

  //find device
  getDevice(device_id).then((device) => {
    if (!device) {
      return res.status(404).json({ errors: ["Device not found"] });
    }

    //check if user is owner
    if (device.owner_id.toString() !== req.user._id) {
      return res.status(403).json({ errors: ["Forbidden"] });
    }

    deleteDevice(device_id).then((result) => {
      if (result.deletedCount === 1) {
        return res.status(200).json({ message: "Device deleted" });
      } else {
        return res.status(500).json({ errors: ["Internal Server Error"] });
      }
    });
  });
});

router.put("/device/:id", updateDeviceValidator, auth, (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    let data = matchedData(req);
    console.log(data);

    let device_id = req.params.id;

    getDevice(device_id).then((device) => {
      if (!device) {
        return res.status(404).json({ errors: ["Device not found"] });
      }

      console.log(device, req.user);

      if (device.owner_id !== req.user._id) {
        if (
          device.shared_users.filter((user) => user.id === req.user._id)
            .length === 0
        ) {
          return res.status(403).json({ errors: ["Forbidden"] });
        }
      }
      let updateData = { $set: {} };

      data.name !== undefined ? (updateData.$set.name = data.name) : null;
      data.shared_users !== undefined
        ? (updateData.$set.shared_users = data.shared_users)
        : null;
      data.item_device !== undefined
        ? (updateData.$set.item_device = data.item_device)
        : null;
      data.archived !== undefined
        ? (updateData.$set.archived = data.archived)
        : null;
      data.config !== undefined ? (updateData.$set.config = data.config) : null;
      data.slcs !== undefined ? (updateData.$set.slcs = data.slcs) : null;
      updateData.$set.sys = device.sys;
      updateData.$set.sys.mts = new Date().toISOString();
      updateData.$set.sys.ver += 1;

      console.log(updateData);

      updateDevice(device_id, updateData).then((result) => {
        console.log(result);
        if (result.acknowledged) {
          getDevice(device_id).then((device_res) => {
            return res.status(200).json(device_res);
          });
        } else {
          return res.status(500).json({ errors: ["Internal Server Error"] });
        }
      });
    });
  } else {
    res.status(400).json({ errors: errors.array() });
  }
});

router.put("/device/config/:id", updateConfigValidator, auth, (req, res) => {
  console.log("update config");
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    let data = matchedData(req);

    let device_id = req.params.id;

    getDevice(device_id).then((device) => {
      if (!device) {
        return res.status(404).json({ errors: ["Device not found"] });
      }

      console.log(device, req.user);

      if (device.owner_id !== req.user._id) {
        if (
          device.shared_users.filter((user) => user.id === req.user._id)
            .length === 0
        ) {
          return res.status(403).json({ errors: ["Forbidden"] });
        }
      }

      let updateData = { $set: {} };

      updateData.$set.config = { ...device.config, ...data };
      updateData.$set.sys = device.sys;
      updateData.$set.sys.mts = new Date().toISOString();
      updateData.$set.sys.ver += 1;

      console.log(updateData);

      updateDevice(device_id, updateData).then((result) => {
        console.log(result);
        if (result.acknowledged) {
          getDevice(device_id).then((device_res) => {
            return res.status(200).json(device_res);
          });
        } else {
          return res.status(500).json({ errors: ["Internal Server Error"] });
        }
      });
    });
  } else {
    res.status(400).json({ errors: errors.array() });
  }
});

module.exports = router;
