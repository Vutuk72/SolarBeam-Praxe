const { MongoClient, ObjectId } = require("mongodb");

let mongoUrl = process.env.MONGO_URI;
let mongoDbName = process.env.MONGO_DB;
let mongoCollectionName = process.env.MONGO_DEVICES_COLLECTION;

if (!mongoUrl || !mongoDbName || !mongoCollectionName) {
  throw new Error(
    "Environment variables MONGO_URI, MONGO_DB, and MONGO_DEVICES_COLLECTION must be set"
  );
}

const client = new MongoClient(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToDatabase() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  const db = client.db(mongoDbName);
  const collection = db.collection(mongoCollectionName);
  return { db, collection };
}

async function getActiveDevices(userId) {
  try {
    const { collection } = await connectToDatabase();
    const result = await collection
      .find({ owner_id: userId, archived: false })
      .toArray();
    return result;
  } catch (err) {
    console.error("getActiveDevices error: ", err);
    throw err;
  }
}

async function getArchivedDevices(userId) {
  try {
    const { collection } = await connectToDatabase();
    const result = await collection
      .find({ owner_id: userId, archived: true })
      .toArray();
    return result;
  } catch (err) {
    console.error("getArchivedDevices error: ", err);
    throw err;
  }
}

async function getSharedDevices(userId) {
  try {
    const { collection } = await connectToDatabase();
    const result = await collection
      .find({ shared_users: { $elemMatch: { id: userId } } })
      .toArray();
    return result;
  } catch (err) {
    console.error("getSharedDevices error: ", err);
    throw err;
  }
}

async function getDevice(deviceId) {
  try {
    const { collection } = await connectToDatabase();
    const result = await collection.findOne({ _id: new ObjectId(deviceId) });
    return result;
  } catch (err) {
    console.error("getDevice error: ", err);
    throw err;
  }
}

async function getDeviceBySN(deviceSN) {
  try {
    const { collection } = await connectToDatabase();
    const result = await collection.findOne({ sn: deviceSN });
    return result;
  } catch (err) {
    console.error("getDeviceBySN error: ", err);
    throw err;
  }
}

async function deleteDevice(deviceId) {
  try {
    const { collection } = await connectToDatabase();
    const result = await collection.deleteOne({ _id: new ObjectId(deviceId) });
    return result;
  } catch (err) {
    console.error("deleteDevice error: ", err);
    throw err;
  }
}

async function updateDevice(deviceId, updateData) {
  try {
    const { collection } = await connectToDatabase();

    // Check if updateData is already formatted correctly with operators like $set
    if (
      !updateData.hasOwnProperty("$set") &&
      !updateData.hasOwnProperty("$inc") &&
      !updateData.hasOwnProperty("$unset")
    ) {
      // Wrap updateData in $set if it doesn't contain any operators
      updateData = { $set: updateData };
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(deviceId) },
      updateData
    );
    return result;
  } catch (err) {
    console.error("updateDevice error: ", err);
    throw err;
  }
}

async function createDevice(device) {
  try {
    const { collection } = await connectToDatabase();
    const result = await collection.insertOne(device);
    return result;
  } catch (err) {
    console.error("createDevice error: ", err);
    throw err;
  }
}

async function setBoilerFlag(deviceId, flag) {
  try {
    const { collection } = await connectToDatabase();
    const result = await collection.updateOne(
      { _id: new ObjectId(deviceId) },
      { $set: { "config.boiler_flag": flag } }
    );
    return result;
  } catch (err) {
    console.error("setBoilerFlag error: ", err);
    throw err;
  }
}

async function setBatteryFlag(deviceId, flag) {
  try {
    const { collection } = await connectToDatabase();
    const result = await collection.updateOne(
      { _id: new ObjectId(deviceId) },
      { $set: { "config.battery_flag": flag } }
    );
    return result;
  } catch (err) {
    console.error("setBatteryFlag error: ", err);
    throw err;
  }
}

async function setTimeFlag(deviceId, flag) {
  try {
    const { collection } = await connectToDatabase();
    const result = await collection.updateOne(
      { _id: new ObjectId(deviceId) },
      { $set: { "config.time_flag": flag } }
    );
    return result;
  } catch (err) {
    console.error("setTimeFlag error: ", err);
    throw err;
  }
}

async function setPowerData(
  deviceId,
  grid_power,
  L1_power,
  L2_power,
  L3_power
) {
  try {
    const { collection } = await connectToDatabase();
    const result = await collection.updateOne(
      { _id: new ObjectId(deviceId) },
      {
        $set: {
          "config.export": grid_power,
          "config.L1": L1_power,
          "config.L2": L2_power,
          "config.L3": L3_power,
        },
      }
    );
    return result;
  } catch (err) {
    console.error("setPowerData error: ", err);
    throw err;
  }
}

async function setBatteryData(deviceId, battery_soc) {
  try {
    const { collection } = await connectToDatabase();
    const result = await collection.updateOne(
      { _id: new ObjectId(deviceId) },
      {
        $set: {
          "config.battery_soc": battery_soc,
        },
      }
    );
    return result;
  } catch (err) {
    console.error("setBatteryData error: ", err);
    throw err;
  }
}

async function getDeviceBySLCSN(slcSn) {
  try {
    const { collection } = await connectToDatabase();
    const result = await collection.findOne({ slcs: { $in: [slcSn] } });
    return result;
  } catch (err) {
    console.error("getDeviceBySLCSN error: ", err);
    throw err;
  }
}

process.on("SIGINT", async () => {
  await client.close();
  process.exit(0);
});

module.exports = {
  createDevice,
  updateDevice,
  getActiveDevices,
  getArchivedDevices,
  getSharedDevices,
  deleteDevice,
  getDevice,
  getDeviceBySN,
  setBoilerFlag,
  getDeviceBySLCSN,
  setPowerData,
  setBatteryData,
  setBatteryFlag,
  setTimeFlag,
};
