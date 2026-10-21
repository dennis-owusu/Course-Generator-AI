import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;
let isConnected = false;

export async function connectTestDB() {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-do-not-use-in-production';

  if (isConnected) return;

  const testUri = process.env.MONGODB_TEST_URI;
  if (testUri) {
    await mongoose.connect(testUri);
    isConnected = true;
    return;
  }

  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create({
      instance: { launchTimeout: 120000 },
    });
  }
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  await mongoose.connect(uri);
  isConnected = true;
}

export async function disconnectTestDB() {
  await mongoose.disconnect();
  isConnected = false;
  if (mongoServer) {
    try { await mongoServer.stop(); } catch (err) { console.error(err); }
    mongoServer = null;
  }
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}
