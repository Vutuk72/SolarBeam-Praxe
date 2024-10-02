const mongoose = require("mongoose");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = require("../main");
require("dotenv").config();

const User = require("../models/users.js");
const SLCDevice = require("../models/SLC_devices.js");

const jwtSecretKey = process.env.JWT_SECRET_KEY;
const jwtExpireTime = process.env.JWT_EXPIRE_TIME;
const saltRounds = Number(process.env.SALT_ROUNDS);

let token1;
let token2;
let token3;
let user_id1;
let user_id2;
let user_id3;

beforeAll(async () => {
  // Ensure the database connection is established
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: process.env.MONGO_DB,
    });
  }

  // Clear User collection
  await User.deleteMany({});

  // Create test user and generate JWT token
  const password = await bcrypt.hash("123456", saltRounds);
  const user = await User.create({
    name: "Test",
    lastname: "User",
    email: "test@test1.com", // Fixed typo in the email address
    password: password,
  });
  user_id1 = user._id;
  // console.log("User created:", user._id);
  token1 = jwt.sign({ _id: user._id }, jwtSecretKey, {
    expiresIn: jwtExpireTime,
  });

  const user2 = await User.create({
    name: "Test",
    lastname: "Admin",
    email: "test@test2.com", // Fixed typo in the email address
    password: password,
    role: ["admin"],
  });
  user_id2 = user2._id;
  // console.log("User created:", user._id);
  token2 = jwt.sign({ _id: user2._id }, jwtSecretKey, {
    expiresIn: jwtExpireTime,
  });

  const user3 = await User.create({
    name: "Test",
    lastname: "dump",
    email: "test@test3.com", // Fixed typo in the email address
    password: password,
    role: [""],
  });
  user_id3 = user3._id;
  // console.log("User created:", user._id);
  token3 = jwt.sign({ _id: user3._id }, jwtSecretKey, {
    expiresIn: jwtExpireTime,
  });
});

beforeEach(async () => {
  await SLCDevice.deleteMany({}); // Clear all users in the collection
});

afterAll(async () => {
  //await User.deleteMany({});
  //await SLCDevice.deleteMany({});
  await mongoose.connection.close();
});

describe("POST /device/create", () => {
  test("create SLC device", async () => {
    // Ensure the token is available before the request
    expect(token1).toBeDefined();

    const res = await request(app)
      .post("/device/create")
      .set("Authorization", `Bearer ${token1}`)
      .set("Content-Type", "application/json") // Ensure content type is set correctly
      .send({
        name: "SLC Device",
        sn: "123456",
        type: "SLC",
      });

    // Check if the response status is 201 (Created)
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("sys");
    expect(res.body.sys.rev).toBe(0);
    expect(res.body.sys).toHaveProperty("cts");
    expect(res.body.sys).toHaveProperty("mts");
    expect(res.body).toHaveProperty("config");
    expect(res.body.config).toHaveProperty("time");
    expect(res.body.config.time).toHaveProperty("window_1");
    expect(res.body.config.time.window_1).toHaveProperty("start_time");
    expect(res.body.config.time.window_1).toHaveProperty("end_time");
    expect(res.body.config.time.window_1).toHaveProperty("temp");
    expect(res.body.config.time.window_1.enabled).toBe(true);
    expect(res.body.config.time.window_2).toHaveProperty("start_time");
    expect(res.body.config.time.window_2).toHaveProperty("end_time");
    expect(res.body.config.time.window_2).toHaveProperty("temp");
    expect(res.body.config.time.window_2.enabled).toBe(false);
    expect(res.body.config.time.window_3).toHaveProperty("start_time");
    expect(res.body.config.time.window_3).toHaveProperty("end_time");
    expect(res.body.config.time.window_3).toHaveProperty("temp");
    expect(res.body.config.time.window_3.enabled).toBe(false);
    expect(res.body.config).toHaveProperty("batery");
    expect(res.body.config.batery).toHaveProperty("min_soc");
    expect(res.body.config.batery).toHaveProperty("max_soc");
    expect(res.body.config.batery).toHaveProperty("temp");
    expect(res.body.config.batery).toHaveProperty("enabled");
    expect(res.body.config.batery).toHaveProperty("flag");
    expect(res.body.config).toHaveProperty("export");
    expect(res.body.config.export).toHaveProperty("power");
    expect(res.body.config.export).toHaveProperty("temp");
    expect(res.body.config.export.flag_l1).toBe(false);
    expect(res.body.config.export.flag_l2).toBe(false);
    expect(res.body.config.export.flag_l3).toBe(false);
    expect(res.body.config.export.flag).toBe(false);
    expect(res.body.config.export.enabled).toBe(false);
    expect(res.body.config).toHaveProperty("type");
    expect(res.body).toHaveProperty("owner_id");
    // TODO: fix
    //expect(res.body.owner_id).toBe(user_id);
    expect(res.body.archived).toBe(false);
    expect(res.body).toHaveProperty("shared_users");
    expect(res.body).toHaveProperty("instaler_id");
    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("name");
    expect(res.body.type).toBe("SLC");
    expect(res.body).toHaveProperty("sn");
  });

  test("create SLC device", async () => {
    expect(token1).toBeDefined();
    const res = await request(app)
      .post("/device/create")
      .set("Authorization", `Bearer ${token1}`)
      .set("Content-Type", "application/json")
      .send({
        name: "SLC Device",
        sn: "123456",
        type: 5,
      });
    expect(res.statusCode).toBe(400);
  });

  test("create SLC device", async () => {
    expect(token1).toBeDefined();
    const res = await request(app)
      .post("/device/create")
      .set("Authorization", `Bearer ${token1}`)
      .set("Content-Type", "application/json")
      .send({
        name: "SLC Device",
        sn: "123456",
        type: "test",
      });
    expect(res.statusCode).toBe(500);
  });

  test("create SLC device", async () => {
    expect(token1).toBeDefined();
    const res = await request(app)
      .post("/device/create")
      .set("Authorization", `Bearer ${token1}`)
      .set("Content-Type", "application/json")
      .send({
        name: "SLC Device",
        sn: "123456",
        type: "",
      });
    expect(res.statusCode).toBe(400);
  });

  test("create SLC device", async () => {
    expect(token1).toBeDefined();
    const res = await request(app)
      .post("/device/create")
      .set("Authorization", `Bearer ${token1}`)
      .set("Content-Type", "application/json")
      .send({
        name: "SLC Device",
        sn: 5,
        type: "SLC",
      });
    expect(res.statusCode).toBe(400);
  });

  test("create SLC device", async () => {
    expect(token1).toBeDefined();
    const res = await request(app)
      .post("/device/create")
      .set("Authorization", `Bearer ${token1}`)
      .set("Content-Type", "application/json")
      .send({
        name: "SLC Device",
        sn: "[]",
        type: "SLC",
      });
    expect(res.statusCode).toBe(400);
  });

  test("create SLC device", async () => {
    expect(token1).toBeDefined();
    const res = await request(app)
      .post("/device/create")
      .set("Authorization", `Bearer ${token1}`)
      .set("Content-Type", "application/json")
      .send({
        name: "SLC Device",
        sn: "",
        type: "SLC",
      });
    expect(res.statusCode).toBe(400);
  });
  test("create SLC device", async () => {
    expect(token1).toBeDefined();
    const res = await request(app)
      .post("/device/create")
      .set("Authorization", `Bearer ${token1}`)
      .set("Content-Type", "application/json")
      .send({
        name: "",
        sn: "123456",
        type: "SLC",
      });
    expect(res.statusCode).toBe(400);
  });

  test("create SLC device", async () => {
    expect(token1).toBeDefined();
    const res = await request(app)
      .post("/device/create")
      .set("Authorization", `Bearer ${token1}`)
      .set("Content-Type", "application/json")
      .send({
        name: 5,
        sn: "123456",
        type: "SLC",
      });
    expect(res.statusCode).toBe(400);
  });
});

describe("PUT /device/:id", () => {
  test("update device", async () => {
    expect(token1).toBeDefined();
    const device = await SLCDevice.create({
      name: "tesxt",
      type: "SLC",
      sn: "l23456789102",
      owner_id: user_id1,
    });

    return request(app)
      .put(`/device/${device._id}`)
      .set("Authorization", `Bearer ${token1}`)
      .set("Content-Type", "application/json") // Ensure content type is set correctly
      .send({
        config: {
          time: {
            window_1: {
              start_time: "8:00",
              end_time: "15:00",
              temp: 40,
              enabled: false,
            },
            window_2: {
              start_time: "8:00",
              end_time: "18:00",
              temp: 40,
              enabled: true,
            },
            window_3: {
              start_time: "8:00",
              end_time: "17:00",
              temp: 40,
              enabled: true,
            },
          },
          batery: {
            min_soc: 90,
            max_soc: 1000,
            temp: 60,
            enabled: true,
            flag: true,
          },
          export: {
            power: 2100,
            temp: 60,
            flag_l1: true,
            flag_l2: true,
            flag_l3: true,
            flag: true,
            enabled: false,
          },
          type: 3,
        },
        owner_id: "owner_id",
        archived: "false",
        instaler_id: "instaler_iddd",
        name: "test3",
        type: "SLC",
      })
      .then((res) => {
        // expect(res).toHaveProperty("sys");
        expect(res.body.sys).toHaveProperty("rev");
        expect(res.body.sys).toHaveProperty("cts");
        expect(res.body.sys).toHaveProperty("mts");
        expect(res.body).toHaveProperty("config");
        expect(res.body.config).toHaveProperty("time");
        expect(res.body.config.time).toHaveProperty("window_1");
        expect(res.body.config.time.window_1).toHaveProperty("start_time");
        expect(res.body.config.time.window_1).toHaveProperty("end_time");
        expect(res.body.config.time.window_1).toHaveProperty("temp");
        expect(res.body.config.time.window_1.enabled).toBe(false);
        expect(res.body.config.time.window_2).toHaveProperty("start_time");
        expect(res.body.config.time.window_2).toHaveProperty("end_time");
        expect(res.body.config.time.window_2).toHaveProperty("temp");
        expect(res.body.config.time.window_2.enabled).toBe(true);
        expect(res.body.config.time.window_3).toHaveProperty("start_time");
        expect(res.body.config.time.window_3).toHaveProperty("end_time");
        expect(res.body.config.time.window_3).toHaveProperty("temp");
        expect(res.body.config.time.window_3.enabled).toBe(true);
        expect(res.body.config).toHaveProperty("batery");
        expect(res.body.config.batery).toHaveProperty("min_soc");
        expect(res.body.config.batery).toHaveProperty("max_soc");
        expect(res.body.config.batery).toHaveProperty("temp");
        expect(res.body.config.batery.enabled).toBe(true);
        expect(res.body.config.batery.flag).toBe(true);
        expect(res.body.config).toHaveProperty("export");
        expect(res.body.config.export).toHaveProperty("power");
        expect(res.body.config.export).toHaveProperty("temp");
        expect(res.body.config.export.flag_l1).toBe(true);
        expect(res.body.config.export.flag_l2).toBe(true);
        expect(res.body.config.export.flag_l3).toBe(true);
        expect(res.body.config.export.flag).toBe(true);
        expect(res.body.config.export.enabled).toBe(false);
        expect(res.body.config).toHaveProperty("type");
        expect(res.body).toHaveProperty("owner_id");
        expect(res.body.archived).toBe(false);
        expect(res.body).toHaveProperty("shared_users");
        expect(res.body).toHaveProperty("instaler_id");
        expect(res.body).toHaveProperty("_id");
        expect(res.body).toHaveProperty("name");
        expect(res.body.type).toBe("SLC");
        expect(res.body).toHaveProperty("sn");
      });
  });
});

describe("Delete /device/:id", () => {
  test("delete SLC device", async () => {
    // Ensure the token is available before the request
    expect(token1).toBeDefined();
    const device = await SLCDevice.create({
      name: "tesxt",
      type: "SLC",
      sn: "l23456789102",
      owner_id: user_id1,
    });

    const res = await request(app)
      .delete(`/device/${device._id}`)
      .set("Authorization", `Bearer ${token1}`)
      .set("Content-Type", "application/json");
    expect(res.status).toBe(200);
  });

  test("delete SLC device", async () => {
    // Ensure the token is available before the request
    expect(token1).toBeDefined();
    const device = await SLCDevice.create({
      name: "tesxt",
      type: "SLC",
      sn: "l23456789102",
      owner_id: user_id2,
    });

    const res = await request(app)
      .delete(`/device/${device._id}`)
      .set("Authorization", `Bearer ${token1}`)
      .set("Content-Type", "application/json");
    expect(res.status).toBe(403);
  });
  test("delete SLC device", async () => {
    // Ensure the token is available before the request
    expect(token2).toBeDefined();
    const device = await SLCDevice.create({
      name: "tesxt",
      type: "SLC",
      sn: "l23456789102",
      owner_id: user_id1,
    });

    const res = await request(app)
      .delete(`/device/${device._id}`)
      .set("Authorization", `Bearer ${token2}`)
      .set("Content-Type", "application/json");
    expect(res.status).toBe(200);
  });
  test("delete SLC device", async () => {
    // Ensure the token is available before the request
    expect(token3).toBeDefined();
    const device = await SLCDevice.create({
      name: "tesxt",
      type: "SLC",
      sn: "l23456789102",
      owner_id: user_id2,
    });

    const res = await request(app)
      .delete(`/device/${device._id}`)
      .set("Authorization", `Bearer ${token3}`)
      .set("Content-Type", "application/json");
    expect(res.status).toBe(403);
  });
});

describe("get/device/:id", () => {
  test("get SLC device", async () => {
    // Ensure the token is available before the request
    expect(token1).toBeDefined();
    const device = await SLCDevice.create({
      name: "tesxt",
      type: "SLC",
      sn: "l23456789102",
      owner_id: user_id1,
    });

    const res = await request(app)
      .get(`/device/${device._id}`)
      .set("Authorization", `Bearer ${token1}`);
    // .set("Content-Type", "application/json");
    expect(res.status).toBe(200);
  });

  test("get SLC device", async () => {
    // Ensure the token is available before the request
    expect(token1).toBeDefined();
    const device = await SLCDevice.create({
      name: "tesxt",
      type: "SLC",
      sn: "l23456789102",
      owner_id: user_id2,
    });

    const res = await request(app)
      .get(`/device/${device._id}`)
      .set("Authorization", `Bearer ${token1}`);
    // .set("Content-Type", "application/json");
    expect(res.status).toBe(403);
  });

  test("get SLC device", async () => {
    // Ensure the token is available before the request
    expect(token2).toBeDefined();
    const device = await SLCDevice.create({
      name: "tesxt",
      type: "SLC",
      sn: "l23456789102",
      owner_id: user_id1,
    });

    const res = await request(app)
      .get(`/device/${device._id}`)
      .set("Authorization", `Bearer ${token2}`);
    // .set("Content-Type", "application/json");
    expect(res.status).toBe(200);
  });

  test("get SLC device", async () => {
    // Ensure the token is available before the request
    expect(token3).toBeDefined();
    const device = await SLCDevice.create({
      name: "tesxt",
      type: "SLC",
      sn: "l23456789102",
      owner_id: user_id1,
    });

    const res = await request(app)
      .get(`/device/${device._id}`)
      .set("Authorization", `Bearer ${token3}`);
    // .set("Content-Type", "application/json");
    expect(res.status).toBe(403);
  });
});

describe("get/devices", () => {
  test("get SLC device", async () => {
    // Ensure the token is available before the request
    expect(token1).toBeDefined();
    const device = await SLCDevice.create({
      name: "tesxt",
      type: "SLC",
      sn: "l23456789102",
      owner_id: user_id1,
    });
    const device2 = await SLCDevice.create({
      name: "tesxt",
      type: "SLC",
      sn: "l23456789102",
      share_user: user_id1,
    });
    const device3 = await SLCDevice.create({
      name: "tesxt",
      type: "SLC",
      sn: "l23456789102",
      owner_id: user_id1,
      shared_user: user_id2,
    });

    const res = await request(app)
      .get(`/devices`)
      .set("Authorization", `Bearer ${token1}`);
    // .set("Content-Type", "application/json");
    expect(res.status).toBe(200);
  });
});
