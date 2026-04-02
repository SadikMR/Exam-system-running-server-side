const express = require("express");
const router = express.Router();
const bcsCtrl = require("../controller/bcsquestions.controller");

// Create new BCS exam
router.post("/create", bcsCtrl.createBCSExam);

//checking duplicate
router.get("/check-duplicate", bcsCtrl.checkDuplicate);

// Get all BCS exams
router.get("/all", bcsCtrl.getAllBCSExams);

// Get BCS exam by year
router.get("/:batch", bcsCtrl.getBCSExamByYear);

// Get random BCS questions by subject
router.get(
  "/subject/:subjectName/:limit?",
  bcsCtrl.getRandomBCSQuestionsBySubject
);

module.exports = router;
