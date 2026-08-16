// ==============================================================================
// FILE: config/db.js
// PURPOSE: Connects our Express backend to the MongoDB database using Mongoose.
// ==============================================================================

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Read the connection string from environment variables or use the default local URI
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/car_parking_db';
    
    // Attempt to connect to MongoDB with a 5-second timeout for quick feedback
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    console.log('💡 TIP: If you do not have MongoDB running locally, start MongoDB service or update MONGO_URI in server/.env');
  }
};

module.exports = connectDB;
