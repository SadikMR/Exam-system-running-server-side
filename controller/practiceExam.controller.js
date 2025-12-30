// controllers/practiceExamSubmissionController.js

const mongoose = require("mongoose");
const PracticeExamSubmission = require("../models/practiceExamSubmission.model");

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && id.length === 24;
};

// 1. Submit practice exam
exports.submitPracticeExam = async (req, res) => {
  try {
    const submissionData = req.body;

    // Validate required fields
    if (
      !submissionData.examId ||
      !submissionData.userId ||
      !submissionData.username ||
      !submissionData.email
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: examId, userId, username, or email",
      });
    }

    // Validate ObjectIds
    if (
      !isValidObjectId(submissionData.examId) ||
      !isValidObjectId(submissionData.userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid examId or userId format",
      });
    }

    // Validate exam type specific fields
    const examType = submissionData.examSnapshot?.examType;
    const examTitle = submissionData.examSnapshot?.category;

    if (examTitle != "subject-wise") {
      if (examType === "HSC") {
        if (
          !submissionData.examSnapshot.examYear ||
          !submissionData.examSnapshot.hscGroup ||
          !submissionData.examSnapshot.hscBoard
        ) {
          return res.status(400).json({
            success: false,
            message: "HSC exams require: examYear, hscGroup, and hscBoard",
          });
        }
      } else if (examType === "BCS") {
        if (
          !submissionData.examSnapshot.examYear ||
          !submissionData.examSnapshot.batch
        ) {
          return res.status(400).json({
            success: false,
            message: "BCS exams require: examYear and batch",
          });
        }
      } else if (examType === "Bank") {
        if (!submissionData.examSnapshot.examYear) {
          return res.status(400).json({
            success: false,
            message: "Bank exams require: examYear",
          });
        }
      }
    }

    // Create submission
    const submission = new PracticeExamSubmission(submissionData);
    await submission.save();

    res.status(201).json({
      success: true,
      message: "Practice exam submitted successfully",
      submissionId: submission._id,
    });
  } catch (error) {
    console.error("❌ Submission error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to submit practice exam",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// 2. Get submissions by exam ID
exports.getSubmissionsByExamId = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!isValidObjectId(examId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid examId format",
      });
    }

    const submissions = await PracticeExamSubmission.find({ examId })
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
    });
  }
};

// 3. Get submissions by user ID
exports.getSubmissionsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId format",
      });
    }

    const submissions = await PracticeExamSubmission.find({ userId })
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
    });
  }
};

// 4. Get submission by exam ID and user ID
exports.getSubmissionByExamAndUser = async (req, res) => {
  try {
    const { examId, userId } = req.params;

    if (!isValidObjectId(examId) || !isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid examId or userId format",
      });
    }

    const submission = await PracticeExamSubmission.findOne({
      examId,
      userId,
    }).lean();

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
    });
  }
};

// 5. Get submissions by exam type (HSC/BCS/Bank)
exports.getSubmissionsByExamType = async (req, res) => {
  try {
    const { examType } = req.params;

    const validTypes = [
      "HSC",
      "BCS",
      "Bank",
      "Model Test",
      "Chapter Test",
      "Subject Test",
      "Other",
    ];
    if (!validTypes.includes(examType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid exam type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    const submissions = await PracticeExamSubmission.find({
      "examSnapshot.examType": examType,
    })
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
    });
  }
};
