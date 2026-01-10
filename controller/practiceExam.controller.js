// controllers/practiceExamSubmissionController.js

const mongoose = require("mongoose");
const PracticeExamSubmission = require("../models/practiceExamSubmission.model");

// Import exam models for fallback when subjects are missing
const HSCHistory = require("../models/hscHistory.model");
const BCSHistory = require("../models/bcsHistory.model");
const BankHistory = require("../models/bankPreviousYearQuestions");
const HSCSubjectWise = require("../models/hscSubjectWiseHistory.model");
const BCSSubjectWise = require("../models/bcssubjectWiseHistory.model");

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

// 6. Get practice exam review
exports.getPracticeExamReview = async (req, res) => {
  try {
    const { submissionId } = req.params;

    console.log(`[getPracticeExamReview] Fetching review for submissionId: ${submissionId}`);

    if (!isValidObjectId(submissionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submissionId format",
      });
    }

    // Fetch practice exam submission
    const submission = await PracticeExamSubmission.findById(submissionId).lean();

    if (!submission) {
      console.log(`[getPracticeExamReview] Submission not found: ${submissionId}`);
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    console.log(`[getPracticeExamReview] Submission found, has examSnapshot: ${!!submission.examSnapshot}`);
    console.log(`[getPracticeExamReview] ExamSnapshot has subjects: ${!!submission.examSnapshot?.subjects}`);

    // Convert answers Map to object if needed
    const answersObj =
      submission.answers instanceof Map
        ? Object.fromEntries(submission.answers)
        : submission.answers;

    console.log(`[getPracticeExamReview] Answers converted, total answers: ${Object.keys(answersObj).length}`);

    // Get subjects from examSnapshot or fetch from original exam
    let subjectsSource = submission.examSnapshot?.subjects;
    
    // ✅ FALLBACK: If subjects are missing, fetch from original exam document
    if (!subjectsSource || !Array.isArray(subjectsSource) || subjectsSource.length === 0) {
      console.log(`[getPracticeExamReview] Subjects missing in snapshot, fetching from original exam...`);
      
      const examId = submission.examId;
      const examType = submission.examSnapshot?.examType;
      const category = submission.examSnapshot?.category;
      
      console.log(`[getPracticeExamReview] Exam metadata - Type: ${examType}, Category: ${category}, ID: ${examId}`);
      
      try {
        let originalExam = null;
        
        // Determine which model to query based on exam type and category
        if (examType === "HSC") {
          if (category === "full") {
            originalExam = await HSCHistory.findById(examId).lean();
          } else {
            originalExam = await HSCSubjectWise.findById(examId).lean();
          }
        } else if (examType === "BCS") {
          if (category === "full") {
            originalExam = await BCSHistory.findById(examId).lean();
          } else {
            originalExam = await BCSSubjectWise.findById(examId).lean();
          }
        } else if (examType === "Bank") {
          originalExam = await BankHistory.findById(examId).lean();
        }
        
        if (originalExam && originalExam.subjects) {
          console.log(`[getPracticeExamReview] Found original exam with ${originalExam.subjects.length} subjects`);
          subjectsSource = originalExam.subjects;
        } else {
          console.log(`[getPracticeExamReview] WARNING: Could not find original exam or it has no subjects`);
        }
      } catch (fetchError) {
        console.error(`[getPracticeExamReview] Error fetching original exam:`, fetchError);
      }
    }

    // Build comprehensive review data from examSnapshot
    const reviewData = {
      examInfo: {
        title: submission.examSnapshot?.title || "Practice Exam",
        examType: submission.examSnapshot?.examType || "Other",
        duration: submission.examSnapshot?.duration || 0,
        totalQuestions: submission.questionStats?.totalQuestions || 0,
        passingScore: 40,
      },
      overallStats: {
        totalMarksObtained: submission.resultMetrics?.totalMarksObtained || 0,
        totalPossibleMarks: submission.resultMetrics?.totalPossibleMarks || 0,
        percentage: submission.resultMetrics?.percentage || 0,
        correctAnswers: submission.resultMetrics?.correctAnswers || 0,
        wrongAnswers: submission.resultMetrics?.wrongAnswers || 0,
        skipped: submission.questionStats?.skipped || 0,
        attempted: submission.questionStats?.attempted || 0,
        negativeMarksDeducted: submission.resultMetrics?.negativeMarksDeducted || 0,
      },
      timeAnalysis: {
        timeAllocated: submission.timeTracking?.timeAllocated || 0,
        timeConsumed: submission.timeTracking?.timeConsumed || 0,
        timeRemaining: submission.timeTracking?.timeRemaining || 0,
        submittedAt: submission.timeTracking?.submittedAt || submission.createdAt,
      },
      subjectWisePerformance: submission.subjectWisePerformance || [],
      subjects: [],
      userAnswers: answersObj,
    };
    
    console.log(`[getPracticeExamReview] Subjects source found: ${!!subjectsSource}, is array: ${Array.isArray(subjectsSource)}`);
    
    if (subjectsSource && Array.isArray(subjectsSource)) {
      console.log(`[getPracticeExamReview] Processing ${subjectsSource.length} subjects`);
      reviewData.subjects = subjectsSource.map((subject, subjectIndex) => {
        const questions = subject.questions.map((question, questionIndex) => {
          const questionKey = `${subjectIndex}-${questionIndex}`;
          const userAnswer = answersObj[questionKey];
          const isCorrect =
            userAnswer !== undefined && userAnswer === question.correctAnswer;
          const isSkipped = userAnswer === undefined;

          return {
            questionNumber: questionIndex + 1,
            text: question.text,
            options: question.options,
            correctAnswer: question.correctAnswer,
            userAnswer: userAnswer,
            isCorrect: isCorrect,
            isSkipped: isSkipped,
            marks: question.marks,
            negativeMarks: question.negativeMarks,
            difficulty: question.difficulty,
            explanation: question.explanation || "",
          };
        });

        return {
          subjectName: subject.name,
          questionCount: subject.questionCount || subject.questions.length,
          questions: questions,
        };
      });
      console.log(`[getPracticeExamReview] Processed ${reviewData.subjects.length} subjects with questions`);
    } else {
      console.log(`[getPracticeExamReview] WARNING: No subjects data found in examSnapshot or original exam`);
    }

    console.log(`[getPracticeExamReview] Review data prepared successfully, subjects count: ${reviewData.subjects.length}`);

    res.status(200).json({
      success: true,
      reviewData,
    });
  } catch (error) {
    console.error("[getPracticeExamReview] Error fetching practice exam review:", error);
    console.error("[getPracticeExamReview] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching practice exam review",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
