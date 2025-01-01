// setup.js
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

export const setupTestDatabase = async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: { timeout: 20000 }
  });

  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  return mongoServer;
}

export const closeTestDatabase = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}