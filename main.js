const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

var cors = require("cors");

const app = express();
app.use(cors({ origin: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const usersRouter = require("./routes/users.js");
const devicesRouter = require("./routes/devices.js");

app.use("/", usersRouter);
app.use("/", devicesRouter);

app.get("/", (req, res) => {
  res.send("Solarbeam DEV EMS Cloud API");
});

// Express setings
const hostname = "0.0.0.0";
const port = process.env.PORT || 5001;

if (require.main === module) {
  // running as main
  var server = app.listen(port, hostname, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("API listening at http://%s:%s", host, port);
  });
} else {
  // imported as modul
  module.exports = app;
}
