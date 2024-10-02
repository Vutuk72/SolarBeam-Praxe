const mongoose = require("mongoose");
const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../main");
require("dotenv").config();

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

describe("POST /user/register", () => {
  test("register new user", async () => {
    request(app)
      .post("/user/register")
      .send({
        lastname: "Petrásek",
        name: "Vojtěch",
        email: "vojtechpetrasek@gmail.com",
        password: "testtest",
      })
      .then((res) => {
        expect(res.status).toBe(201);
        expect(res.body.email).toBe("vojtechpetrasek@gmail.com");
      });
  });
});

describe("POST /user/register without body", () => {
  test("register new user", async () => {
    return request(app)
      .post("/user/register")
      .send({})
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("errors");
      });
  });
});

describe("POST /user/register without lastname", () => {
  test("register new user", async () => {
    return request(app)
      .post("/user/register")
      .send({
        name: "Vojtěch",
        nickname: "Sonic",
        email: "vojtechpetrasek@gmail.com",
        password: "testtest",
      })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("errors");
      });
  });
});

describe("POST /user/register without name", () => {
  test("register new user", async () => {
    return request(app)
      .post("/user/register")
      .send({
        lastname: "Petrásek",
        nickname: "Sonic",
        email: "vojtechpetrasek@gmail.com",
        password: "testtest",
      })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("errors");
      });
  });
});

describe("POST /user/register without email", () => {
  test("register new user", async () => {
    return request(app)
      .post("/user/register")
      .send({
        lastname: "Petrásek",
        name: "Vojtěch",
        nickname: "Sonic",
        password: "testtest",
      })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("errors");
      });
  });
});

describe("POST /user/register without password", () => {
  test("register new user", async () => {
    return request(app)
      .post("/user/register")
      .send({
        lastname: "Petrásek",
        name: "Vojtěch",
        nickname: "Sonic",
        email: "vojtechpetrasek@gmail.com",
      })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("errors");
      });
  });
});

describe("POST /user/register with existing email", () => {
  test("register new user", async () => {
    const password = "testtest";
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await User.create({
      lastname: "Petrásek",
      name: "Vojtěch",
      nickname: "Sonic",
      email: "vojtechpetrasek@gmail.com",
      password: hashedPassword,
    });

    return request(app)
      .post("/user/register")
      .send({
        lastname: "Petrásek",
        name: "Vojtěch",
        nickname: "Sonic",
        email: "vojtechpetrasek@gmail.com",
        password: "random password",
      })
      .expect(409)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.statusCode).toBe(409);
        expect(res.body).toHaveProperty("errors");
      });
  });
});

describe("POST /user/login", () => {
  test("login user", async () => {
    const password = "testtest";
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await User.create({
      lastname: "Petrásek",
      name: "Vojtěch",
      email: "vojtechpetrasek@gmail.com",
      password: hashedPassword,
    });

    return request(app)
      .post("/user/login")
      .send({
        email: "vojtechpetrasek@gmail.com",
        password: "testtest",
      })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.user.name).toBe("Vojtěch");
        expect(res.body.user.lastname).toBe("Petrásek");
        expect(res.body.user.email).toBe("vojtechpetrasek@gmail.com");
        expect(res.body).toHaveProperty("token");
      });
  });
});

describe("POST /user/login without body", () => {
  test("login user", async () => {
    return request(app)
      .post("/user/login")
      .send({})
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("errors");
      });
  });
});

describe("POST /user/login without email", () => {
  test("login user", async () => {
    return request(app)
      .post("/user/login")
      .send({
        password: "testtest",
      })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("errors");
      });
  });
});

describe("POST /user/login without password", () => {
  test("login user", async () => {
    return request(app)
      .post("/user/login")
      .send({
        email: "vojtechpetrasek@gmail.com",
      })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("errors");
      });
  });
});

describe("POST /user/login with non-existing email", () => {
  test("login user", async () => {
    return request(app)
      .post("/user/login")
      .send({
        email: "vojtech.petrasek@gmail.com",
        password: "testtest",
      })
      .expect(401)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("errors");
      });
  });
});

describe("POST /user/login with wrong password", () => {
  test("login user", async () => {
    const password = "testtest";
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await User.create({
      lastname: "Petrásek",
      name: "Vojtěch",
      nickname: "Sonic",
      email: "vojtechpetrasek@gmail.com",
      password: hashedPassword,
    });

    return request(app)
      .post("/user/login")
      .send({
        email: "vojtechpetrasek@gmail.com",
        password: "random password",
      })
      .expect(401)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("errors");
      });
  });
});
