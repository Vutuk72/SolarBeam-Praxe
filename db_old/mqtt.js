const { MongoClient, ObjectId } = require("mongodb");

let mongoUrl = process.env.MONGO_URI;
let mongoDbName = process.env.MONGO_DB;
let mongoCollectionName = process.env.MONGO_MQTT_COLLECTION;

const client = new MongoClient(mongoUrl);

const db = client.db(mongoDbName);
const collection = db.collection(mongoCollectionName);

async function registerDevice(device) {
  try {
    await client.connect();
    const result = await collection.insertOne(device);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
}

async function getDevice(deviceId) {
  try {
    await client.connect();
    const result = await collection.findOne({ username: deviceId });
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
}

module.exports = { registerDevice, getDevice };
