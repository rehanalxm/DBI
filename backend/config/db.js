const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // If Atlas connection fails, try connecting to local fallback for smooth development
    if (process.env.MONGO_URI.includes('cluster0.abcde.mongodb.net')) {
      console.log('Detected placeholder cluster URL. Attempting to fall back to local MongoDB at mongodb://127.0.0.1:27017/doxbank...');
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/doxbank');
        console.log(`Fallback MongoDB Connected: ${localConn.connection.host}`);
        return;
      } catch (localErr) {
        console.error(`Fallback MongoDB Connection Error: ${localErr.message}`);
      }
    }
    process.exit(1);
  }
};

module.exports = connectDB;
