const { InfluxDB, Point } = require("@influxdata/influxdb-client");
const dotenv = require("dotenv");
dotenv.config();

const influx_url = process.env.INFLUXDB_URI;
const influx_token = process.env.INFLUXDB_TOKEN;
const influx_org = process.env.INFLUXDB_ORG;
const influx_bucket = process.env.INFLUXDB_BUCKET;

async function readActualData(device_id) {
  console.log(influx_url, influx_token, influx_org, influx_bucket);
  const influxDB = new InfluxDB({ url: influx_url, token: influx_token });
  const queryApi = influxDB.getQueryApi(influx_org);
  const fluxQuery = `from(bucket: "${influx_bucket}")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "${device_id}")
  |> filter(fn: (r) => r["_field"] == "Active Power" or r["_field"] == "Battery Power" or r["_field"] == "Battery State of Charge" or r["_field"] == "Today Energy (import)" or r["_field"] == "Today Energy (export)" or r["_field"] == "PV Power" or r["_field"] == "Load")
  |> last()`;
  const queryResult = await queryApi.collectRows(fluxQuery);

  let data = [];
  queryResult.forEach((element) => {
    let name = element._field;
    if (name == "Today Energy (import)") {
      name = "Export";
      unit = "kWh";
      min = 0;
      max = 10;
    } else if (name == "Today Energy (export)") {
      name = "Import";
      unit = "kWh";
      min = 0;
      max = 10;
    } else if (name == "Battery State of Charge") {
      name = "Battery SoC";
      unit = "%";
      min = 0;
      max = 100;
    } else if (name == "Active Power") {
      name = "Active Power";
      unit = "W";
      min = -5000;
      max = 5000;
    } else if (name == "Battery Power") {
      name = "Battery Power";
      unit = "W";
      min = -1000;
      max = 1000;
    } else if (name == "PV Power") {
      name = "PV Power";
      unit = "W";
      min = 0;
      max = 5000;
    } else if (name == "Load") {
      name = "Load";
      unit = "W";
      min = -5000;
      max = 5000;
    }

    data.push({
      name: name,
      value: element._value,
      unit: unit,
      min: min,
      max: max,
    });
  });
  return data;
}

async function readStatsData(device_id) {
  const influxDB = new InfluxDB({ url: influx_url, token: influx_token });

  const queryApi = influxDB.getQueryApi(influx_org);

  const fluxQuery = `from(bucket: "${influx_bucket}")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "${device_id}")
  |> filter(fn: (r) => r["_field"] == "Today Load" or r["_field"] == "Today Energy (import)" or r["_field"] == "Today Energy (export)" or r["_field"] == "Today's PV Generation" or r["_field"] == "Total PV Generation" or r["_field"] == "Total Load" or r["_field"] == "Total Energy (import)" or r["_field"] == "Total Energy (export)" or r["_field"] == "Hours Total")
  |> last()`;

  const queryResult = await queryApi.collectRows(fluxQuery);

  let data = [];
  queryResult.forEach((element) => {
    let name = element._field;
    if (name == "Today Energy (import)") {
      name = "Export";
      unit = "kWh";
    } else if (name == "Today Energy (export)") {
      name = "Import";
      unit = "kWh";
    } else if (name == "Today Load") {
      name = "Load";
      unit = "kWh";
    } else if (name == "Today's PV Generation") {
      name = "PV Power";
      unit = "kWh";
    } else if (name == "Total PV Generation") {
      name = "PV Power";
      unit = "kWh";
    } else if (name == "Total Load") {
      name = "Load";
      unit = "kWh";
    } else if (name == "Total Energy (import)") {
      name = "Export";
      unit = "kWh";
    } else if (name == "Total Energy (export)") {
      name = "Import";
      unit = "kWh";
    } else if (name == "Hours Total") {
      name = "Hours Total";
      unit = "h";
    }

    data.push({
      name: name,
      value: element._value,
      unit: unit,
    });
  });
  return data;
}

module.exports = { readActualData, readStatsData };
