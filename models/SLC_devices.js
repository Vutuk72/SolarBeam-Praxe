const mongoose = require("mongoose");

let mongoUrl = process.env.MONGO_URI; // MongoDB URI
let mongoDbName = process.env.MONGO_DB; // MongoDB Database name
let mongoCollectionName = process.env.MONGO_DEVICES_COLLECTION; // MongoDB Collection name for Users

mongoose
  .connect(`${mongoUrl}/${mongoDbName}`, {
    useNewUrlParser: true, // Ensures that the new URL parser is used
    useUnifiedTopology: true, // Enables the new Server Discover and Monitoring engine
    authSource: "admin", // Optional: Specify the auth database if authentication is needed
  })
  .then(() => console.log("Connected to MongoDB with authorization")) // Success message on successful connection
  .catch((err) => console.error("Failed to connect to MongoDB", err)); // Error handling for connection failures

const SLCDeviceSchema = new mongoose.Schema({
  sys: {
    cts: {
      type: Date,
      required: false,
      default: Date.now, // Automatically set the current timestamp as created date
    },
    mts: {
      type: Date,
      required: false,
      default: Date.now, // Automatically set the current timestamp as the modified date
    },
    rev: {
      type: Number,
      required: false,
      default: 0, // The revision number, initialized to 0, used for versioning or tracking changes
    },
  },
  name: { type: String, required: true },
  owner_id: { type: String, required: false, default: "" },
  sn: { type: String, required: true },
  archived: { type: Boolean, default: false, required: false },
  shared_users: { type: Array, required: false },
  type: { type: String, required: true },
  instaler_id: { type: String, required: false, default: "" },
  config: {
    type: { type: Number, default: 1, required: false },
    time: {
      window_1: {
        start_time: { type: String, default: "7:00", required: false },
        end_time: { type: String, default: "19:00", required: false },
        temp: { type: Number, default: 50, required: false },
        enabled: { type: Boolean, default: true, required: false },
      },
      window_2: {
        start_time: { type: String, default: "7:00", required: false },
        end_time: { type: String, default: "19:00", required: false },
        temp: { type: Number, default: 50, required: false },
        enabled: { type: Boolean, default: false, required: false },
      },
      window_3: {
        start_time: { type: String, default: "7:00", required: false },
        end_time: { type: String, default: "19:00", required: false },
        temp: { type: Number, default: 50, required: false },
        enabled: { type: Boolean, default: false, required: false },
      },
    },
    batery: {
      min_soc: { type: Number, default: 95, required: false },
      max_soc: { type: Number, default: 98, required: false },
      temp: { type: Number, default: 70, required: false },
      enabled: { type: Boolean, default: false, required: false },
      flag: { type: Boolean, default: false, required: false },
    },
    export: {
      power: { type: Number, default: 2200, required: false },
      temp: { type: Number, default: 70, required: false },
      flag_l1: { type: Boolean, default: false, required: false },
      flag_l2: { type: Boolean, default: false, required: false },
      flag_l3: { type: Boolean, default: false, required: false },
      flag: { type: Boolean, default: false, required: false },
      enabled: { type: Boolean, default: false, required: false },
    },
  },
});

module.exports = mongoose.model(mongoCollectionName, SLCDeviceSchema);
