// controllers/liveExamSubmissionController.js

const LiveExamSubmission = require("../../models/liveExamSubmission.model");

// @desc    Submit exam
// @route   POST /api/exam-submissions
// @access  Private
exports.submitExam = async (req, res) => {
  try {
    const submissionData = req.body;

    // Add IP address from request
    const ipAddress =
      req.ip ||
      req.connection?.remoteAddress ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      "Unknown";

    submissionData.metadata = {
      ...submissionData.metadata,
      ipAddress: ipAddress,
    };

    // Create and save submission
    const submission = new LiveExamSubmission(submissionData);
    await submission.save();

    res.status(201).json({
      success: true,
      message: "Exam submitted successfully",
      submissionId: submission._id,
    });
  } catch (error) {
    console.error("Submission error:", error);

    // Handle duplicate submission (unique index violation)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted this exam",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      message: "Failed to submit exam",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get submission by submission ID
// @route   GET /api/liveExam/submission/:submissionId
// @access  Private
exports.getSubmissionById = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await LiveExamSubmission.findById(submissionId)
      .populate("examId", "title examType duration tags")
      .lean();

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error("Error fetching submission:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching submission",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get all submissions for a specific exam
// @route   GET /api/exam-submissions/exam/:examId
// @access  Private/Admin
exports.getSubmissionsByExamId = async (req, res) => {
  try {
    const { examId } = req.params;

    const submissions = await LiveExamSubmission.find({ examId })
      .populate("userId", "name email username")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching submissions",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get submission by exam ID and user ID
// @route   GET /api/exam-submissions/exam/:examId/user/:userId
// @access  Private
exports.getSubmissionByExamAndUser = async (req, res) => {
  try {
    const { examId, userId } = req.params;

    const submission = await LiveExamSubmission.findOne({ examId, userId })
      .populate("examId", "title examType duration tags")
      .lean();

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error("Error fetching submission:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching submission",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get all submissions by user ID
// @route   GET /api/exam-submissions/user/:userId
// @access  Private
exports.getSubmissionsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const submissions = await LiveExamSubmission.find({ userId })
      .populate("examId", "title examType duration tags")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching submissions",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
