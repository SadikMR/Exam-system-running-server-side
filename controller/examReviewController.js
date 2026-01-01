// controllers/examReviewController.js

const LiveExam = require("../models/liveExam");
const LiveExamSubmission = require("../models/liveExamSubmission.model");
const PracticeExamSubmission = require("../models/practiceExamSubmission.model");
const mongoose = require("mongoose");

/**
 * @desc    Get detailed exam review for a student
 * @route   GET /api/student/exam-review/:submissionId
 * @access  Private (Student)
 */
exports.getExamReview = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { examType } = req.query; // 'live' or 'practice'

    console.log(`[getExamReview] Fetching review for submissionId: ${submissionId}, examType: ${examType}`);

    let submission;
    let examData;

    if (examType === "live") {
      // Fetch live exam submission
      submission = await LiveExamSubmission.findById(submissionId)
        .populate({
          path: "examId",
          select: "title examType duration totalQuestions subjects passingScore",
        })
        .lean();

      if (!submission) {
        console.log(`[getExamReview] Live exam submission not found: ${submissionId}`);
        return res.status(404).json({
          success: false,
          message: "Submission not found",
        });
      }

      examData = submission.examId;
      console.log(`[getExamReview] Live exam data retrieved, has subjects: ${!!examData?.subjects}`);
    } else {
      // Fetch practice exam submission
      // Don't populate examId for practice exams as they store all data in examSnapshot
      submission = await PracticeExamSubmission.findById(submissionId).lean();

      if (!submission) {
        console.log(`[getExamReview] Practice exam submission not found: ${submissionId}`);
        return res.status(404).json({
          success: false,
          message: "Submission not found",
        });
      }

      // For practice exams, use examSnapshot (examId is not populated)
      examData = submission.examSnapshot;
      console.log(`[getExamReview] Practice exam data source: examSnapshot`);
      console.log(`[getExamReview] Practice exam has subjects: ${!!examData?.subjects}`);
    }

    // Convert answers Map to object if needed
    const answersObj =
      submission.answers instanceof Map
        ? Object.fromEntries(submission.answers)
        : submission.answers;

    console.log(`[getExamReview] Answers converted, total answers: ${Object.keys(answersObj).length}`);

    // Build comprehensive review data
    const reviewData = {
      examInfo: {
        title: submission.examSnapshot?.title || examData?.title,
        examType: submission.examSnapshot?.examType || examData?.examType,
        duration: submission.examSnapshot?.duration || examData?.duration,
        totalQuestions: submission.questionStats?.totalQuestions || 0,
        passingScore: examData?.passingScore || 40,
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

    // Add full exam questions with subjects
    // Try to get subjects from examData first, then fall back to examSnapshot
    const subjectsSource = examData?.subjects || submission.examSnapshot?.subjects;
    
    console.log(`[getExamReview] Subjects source found: ${!!subjectsSource}, is array: ${Array.isArray(subjectsSource)}`);
    
    if (subjectsSource && Array.isArray(subjectsSource)) {
      console.log(`[getExamReview] Processing ${subjectsSource.length} subjects`);
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
    } else {
      console.log(`[getExamReview] WARNING: No subjects data found. Practice exams may not store question details.`);
      // For practice exams that don't store full question details, return empty subjects
      // The frontend can still show overall stats and subject-wise performance
    }

    console.log(`[getExamReview] Review data prepared successfully, subjects count: ${reviewData.subjects.length}`);

    res.status(200).json({
      success: true,
      reviewData,
    });
  } catch (error) {
    console.error("[getExamReview] Error fetching exam review:", error);
    console.error("[getExamReview] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching exam review",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get leaderboard for a live exam (student view) with filtering
 * @route   GET /api/student/live-exam/:examId/leaderboard
 * @access  Private (Student)
 * @query   userId, violationThreshold, violationFilter, bannedOnly, rankRange, search
 */
exports.getLiveExamLeaderboard = async (req, res) => {
  try {
    const { examId } = req.params;
    const {
      userId,
      violationThreshold = 0,
      violationFilter,
      bannedOnly,
      rankRange,
      search,
    } = req.query;

    // Get exam details
    const exam = await LiveExam.findById(examId).lean();
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Get all submissions for this exam
    let submissions = await LiveExamSubmission.find({ examId }).lean();
    const totalSubmissions = submissions.length;

    // Apply search filter
    if (search && search.trim() !== "") {
      const searchLower = search.toLowerCase().trim();
      submissions = submissions.filter((s) => {
        const username = s.username?.toLowerCase() || "";
        const email = s.email?.toLowerCase() || "";
        return (
          username.includes(searchLower) ||
          email.includes(searchLower)
        );
      });
    }

    // Apply banned users filter
    if (bannedOnly === "true") {
      submissions = submissions.filter((s) => s.isBanned);
    }

    // Apply violation filter
    if (violationFilter) {
      const [operator, value] = violationFilter.split(":");
      const filterValue = parseInt(value);

      if (!isNaN(filterValue)) {
        submissions = submissions.filter((s) => {
          const violations = s.commonViolationCount || 0;
          if (operator === "lte") return violations <= filterValue;
          if (operator === "gte") return violations >= filterValue;
          if (operator === "eq") return violations === filterValue;
          return true;
        });
      }
    }

    // Sort submissions using violation-based ranking algorithm
    // 1. Fewer violations first
    // 2. Higher marks
    // 3. Less time taken
    submissions.sort((a, b) => {
      const violationsA = a.commonViolationCount || 0;
      const violationsB = b.commonViolationCount || 0;

      if (violationsA !== violationsB) {
        return violationsA - violationsB;
      }

      const marksA = a.resultMetrics?.totalMarksObtained || 0;
      const marksB = b.resultMetrics?.totalMarksObtained || 0;

      if (marksA !== marksB) {
        return marksB - marksA;
      }

      const timeA = a.timeTracking?.timeConsumed || 0;
      const timeB = b.timeTracking?.timeConsumed || 0;

      return timeA - timeB;
    });

    // Assign contextual ranks (always start from 1 for filtered results)
    const rankedSubmissions = submissions.map((submission, index) => ({
      rank: index + 1,
      userId: submission.userId?.toString(),
      username: submission.username,
      email: submission.email,
      marks: submission.resultMetrics?.totalMarksObtained || 0,
      totalPossibleMarks: submission.resultMetrics?.totalPossibleMarks || 0,
      percentage: submission.resultMetrics?.percentage || 0,
      timeConsumed: submission.timeTracking?.timeConsumed || 0,
      violations: submission.commonViolationCount || 0,
      isBanned: submission.isBanned || false,
      isEligible: (submission.commonViolationCount || 0) <= parseInt(violationThreshold),
    }));

    // Apply rank range filter
    let finalRankings = rankedSubmissions;
    if (rankRange && rankRange.includes("-")) {
      const [start, end] = rankRange.split("-").map((n) => parseInt(n.trim()));
      if (!isNaN(start) && !isNaN(end)) {
        finalRankings = rankedSubmissions.filter(
          (s) => s.rank >= start && s.rank <= end
        );
      }
    }

    // Find current user's rank
    let currentUserRank = null;
    if (userId) {
      const userRanking = rankedSubmissions.find(
        (r) => r.userId === userId.toString()
      );
      if (userRanking) {
        currentUserRank = {
          rank: userRanking.rank,
          marks: userRanking.marks,
          percentage: userRanking.percentage,
          timeConsumed: userRanking.timeConsumed,
          violations: userRanking.violations,
          isEligible: userRanking.isEligible,
        };
      }
    }

    res.status(200).json({
      success: true,
      exam: {
        _id: exam._id,
        title: exam.title,
        examType: exam.examType,
        totalQuestions: exam.totalQuestions,
        duration: exam.duration,
      },
      violationThreshold: parseInt(violationThreshold),
      totalParticipants: rankedSubmissions.length,
      totalSubmissions: totalSubmissions,
      isFiltered: search || bannedOnly || violationFilter || rankRange ? true : false,
      currentUserRank: currentUserRank,
      rankings: finalRankings,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leaderboard",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
