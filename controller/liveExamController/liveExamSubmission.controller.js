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

    // Check if submission already exists (for updating violations)
    let submission = await LiveExamSubmission.findOne({
      examId: submissionData.examId,
      userId: submissionData.userId,
    });

    if (submission) {
      // Update existing submission
      Object.assign(submission, submissionData);
      
      // Check if commonViolationCount >= 10 and ban if not already banned
      if (submission.commonViolationCount >= 10 && !submission.isBanned) {
        submission.isBanned = true;
        submission.banReason = "Exceeded maximum violation limit (10 violations)";
        submission.completionReason = "expelled";
      }
      
      await submission.save();
    } else {
      // Create new submission
      submission = new LiveExamSubmission(submissionData);
      
      // Check if commonViolationCount >= 10 and ban if not already banned
      if (submission.commonViolationCount >= 10 && !submission.isBanned) {
        submission.isBanned = true;
        submission.banReason = "Exceeded maximum violation limit (10 violations)";
        submission.completionReason = "expelled";
      }
      
      await submission.save();
    }

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

// @desc    Update violations for an exam submission
// @route   PUT /liveExam/submission/:examId/user/:userId/violations
// @access  Private
exports.updateViolations = async (req, res) => {
  try {
    const { examId, userId } = req.params;
    const { violations } = req.body;

    if (!violations) {
      return res.status(400).json({
        success: false,
        message: "Violations data is required",
      });
    }

    // Find or create submission
    let submission = await LiveExamSubmission.findOne({ examId, userId });

    if (!submission) {
      // Create new submission if it doesn't exist
      submission = new LiveExamSubmission({
        examId,
        userId,
        startedAt: new Date(),
        violations: {
          total: 0,
          fullscreenExit: 0,
          tabSwitching: 0,
          escapeKey: 0,
          windowBlur: 0,
          routeSwitching: 0,
        },
      });
    }

    // Update violations
    if (violations.fullscreenExit !== undefined) {
      submission.violations.fullscreenExit = violations.fullscreenExit;
    }
    if (violations.tabSwitching !== undefined) {
      submission.violations.tabSwitching = violations.tabSwitching;
    }
    if (violations.escapeKey !== undefined) {
      submission.violations.escapeKey = violations.escapeKey;
    }
    if (violations.windowBlur !== undefined) {
      submission.violations.windowBlur = violations.windowBlur;
    }
    if (violations.routeSwitching !== undefined) {
      submission.violations.routeSwitching = violations.routeSwitching;
    }
    if (violations.webcamViolation !== undefined) {
      submission.violations.webcamViolation = violations.webcamViolation;
    }

    // Calculate total violations
    submission.violations.total =
      submission.violations.fullscreenExit +
      submission.violations.tabSwitching +
      submission.violations.escapeKey +
      submission.violations.windowBlur +
      submission.violations.routeSwitching +
      submission.violations.webcamViolation;

    // Check if violations reached 3 - mark as banned
    if (submission.violations.total >= 3 && !submission.isBanned) {
      submission.isBanned = true;
      submission.banReason = "Exceeded maximum violation limit (3 violations)";
      submission.completionReason = "expelled";
    }

    await submission.save();

    res.status(200).json({
      success: true,
      message: "Violations updated successfully",
      violations: submission.violations,
      isBanned: submission.isBanned,
      totalViolations: submission.violations.total,
    });
  } catch (error) {
    console.error("Error updating violations:", error);
    res.status(500).json({
      success: false,
      message: "Error updating violations",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get violations for an exam submission
// @route   GET /liveExam/submission/:examId/user/:userId/violations
// @access  Private
exports.getViolations = async (req, res) => {
  try {
    const { examId, userId } = req.params;

    const submission = await LiveExamSubmission.findOne({ examId, userId })
      .select("violations isBanned banReason")
      .lean();

    if (!submission) {
      return res.status(200).json({
        success: true,
        violations: {
          total: 0,
          fullscreenExit: 0,
          tabSwitching: 0,
          escapeKey: 0,
          windowBlur: 0,
          routeSwitching: 0,
        },
        isBanned: false,
        totalViolations: 0,
      });
    }

    res.status(200).json({
      success: true,
      violations: submission.violations,
      isBanned: submission.isBanned || false,
      banReason: submission.banReason || null,
      totalViolations: submission.violations.total,
    });
  } catch (error) {
    console.error("Error fetching violations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching violations",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
