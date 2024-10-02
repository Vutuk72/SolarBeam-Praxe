const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../main");
require("dotenv").config();

beforeAll(async () => {
  // Only connect if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: process.env.MONGO_DB,
    });
  }
});

/* Clear the users collection before each test. */
beforeEach(async () => {
  await User.deleteMany({}); // Clear all users in the collection
});

/* Closing database connection after all tests. */
afterAll(async () => {
  await mongoose.connection.close(); // Close the Mongoose connection
});
