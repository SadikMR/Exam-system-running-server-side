const express = require("express");
const router = express.Router();
const bankExamController = require("../controller/bankquestions.controller");

// ✅ Create a new Bank Exam
router.post("/create", bankExamController.createBankExam);

//checking duplicate
router.get("/check-duplicate", bankExamController.checkDuplicate);

// ✅ Get all Bank Exams
router.get("/", bankExamController.getAllBankExams);

// ✅ GET random questions by subject (optional limit)
router.get(
  "/subject/:subjectName/:limit?",
  bankExamController.getRandomBankQuestionsBySubject
);

// ✅ Get a single Bank Exam by ID
router.get("/:id", bankExamController.getBankExamById);

// Get BCS exam by year
router.get("/year/:year", bankExamController.getBankExamByYear);

// ✅ Update a Bank Exam
router.put("/:id", bankExamController.updateBankExam);

// ✅ Delete a Bank Exam
router.delete("/:id", bankExamController.deleteBankExam);

module.exports = router;
