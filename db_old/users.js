const { MongoClient, ObjectId } = require("mongodb");

let mongoUrl = process.env.MONGO_URI;
let mongoDbName = process.env.MONGO_DB;
let mongoCollectionName = process.env.MONGO_USERS_COLLECTION;

const client = new MongoClient(mongoUrl);

const db = client.db(mongoDbName);
const collection = db.collection(mongoCollectionName);

async function getUserByEmail(email) {
  try {
    await client.connect();
    const result = await collection.findOne({ email: email });
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
}

async function createUser(user) {
  try {
    await client.connect();
    const result = await collection.insertOne(user);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
}

module.exports = { getUserByEmail, createUser };
