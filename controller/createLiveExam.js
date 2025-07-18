// controllers/createLiveExam.js

const LiveExam = require("../models/liveExam");

const createLiveExam = async (req, res) => {
  try {
    console.log("=== LIVE EXAM DATA RECEIVED ===");
    console.log("Request Body:", JSON.stringify(req.body, null, 2));
    console.log("================================");

    // Extract data from request body
    const {
      title,
      examType,
      examMode,
      duration,
      startTime,
      endTime,
      password,
      isPremium,
      subjects,
      createdAt,
      status,
      totalQuestions,
      tags,
      passingScore,
    } = req.body;

    // Log specific fields for better visibility
    console.log("📋 Exam Details:");
    console.log(`  Title: ${title}`);
    console.log(`  Type: ${examType}`);
    console.log(`  Mode: ${examMode}`);
    console.log(`  Duration: ${duration} minutes`);
    console.log(`  Start Time: ${startTime}`);
    console.log(`  End Time: ${endTime}`);
    console.log(`  Password Protected: ${password ? "Yes" : "No"}`);
    console.log(`  Premium: ${isPremium ? "Yes" : "No"}`);
    console.log(`  Total Questions: ${totalQuestions}`);
    console.log(`  Status: ${status}`);
    console.log(`  Created At: ${createdAt}`);
    console.log(`  Tags: ${tags?.join(", ") || "None"}`);
    console.log(`  Passing Score: ${passingScore || 40}%`);

    console.log("\n📚 Subjects:");
    subjects?.forEach((subject, index) => {
      console.log(`  ${index + 1}. ${subject.name}`);
      console.log(`     Question Count: ${subject.questionCount}`);
      console.log(`     Questions Added: ${subject.questions?.length || 0}`);

      if (subject.questions && subject.questions.length > 0) {
        console.log(
          `     Sample Question: ${subject.questions[0].text?.substring(0, 50)}...`
        );
      }
    });

    // Log questions in detail (optional - might be too much data)
    console.log("\n❓ Questions Details:");
    subjects?.forEach((subject, subjectIndex) => {
      console.log(`\n  Subject: ${subject.name}`);
      subject.questions?.forEach((question, questionIndex) => {
        console.log(`    Q${questionIndex + 1}: ${question.text}`);
        console.log(`    Options: ${question.options?.join(", ")}`);
        console.log(`    Correct Answer: ${question.correctAnswer}`);
        console.log(`    Difficulty: ${question.difficulty}`);
        console.log(`    Marks: ${question.marks || 1}`);
        console.log(`    Negative Marks: ${question.negativeMarks || 0}`);
        console.log(
          `    Explanation: ${question.explanation || "No explanation"}`
        );
        console.log("    ---");
      });
    });

    // Create new live exam instance
    const liveExam = new LiveExam({
      title,
      examType,
      examMode,
      duration,
      startTime,
      endTime,
      password,
      isPremium,
      subjects,
      status,
      totalQuestions,
      tags,
      passingScore,
    });

    // Save to database
    const savedExam = await liveExam.save();

    console.log("✅ Live exam saved successfully to database");
    console.log(`📝 Exam ID: ${savedExam._id}`);
    console.log(`🎯 Total Questions Saved: ${savedExam.totalQuestions}`);

    // Return success response
    res.status(201).json({
      success: true,
      message: "Live exam created successfully",
      data: {
        id: savedExam._id,
        title: savedExam.title,
        examType: savedExam.examType,
        examMode: savedExam.examMode,
        duration: savedExam.duration,
        startTime: savedExam.startTime,
        endTime: savedExam.endTime,
        totalQuestions: savedExam.totalQuestions,
        status: savedExam.status,
        tags: savedExam.tags,
        passingScore: savedExam.passingScore,
        createdAt: savedExam.createdAt,
        subjects: savedExam.subjects,
      },
    });
  } catch (error) {
    console.error("❌ Error creating live exam:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate exam detected",
        error: "An exam with similar details already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create live exam",
      error: error.message,
    });
  }
};

module.exports = { createLiveExam };
