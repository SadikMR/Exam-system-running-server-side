// controller/submitLiveExam.js
const mongoose = require("mongoose");

const LiveExamSubmission = require("../models/LiveExamSubmission");

const submitLiveExam = async (req, res) => {
  try {
    const submissionData = req.body;
    submissionData.examId = new mongoose.Types.ObjectId(submissionData.examId);
    submissionData.userId = new mongoose.Types.ObjectId(submissionData.userId);

    // Validate required fields
    const requiredFields = [
      "examId",
      "examTitle",
      "userId",
      "username",
      "examDuration",
      "timeConsumed",
      "timeRemaining",
      "totalScore",
      "totalCorrect",
      "totalWrong",
      "totalSkipped",
      "totalQuestions",
      "percentage",
      "answers",
      "questionDetails",
      "completionReason",
      "device",
    ];

    for (const field of requiredFields) {
      if (
        submissionData[field] === undefined ||
        submissionData[field] === null
      ) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`,
        });
      }
    }

    // Check if user already submitted for this exam
    const existingSubmission = await LiveExamSubmission.findOne({
      examId: submissionData.examId,
      userId: submissionData.userId,
    });

    if (existingSubmission) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted this exam",
        submissionId: existingSubmission._id,
      });
    }

    // Create new submission
    const submission = new LiveExamSubmission(submissionData);
    const savedSubmission = await submission.save();

    res.status(201).json({
      success: true,
      message: "Exam submitted successfully",
      submissionId: savedSubmission._id,
      data: {
        submissionId: savedSubmission._id,
        totalScore: savedSubmission.totalScore,
        percentage: savedSubmission.percentage,
        submissionTime: savedSubmission.submissionTime,
      },
    });
  } catch (error) {
    console.error("Error submitting exam:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to submit exam",
      error: error.message,
    });
  }
};

const getSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await LiveExamSubmission.findById(submissionId)
      .populate("examId", "title code")
      .populate("userId", "username email");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch submission",
      error: error.message,
    });
  }
};

const getUserSubmissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const submissions = await LiveExamSubmission.find({ userId })
      .populate("examId", "title code")
      .sort({ submissionTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LiveExamSubmission.countDocuments({ userId });

    res.json({
      success: true,
      data: submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user submissions",
      error: error.message,
    });
  }
};

const getExamSubmissions = async (req, res) => {
  try {
    const { examId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const submissions = await LiveExamSubmission.find({ examId })
      .populate("userId", "username email")
      .sort({ submissionTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LiveExamSubmission.countDocuments({ examId });

    res.json({
      success: true,
      data: submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch exam submissions",
      error: error.message,
    });
  }
};

module.exports = {
  submitLiveExam,
  getSubmission,
  getUserSubmissions,
  getExamSubmissions,
};
