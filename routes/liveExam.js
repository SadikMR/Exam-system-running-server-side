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

const router = express.Router();

// POST routes
router.post("/create", createLiveExam);

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

// Mock data route
router.get("/mock", (req, res) => {
  try {
    const { mockApiResponse } = require("../data/mockLiveExams");
    res.json(mockApiResponse);
  } catch (error) {
    console.error("Error serving mock data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load mock data",
      error: error.message,
    });
  }
});

router.get("/active", fetchActiveLiveExams);
router.get("/ongoing", fetchOngoingLiveExams);
router.get("/upcoming", fetchUpcomingLiveExams);

router.get("/", fetchLiveExams);

module.exports = router;
