// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const Question = require("./models/bcsquestions.model.js");
const bcsQuestionsRoute = require("./routes/bcsquestions.route.js");
const hscQuestionsRoute = require("./routes/hscquestions.route.js");
const bankQuestionsRoute = require("./routes/bankquestions.route.js");
const liveExamRoutes = require("./routes/liveExam");
const AdminRoutes = require("./routes/Admin/adminRoutes.js");
const UserRoutes = require("./routes/userRoutes.js");
const ProfileRoutes = require("./routes/profileRoutes.js");
const practiceExamSubmissionRoutes = require("./routes/practiceExamSubmission.route.js");
const connectDB = require("./config/db.js");

const { sendInvitationEmail } = require("./utils/emailService.js");
const demoExamScheduler = require("./services/demoExamScheduler");
const practiceExamScheduler = require("./services/practiceExamScheduler");

// Load environment variables from .env file
dotenv.config();

// Create an instance of Express
const app = express();

// Middleware to parse JSON bodies with increased size limit
app.use(
  cors({
    origin: [
      "http://localhost:5173", // local dev
      "https://exam-desk-bd.vercel.app", // current live frontend
    ],
    credentials: true,
  })
); // To allow cross-origin requests from your frontend
app.use(bodyParser.json({ limit: "20mb" })); // Parse incoming JSON requests with 20MB limit
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true })); // Parse URL-encoded data with 20MB limit

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

app.use("/user", UserRoutes);

// Profile and Verification Routes (NEW)
app.use("/api", ProfileRoutes);

// Fetch the BCS exam questions
app.use("/bcs-questions", bcsQuestionsRoute);
// Fetch the HSC exam questions
app.use("/hsc-questions", hscQuestionsRoute);
// Fetch the Bank exam questions
app.use("/bank-questions", bankQuestionsRoute);

//Live Exam Route
app.use("/liveExam", liveExamRoutes);

//practice exam submission
app.use("/practice-exam", practiceExamSubmissionRoutes);

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

app.use("/admin", AdminRoutes);

// Test email route
app.get("/test-email", async (req, res) => {
  try {
    await sendInvitationEmail(
      "your_email@gmail.com",
      `${process.env.FRONTEND_URL}/admin/register?token=test`
    );
    res.send("Email sent!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Email failed: " + err.message);
  }
});

// Only start the server if running locally (not on Vercel)
// Vercel will import and use the exported app directly
if (process.env.VERCEL !== "1") {
  // Connect to MongoDB for local development
  connectDB();

  // Create permanent demo exam (if it doesn't exist)
  const createPermanentDemoExam = async () => {
    const LiveExam = require("./models/liveExam");
    const demoExamQuestions = require("./data/demoExamQuestions");
    
    try {
      // Delete ALL existing demo exams (old scheduler-created ones)
      const deleteResult = await LiveExam.deleteMany({ isDemo: true });
      if (deleteResult.deletedCount > 0) {
        console.log(`🗑️  Deleted ${deleteResult.deletedCount} old demo exam(s)`);
      }
      
      console.log("🎯 Creating permanent demo exam...");
      
      // Create demo exam that's always available (far future end time)
      const farFuture = new Date();
      farFuture.setFullYear(farFuture.getFullYear() + 10); // 10 years from now
      
      const demoExam = new LiveExam({
        title: demoExamQuestions.title,
        examType: demoExamQuestions.examType,
        examMode: "live",
        duration: demoExamQuestions.duration,
        startTime: new Date(), // Always started
        endTime: farFuture, // Never ends
        password: null,
        isPremium: false,
        subjects: demoExamQuestions.subjects,
        status: "published",
        totalQuestions: demoExamQuestions.totalQuestions,
        tags: ["model-test"],
        passingScore: demoExamQuestions.passingScore,
        isDemo: true,
        demoInstanceId: "permanent-demo",
      });
      
      await demoExam.save();
      console.log("✅ Permanent demo exam created! Always available for users.");
      console.log(`   End Time: ${farFuture.toISOString()} (10 years from now)`);
    } catch (error) {
      console.error("❌ Error creating permanent demo exam:", error);
    }
  };
  
  createPermanentDemoExam();

  // Start practice exam scheduler
  practiceExamScheduler.start();

  // Start reminder email scheduler
  const { startReminderScheduler } = require("./services/reminderScheduler");
  startReminderScheduler();

  const PORT = process.env.SERVER_PORT || 5000;
  app.listen(PORT, () => {
    console.log("Render MongoDB URI:", process.env.MONGODB_URI);
    console.log(`🚀 Server is running on port ${PORT}`);
  });

  // Close MongoDB connection when shutting down the app
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("🛑 MongoDB connection closed");
    process.exit(0);
  });
}

// Export the Express app for Vercel serverless functions
module.exports = app;
