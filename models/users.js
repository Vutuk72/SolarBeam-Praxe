const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

let mongoUrl = process.env.MONGO_URI; // MongoDB URI
let mongoDbName = process.env.MONGO_DB; // MongoDB Database name
let mongoCollectionName = process.env.MONGO_USERS_COLLECTION; // MongoDB Collection name for Users
// Establish a connection to MongoDB using Mongoose
mongoose
  .connect(`${mongoUrl}/${mongoDbName}`, {
    useNewUrlParser: true, // Ensures that the new URL parser is used
    useUnifiedTopology: true, // Enables the new Server Discover and Monitoring engine
    authSource: "admin", // Optional: Specify the auth database if authentication is needed
  })
  .then(() => console.log("Connected to MongoDB with authorization")) // Success message on successful connection
  .catch((err) => console.error("Failed to connect to MongoDB", err)); // Error handling for connection failures

// Handle application shutdown and close the MongoDB connection gracefully
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to app termination");
  process.exit(0); // Exit the process
});

process.on("SIGTERM", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to app termination");
  process.exit(0); // Exit the process
});

// Define a Mongoose schema for the User model
const userSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: true, // The user's first name is required
  },
  lastname: {
    type: String,
    required: true, // The user's last name is required
  },
  email: {
    type: String,
    required: true, // The user's email is required
  },
  password: {
    type: String,
    required: true, // The user's password is required
  },
  role: {
    type: Array,
    required: false,
    default: [""],
  },
  archived: {
    type: Boolean,
    default: false,
    required: false,
  },
});

// Export the User model, which is mapped to the collection specified by mongoCollectionName
// This allows other parts of the application to interact with the users collection
module.exports = mongoose.model(mongoCollectionName, userSchema);
