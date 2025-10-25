const express = require("express");
const { createLiveExam } = require("../controller/createLiveExam");
const {
  submitLiveExam,
  getSubmission,
  getUserSubmissions,
  getExamSubmissions,
} = require("../controller/liveSubmit.controller");

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
router.post("/submit", submitLiveExam);

// GET routes for submissions
router.get("/submission/:submissionId", getSubmission);
router.get("/user/:userId/submissions", getUserSubmissions);
router.get("/exam/:examId/submissions", getExamSubmissions);

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
