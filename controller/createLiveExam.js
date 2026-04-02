// controllers/createLiveExam.js

const LiveExam = require("../models/liveExam");

const createLiveExam = async (req, res) => {
  try {
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
