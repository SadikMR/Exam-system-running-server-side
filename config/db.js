const mongoose = require("mongoose");

// Cache the MongoDB connection to reuse across serverless function invocations
let cachedConnection = null;

/**
 * Connect to MongoDB with connection caching for serverless environments
 * This prevents reconnecting on every serverless function invocation
 */
const connectDB = async () => {
  // If we already have a connection and it's ready, reuse it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("✅ Using cached MongoDB connection");
    return cachedConnection;
  }

  try {
    // Create new connection
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Optimize for serverless
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log("✅ MongoDB Connected");
    
    // Cache the connection
    cachedConnection = connection;
    
    return connection;
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    throw error;
  }
};

module.exports = connectDB;
