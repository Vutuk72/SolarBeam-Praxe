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

const DeviceemsSchema = new mongoose.Schema({
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
  Owner_id: { type: String, required: false },
  Instaler_id: { type: String, required: false },
  sn: { type: String, required: true },
  archived: { type: Boolean, default: false, required: false },
  shared_users: { type: Array, required: false },
  type: { type: String, required: true },
  slcs: { type: Array, required: false },
  config: {
    limitation: {
      price: { type: Number, default: 0, required: false },
      limit: { type: Number, default: 100, required: false },
      enabled: { type: Boolean, default: false, required: false },
    },
  },
});

module.exports = mongoose.model(mongoCollectionName, DeviceemsSchema);
