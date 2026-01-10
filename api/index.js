const app = require("../server");
const connectDB = require("../config/db");

// Connect to MongoDB before handling requests
connectDB();

// Export the Express app for Vercel serverless
module.exports = app;
