const mongoose = require('mongoose');

let mongod;

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // If MONGO_URI is not set or connection fails, use in-memory MongoDB
    if (!uri || uri.includes('127.0.0.1') || uri.includes('localhost')) {
      try {
        // Try connecting to local MongoDB first
        await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/feastfleet', {
          serverSelectionTimeoutMS: 3000
        });
        console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
        return;
      } catch (localErr) {
        console.log('⚠️  Local MongoDB not found. Starting in-memory database...');
        // Fall back to in-memory MongoDB
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        uri = mongod.getUri();
        console.log('✅ In-memory MongoDB started');
      }
    }

    await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);

    // Auto-seed if database is empty
    const Restaurant = require('../models/Restaurant');
    const count = await Restaurant.countDocuments();
    if (count === 0) {
      console.log('📦 Database empty — running auto-seed...');
      await require('../seed').seedDatabase();
    }

  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

// Cleanup on exit
process.on('SIGINT', async () => {
  if (mongod) await mongod.stop();
  process.exit(0);
});

module.exports = connectDB;
