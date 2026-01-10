const express = require("express");
const router = express.Router();
const {
  submitPracticeExam,
  getSubmissionsByExamId,
  getSubmissionsByUserId,
  getSubmissionByExamAndUser,
  getSubmissionsByExamType,
  getPracticeExamReview,
} = require("../controller/practiceExam.controller");

const authMiddleware = require("../middleware/userAuthMiddleware");

// 1. Submit practice exam
router.post("/submit", submitPracticeExam);

// 2. Get submissions by exam ID
router.get("/exam/:examId", getSubmissionsByExamId);

// 3. Get submissions by user ID
router.get("/user/:userId", getSubmissionsByUserId);

// 4. Get submission by exam ID and user ID
router.get("/exam/:examId/user/:userId", getSubmissionByExamAndUser);

// 5. Get submissions by exam type (HSC/BCS/Bank)
router.get("/type/:examType", getSubmissionsByExamType);

// 6. Get detailed exam review for student (practice exams)
router.get("/review/:submissionId", authMiddleware, getPracticeExamReview);

module.exports = router;
