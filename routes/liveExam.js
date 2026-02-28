const express = require("express");
const { createLiveExam } = require("../controller/createLiveExam");
const {
  submitExam,
  getSubmissionById,
  getSubmissionsByExamId,
  getSubmissionByExamAndUser,
  getSubmissionsByUserId,
} = require("../controller/liveExamController/liveExamSubmission.controller");

const {
  fetchActiveLiveExams,
  fetchOngoingLiveExams,
  fetchUpcomingLiveExams,
  fetchLiveExams,
  fetchLiveExamById,
} = require("../controller/liveExamController/fetchLiveExam");

const {
  registerForExam,
  checkRegistration,
  getUserRegistrations,
} = require("../controller/liveExamController/liveExamRegistration.controller");

const {
  getCurrentDemoExam,
  getNextDemoExam,
  getDemoExamSchedulerStatus,
  createDemoExamManually,
} = require("../controller/demoExamController");

const {
  getCurrentPracticeExam,
  registerForPracticeExam,
  checkPracticeRegistration,
  getPracticeExamSchedulerStatus,
} = require("../controller/practiceExamController");

const optionalAuth = require("../middleware/optionalAuth");
const authMiddleware = require("../middleware/userAuthMiddleware");

const {
  setReminder,
  removeReminder,
  getUserReminders,
} = require("../controller/liveExamController/reminderController");

const router = express.Router();

// POST routes
router.post("/create", createLiveExam);

// Demo exam routes
router.get("/demo/current", optionalAuth, getCurrentDemoExam);
router.get("/demo/next", getNextDemoExam);
router.get("/demo/status", getDemoExamSchedulerStatus);
router.post("/demo/create", authMiddleware, createDemoExamManually); // Admin only

// Practice exam routes
router.get("/practice/current", optionalAuth, getCurrentPracticeExam);
router.post("/practice/register", authMiddleware, registerForPracticeExam);
router.get("/practice/registration/:examId", authMiddleware, checkPracticeRegistration);
router.get("/practice/status", getPracticeExamSchedulerStatus);

// Submit submission
router.post("/submit", submitExam);

// ✅ Add this route (PUT IT BEFORE OTHER SUBMISSION ROUTES)
router.get("/submission/:submissionId", getSubmissionById);

// Get submissions by user ID (PUT THIS FIRST - more specific route)
router.get("/submission/user/:userId", getSubmissionsByUserId);

// Get submissions by exam ID
router.get("/submission/exam/:examId", getSubmissionsByExamId);

// Get submission by exam ID and user ID
router.get("/submission/exam/:examId/user/:userId", getSubmissionByExamAndUser);

// Mock data route with filtering for participated exams
router.get("/mock", optionalAuth, async (req, res) => {
  try {
    const { mockApiResponse } = require("../data/mockLiveExams");
    const LiveExamSubmission = require("../models/liveExamSubmission.model");
    
    let filteredExams = mockApiResponse.data.exams;
    
    // If user is authenticated, filter out exams they've already participated in
    if (req.user && req.user.userId) {
      const userId = req.user.userId;
      
      // Get all exam IDs that the user has already submitted
      const userSubmissions = await LiveExamSubmission.find({ userId })
        .select("examId")
        .lean();
      
      const participatedExamIds = new Set(
        userSubmissions.map((submission) => submission.examId.toString())
      );
      
      // Filter out exams the user has already participated in
      filteredExams = mockApiResponse.data.exams.filter(
        (exam) => !participatedExamIds.has(exam._id.toString())
      );
    }
    
    // Recalculate counts after filtering
    const currentTime = new Date();
    const ongoing = filteredExams.filter((exam) => {
      return new Date(exam.startTime) <= currentTime && new Date(exam.endTime) > currentTime;
    }).length;
    
    const upcoming = filteredExams.filter(
      (exam) => new Date(exam.startTime) > currentTime
    ).length;
    
    res.json({
      ...mockApiResponse,
      data: {
        total: filteredExams.length,
        ongoing,
        upcoming,
        exams: filteredExams,
      },
    });
  } catch (error) {
    console.error("Error serving mock data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load mock data",
      error: error.message,
    });
  }
});

// Registration routes (require authentication)
router.post("/register", authMiddleware, registerForExam);
router.get("/registration/:examId", authMiddleware, checkRegistration);
router.get("/registration/user/:userId", authMiddleware, getUserRegistrations);

// Reminder routes (require authentication)
router.post("/reminder", authMiddleware, setReminder);
router.delete("/reminder/:examId", authMiddleware, removeReminder);
router.get("/reminders", authMiddleware, getUserReminders);

// Use optional auth middleware - works for both authenticated and unauthenticated users
// If user is authenticated, filters out exams they've already participated in
router.get("/active", optionalAuth, fetchActiveLiveExams);
router.get("/ongoing", optionalAuth, fetchOngoingLiveExams);
router.get("/upcoming", optionalAuth, fetchUpcomingLiveExams);

router.get("/", optionalAuth, fetchLiveExams);

// Exam History routes (Admin)
const {
  getFinishedExams,
  getExamRanking,
  getUserExamDetails,
  getUserExamHistory,
} = require("../controller/examHistoryController");

router.get("/history", getFinishedExams);
router.get("/history/:examId/ranking", getExamRanking);
router.get("/history/:examId/user/:userId", getUserExamDetails);
router.get("/history/user/:userId/all", getUserExamHistory);

// Student routes
const {
  getExamReview,
  getLiveExamLeaderboard,
} = require("../controller/examReviewController");

router.get("/student/exam-review/:submissionId", authMiddleware, getExamReview);
router.get("/student/live-exam/:examId/leaderboard", authMiddleware, getLiveExamLeaderboard);

module.exports = router;
