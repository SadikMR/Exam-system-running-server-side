// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const Question = require("./models/bcsquestions.model.js");
const registrationRoute = require("./routes/registration.route");
const adminRoute = require("./routes/admin.route.js");
const bcsQuestionsRoute = require("./routes/bcsquestions.route.js");
const hscQuestionsRoute = require("./routes/hscquestions.route.js");
const liveExamRoutes = require("./routes/liveExam");

// Load environment variables from .env file
dotenv.config();

// Create an instance of Express
const app = express();

// Middleware to parse JSON bodies
app.use(cors()); // To allow cross-origin requests from your frontend
app.use(bodyParser.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true }));

// MongoDB connection using Mongoose
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1); // Exit with failure
  }
};

// Connect to MongoDB
connectDB();

// Define a simple route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Route to get all questions
app.get("/api/questions", async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching questions", error });
  }
});

// For registration, login
app.use("/api/auth", registrationRoute);
// For admin
app.use("/admin", adminRoute);
// Fetch the BCS exam questions
app.use("/bcs-questions", bcsQuestionsRoute);
// Fetch the HSC exam questions
app.use("/hsc-questions", hscQuestionsRoute);

//Live Exam Route
app.use("/liveExam", liveExamRoutes);

// Save BCS questions
app.post("/api/questions", async (req, res) => {
  const { bcsYear, questions } = req.body;

  try {
    console.log("came\n");
    const formattedQuestions = Object.entries(questions).flatMap(
      ([subject, qs]) => qs.map((q) => ({ ...q, subject, bcsYear }))
    );

    await Question.insertMany(formattedQuestions);
    res.status(201).send({ message: "Questions saved successfully!" });
  } catch (error) {
    console.error("❌ Error saving questions:", error);
    res.status(500).send({ error: "Failed to save questions." });
  }
});

// Start the server
const PORT = process.env.SERVER_PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// Close MongoDB connection when shutting down the app
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🛑 MongoDB connection closed");
  process.exit(0);
});
