const { InfluxDB, Point } = require("@influxdata/influxdb-client");
const moment = require("moment");

let influx_url = process.env.INFLUXDB_URI;
let influx_token = process.env.INFLUXDB_TOKEN;
let influx_org = process.env.INFLUXDB_ORG;
let influx_bucket = process.env.INFLUXDB_BUCKET;

async function readLastData(device_id) {
  console.log("influx", device_id);
  const influxDB = new InfluxDB({ url: influx_url, token: influx_token });
  const queryApi = influxDB.getQueryApi(influx_org);
  const fluxQuery = `from(bucket: "${influx_bucket}")
    |> range(start: -1h)
    |> filter(fn: (r) => r._measurement == "${device_id}")
    |>last()`;
  const queryResult = await queryApi.collectRows(fluxQuery);
  console.log(queryResult);
  let dtOut = {};
  queryResult.forEach((row) => {
    dtOut[row._field] = row._value;
  });
  if (dtOut.hasOwnProperty("pv_power")) {
    return dtOut;
  }
  dtOut.pv_power = 0;
  if (dtOut.hasOwnProperty("pv1_power")) {
    dtOut.pv_power += dtOut.pv1_power;
  }
  if (dtOut.hasOwnProperty("pv2_power")) {
    dtOut.pv_power += dtOut.pv2_power;
  }
  if (dtOut.hasOwnProperty("pv3_power")) {
    dtOut.pv_power += dtOut.pv3_power;
  }
  if (dtOut.hasOwnProperty("pv4_power")) {
    dtOut.pv_power += dtOut.pv4_power;
  }
  if (dtOut.hasOwnProperty("pv5_power")) {
    dtOut.pv_power += dtOut.pv5_power;
  }
  if (dtOut.hasOwnProperty("pv6_power")) {
    dtOut.pv_power += dtOut.pv6_power;
  }
  if (dtOut.hasOwnProperty("pv7_power")) {
    dtOut.pv_power += dtOut.pv7_power;
  }
  if (dtOut.hasOwnProperty("pv8_power")) {
    dtOut.pv_power += dtOut.pv8_power;
  }

  return dtOut;
}

async function readData(device_id, start, stop, aggregation) {
  console.log("influx", device_id, start, stop);
  const influxDB = new InfluxDB({ url: influx_url, token: influx_token });
  const queryApi = influxDB.getQueryApi(influx_org);
  const fluxQuery = `from(bucket: "${influx_bucket}")
        |> range(start: ${start}, stop: ${stop})
        |> filter(fn: (r) => r._measurement == "${device_id}")
        |> aggregateWindow(every: ${aggregation}, fn: last, createEmpty: true)
        |> yield(name: "last")`;
  const queryResult = await queryApi.collectRows(fluxQuery);
  console.log("querry", queryResult);

  const format = "YYYY-MM-DDTHH:mm:ssZ";
  let tmp = {};

  queryResult.forEach((row) => {
    const time = moment(row._time).format(format);
    if (!tmp.hasOwnProperty(time)) {
      tmp[time] = {};
    }
    tmp[time][row._field] = row._value;
  });

  let dtOut = [];

  for (const [key, value] of Object.entries(tmp)) {
    dtOut.push({ time: key, ...value });
  }

  //check if dtout contains pv_power

  //if (dtOut.pv_power == undefined) {
  dtOut.forEach((row) => {
    row.pv_power = 0;
    if (row.hasOwnProperty("pv1_power")) {
      row.pv_power += row.pv1_power;
    }
    if (row.hasOwnProperty("pv2_power")) {
      row.pv_power += row.pv2_power;
    }
    if (row.hasOwnProperty("pv3_power")) {
      row.pv_power += row.pv3_power;
    }
    if (row.hasOwnProperty("pv4_power")) {
      row.pv_power += row.pv4_power;
    }
    if (row.hasOwnProperty("pv5_power")) {
      row.pv_power += row.pv5_power;
    }
    if (row.hasOwnProperty("pv6_power")) {
      row.pv_power += row.pv6_power;
    }
    if (row.hasOwnProperty("pv7_power")) {
      row.pv_power += row.pv7_power;
    }
    if (row.hasOwnProperty("pv8_power")) {
      row.pv_power += row.pv8_power;
    }
  });
  //}

  return dtOut;
}

async function readSpotData(country, start, stop) {
  console.log("influx", country, start, stop);
  const influx_spot_bucket = "spot_market";
  const influxDB = new InfluxDB({ url: influx_url, token: influx_token });
  const queryApi = influxDB.getQueryApi(influx_org);
  const fluxQuery = `from(bucket: "${influx_spot_bucket}")
        |> range(start: ${start}, stop: ${stop})
        |> filter(fn: (r) => r._measurement == "price")
        |> filter(fn: (r) => r["country"] == "${country}")`;

  const queryResult = await queryApi.collectRows(fluxQuery);
  console.log("querry", queryResult);
  let dtOut = {};
  queryResult.forEach((row) => {
    dtOut[row._field] = [];
  });
  queryResult.forEach((row) => {
    dtOut[row._field].push({ time: row._time, value: row._value });
  });

  return dtOut;
}

async function writeData(device_id, data) {
  const influxDB = new InfluxDB({ url: influx_url, token: influx_token });
  const writeApi = influxDB.getWriteApi(influx_org, influx_bucket);

  let points = [];
  Object.keys(data).forEach((key) => {
    try {
      if (key == "sn") {
        points.push(new Point(device_id).stringField(key, data[key]));
      } else if (key == "Id") {
        points.push(new Point(device_id).stringField(key, data[key]));
      } else {
        points.push(new Point(device_id).floatField(key, data[key]));
      }
    } catch (e) {
      console.log(e);
    }
  });

  writeApi.writePoints(points);
  writeApi.close().catch((e) => {
    console.error(e);
    console.log("\\nFinished ERROR");
  });
}

module.exports = { readLastData, readData, writeData, readSpotData };
