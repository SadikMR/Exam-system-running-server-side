// controller/practiceExamController.js

const LiveExam = require("../models/liveExam");
const LiveExamRegistration = require("../models/liveExamRegistration.model");
const practiceExamScheduler = require("../services/practiceExamScheduler");

/**
 * Get current practice exam
 * GET /api/live-exam/practice/current
 */
const getCurrentPracticeExam = async (req, res) => {
  try {
    const userId = req.user?.id;
    const now = new Date();

    // Get the next upcoming practice exam
    const practiceExam = await LiveExam.findOne({
      isPractice: true,
      startTime: { $gt: now },
      status: "published",
    }).sort({ startTime: 1 });

    if (!practiceExam) {
      return res.status(404).json({
        success: false,
        message: "No practice exam available at the moment",
      });
    }

    // Check if user is registered
    let isRegistered = false;
    if (userId) {
      const registration = await LiveExamRegistration.findOne({
        userId: userId,
        examId: practiceExam._id,
      });
      isRegistered = !!registration;
    }

    res.status(200).json({
      success: true,
      data: practiceExam,
      isRegistered: isRegistered,
      message: "Current practice exam retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching current practice exam:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch current practice exam",
      error: error.message,
    });
  }
};

/**
 * Register for practice exam
 * POST /api/live-exam/practice/register
 */
const registerForPracticeExam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { examId } = req.body;

    // Check if exam exists and is a practice exam
    const exam = await LiveExam.findById(examId);
    if (!exam || !exam.isPractice) {
      return res.status(404).json({
        success: false,
        message: "Practice exam not found",
      });
    }

    // Check if already registered
    const existingRegistration = await LiveExamRegistration.findOne({
      userId: userId,
      examId: examId,
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this exam",
      });
    }

    // Create registration
    const registration = new LiveExamRegistration({
      userId: userId,
      examId: examId,
      registeredAt: new Date(),
    });

    await registration.save();

    res.status(201).json({
      success: true,
      data: registration,
      message: "Successfully registered for practice exam",
    });
  } catch (error) {
    console.error("❌ Error registering for practice exam:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register for practice exam",
      error: error.message,
    });
  }
};

/**
 * Check practice exam registration
 * GET /api/live-exam/practice/registration/:examId
 */
const checkPracticeRegistration = async (req, res) => {
  try {
    const userId = req.user.id;
    const { examId } = req.params;

    const registration = await LiveExamRegistration.findOne({
      userId: userId,
      examId: examId,
    });

    res.status(200).json({
      success: true,
      isRegistered: !!registration,
      data: registration,
    });
  } catch (error) {
    console.error("❌ Error checking practice registration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check registration status",
      error: error.message,
    });
  }
};

/**
 * Get practice exam scheduler status
 * GET /api/live-exam/practice/status
 */
const getPracticeExamSchedulerStatus = async (req, res) => {
  try {
    const status = practiceExamScheduler.getStatus();

    res.status(200).json({
      success: true,
      data: status,
      message: "Scheduler status retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching scheduler status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch scheduler status",
      error: error.message,
    });
  }
};

module.exports = {
  getCurrentPracticeExam,
  registerForPracticeExam,
  checkPracticeRegistration,
  getPracticeExamSchedulerStatus,
};
