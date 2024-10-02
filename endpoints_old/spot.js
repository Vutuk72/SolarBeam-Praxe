const express = require("express");
const router = express.Router();
const moment = require("moment");

const { readSpotData } = require("../db/influx.js");

router.get("/spot/:country", (req, res) => {
  let country = req.params.country;
  const start = moment()
    .startOf("day")
    .add(1, "hours")
    .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  const stop = moment()
    .endOf("day")
    .add(1, "hours")
    .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  readSpotData(country, start, stop).then((data) => {
    return res.status(200).json(data);
  });
});

module.exports = router;
