// controller/demoExamController.js

const LiveExam = require("../models/liveExam");
const LiveExamRegistration = require("../models/liveExamRegistration.model");
const demoExamScheduler = require("../services/demoExamScheduler");

/**
 * Get current active demo exam
 * GET /api/live-exam/demo/current
 */
const getCurrentDemoExam = async (req, res) => {
  try {
    const userId = req.user?.id; // Optional: check if user is logged in
    const now = new Date();

    // If user is logged in, check if they have an active demo exam registration
    if (userId) {
      const userRegistration = await LiveExamRegistration.findOne({
        userId: userId,
        examId: { $exists: true },
      })
        .populate({
          path: "examId",
          match: { isDemo: true, endTime: { $gt: now } },
        })
        .sort({ registeredAt: -1 });

      // If user has registered for a demo exam that's still active, return that
      if (userRegistration && userRegistration.examId) {
        return res.status(200).json({
          success: true,
          data: userRegistration.examId,
          isRegistered: true,
          message: "You have an active demo exam",
        });
      }
    }

    // Otherwise, get the latest active demo exam
    const demoExam = await LiveExam.findOne({
      isDemo: true,
      startTime: { $lte: now },
      endTime: { $gt: now },
      status: "published",
    }).sort({ startTime: -1 });

    if (!demoExam) {
      return res.status(404).json({
        success: false,
        message: "No active demo exam available at the moment",
        nextExamIn: await getNextDemoExamTime(),
      });
    }

    res.status(200).json({
      success: true,
      data: demoExam,
      isRegistered: false,
      message: "Current demo exam retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching current demo exam:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch current demo exam",
      error: error.message,
    });
  }
};

/**
 * Get next demo exam start time
 * GET /api/live-exam/demo/next
 */
const getNextDemoExamTime = async () => {
  try {
    const now = new Date();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();

    // Calculate minutes until next 5-minute interval
    const minutesUntilNext = 5 - (currentMinutes % 5);
    const secondsUntilNext = 60 - currentSeconds;

    // If we're at exactly a 5-minute mark, next is in 5 minutes
    const totalSecondsUntilNext =
      minutesUntilNext === 5
        ? 5 * 60
        : (minutesUntilNext - 1) * 60 + secondsUntilNext;

    const nextExamTime = new Date(now.getTime() + totalSecondsUntilNext * 1000);

    return {
      nextExamTime: nextExamTime,
      secondsUntilNext: totalSecondsUntilNext,
      minutesUntilNext: Math.ceil(totalSecondsUntilNext / 60),
    };
  } catch (error) {
    console.error("❌ Error calculating next demo exam time:", error);
    return null;
  }
};

const getNextDemoExam = async (req, res) => {
  try {
    const nextExamInfo = await getNextDemoExamTime();

    res.status(200).json({
      success: true,
      data: nextExamInfo,
      message: "Next demo exam time calculated successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching next demo exam time:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate next demo exam time",
      error: error.message,
    });
  }
};

/**
 * Get demo exam scheduler status
 * GET /api/live-exam/demo/status
 */
const getDemoExamSchedulerStatus = async (req, res) => {
  try {
    const status = demoExamScheduler.getStatus();

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

/**
 * Manually trigger demo exam creation (admin only)
 * POST /api/live-exam/demo/create
 */
const createDemoExamManually = async (req, res) => {
  try {
    const demoExam = await demoExamScheduler.createDemoExam();

    res.status(201).json({
      success: true,
      data: demoExam,
      message: "Demo exam created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating demo exam manually:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create demo exam",
      error: error.message,
    });
  }
};

module.exports = {
  getCurrentDemoExam,
  getNextDemoExam,
  getDemoExamSchedulerStatus,
  createDemoExamManually,
};
