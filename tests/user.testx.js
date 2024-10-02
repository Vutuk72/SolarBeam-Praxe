const mongoose = require("mongoose");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = require("../main");
require("dotenv").config();

const jwtSecretKey = process.env.JWT_SECRET_KEY;
const jwtExpireTime = process.env.JWT_EXPIRE_TIME;
const saltRounds = Number(process.env.SALT_ROUNDS);

// Define the Mongoose schema for the User model
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  sys: {
    cts: {
      type: Date,
      required: true,
      default: Date.now,
    },
    mts: {
      type: Date,
      required: true,
      default: Date.now,
    },
    rev: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  role: {
    type: Array,
    default: [],
  },
});

// Create the User model from the schema
const User = mongoose.model("User", userSchema);

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

describe("GET /user", () => {
  test("get user", async () => {
    const password = "testtest";
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await User.create({
      lastname: "Petrásek",
      name: "Vojtěch",
      email: "vojtechpetrasek@gmail.com",
      password: hashedPassword,
    });

    const token = jwt.sign({ _id: user._id }, jwtSecretKey, {
      expiresIn: jwtExpireTime,
    });

    return request(app)
      .get("/user")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe("vojtechpetrasek@gmail.com");
      });
  });
});

describe("GET /user without token", () => {
  test("get user", async () => {
    return request(app)
      .get("/user")
      .expect(401)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("errors");
      });
  });
});

describe("GET /user with invalid token", () => {
  test("get user", async () => {
    const token = "invalid token";

    return request(app)
      .get("/user")
      .set("Authorization", `Bearer ${token}`)
      .expect(401)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("errors");
      });
  });
});
