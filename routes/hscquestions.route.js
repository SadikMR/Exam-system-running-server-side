const express = require("express");
const router = express.Router();
const {
  createHSCExam,
  getAllHSCExams,
  getHSCExam,
  getRandomHSCQuestionsBySubject,
  checkDuplicate,
} = require("../controller/hscquestions.controller");

// ✅ CREATE a new HSC previous year exam
router.post("/create", createHSCExam);

//checking duplicate
router.get("/check-duplicate", checkDuplicate);

// ✅ GET all HSC previous year exams
router.get("/", getAllHSCExams);

// ✅ GET random questions by subject (optional limit)
router.get("/subject/:subjectName/:limit?", getRandomHSCQuestionsBySubject);

// ✅ GET a specific HSC exam by year + group + board
router.get("/:year/:group/:board", getHSCExam);

module.exports = router;
