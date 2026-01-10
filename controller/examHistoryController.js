const LiveExam = require("../models/liveExam");
const LiveExamSubmission = require("../models/liveExamSubmission.model");

/**
 * @desc    Get all finished live exams with statistics
 * @route   GET /liveExam/history
 * @access  Admin
 */
exports.getFinishedExams = async (req, res) => {
  try {
    // Find all exams where endTime has passed (finished exams)
    const currentTime = new Date();
    const finishedExams = await LiveExam.find({ 
      endTime: { $lt: currentTime } 
    })
      .sort({ endTime: -1 })
      .lean();

    // For each exam, get statistics
    const examsWithStats = await Promise.all(
      finishedExams.map(async (exam) => {
        // Get all submissions for this exam
        const submissions = await LiveExamSubmission.find({ examId: exam._id })
          .select("resultMetrics commonViolationCount isBanned")
          .lean();

        const totalParticipants = submissions.length;

        if (totalParticipants === 0) {
          return {
            ...exam,
            totalParticipants: 0,
            highestMarks: 0,
            lowestMarks: 0,
            averageMarks: 0,
            bannedUsersCount: 0,
          };
        }

        // Calculate statistics
        const marks = submissions.map((s) => s.resultMetrics.totalMarksObtained);
        const highestMarks = Math.max(...marks);
        const lowestMarks = Math.min(...marks);
        const averageMarks = (
          marks.reduce((sum, mark) => sum + mark, 0) / totalParticipants
        ).toFixed(2);
        const bannedUsersCount = submissions.filter((s) => s.isBanned).length;

        return {
          ...exam,
          totalParticipants,
          highestMarks,
          lowestMarks,
          averageMarks: parseFloat(averageMarks),
          bannedUsersCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: examsWithStats.length,
      exams: examsWithStats,
    });
  } catch (error) {
    console.error("Error fetching finished exams:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching finished exams",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get exam ranking list with filtering
 * @route   GET /liveExam/history/:examId/ranking
 * @access  Admin
 * @query   violationThreshold, violationFilter, bannedOnly, rankRange, search
 */
exports.getExamRanking = async (req, res) => {
  try {
    const { examId } = req.params;
    const {
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
    // Note: We don't populate userId because username and email are already stored in the submission
    let submissions = await LiveExamSubmission.find({ examId })
      .lean();

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
      userId: submission.userId?._id || submission.userId,
      username: submission.username,
      name: submission.username, // Use username as display name since we don't populate user
      email: submission.email,
      marks: submission.resultMetrics?.totalMarksObtained || 0,
      totalPossibleMarks: submission.resultMetrics?.totalPossibleMarks || 0,
      percentage: submission.resultMetrics?.percentage || 0,
      timeConsumed: submission.timeTracking?.timeConsumed || 0,
      timeAllocated: submission.timeTracking?.timeAllocated || 0,
      violations: submission.commonViolationCount || 0,
      isBanned: submission.isBanned || false,
      banReason: submission.banReason || null,
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

    res.status(200).json({
      success: true,
      exam: {
        _id: exam._id,
        title: exam.title,
        examType: exam.examType,
        startTime: exam.startTime,
        endTime: exam.endTime,
        totalQuestions: exam.totalQuestions,
        duration: exam.duration,
      },
      violationThreshold: parseInt(violationThreshold),
      totalSubmissions: submissions.length,
      displayedRankings: finalRankings.length,
      isFiltered:
        search || bannedOnly || violationFilter || rankRange ? true : false,
      rankings: finalRankings,
    });
  } catch (error) {
    console.error("Error fetching exam ranking:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching exam ranking",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get detailed exam results for a specific user
 * @route   GET /liveExam/history/:examId/user/:userId
 * @access  Admin
 */
exports.getUserExamDetails = async (req, res) => {
  try {
    const { examId, userId } = req.params;

    // Get submission with exam details
    const submission = await LiveExamSubmission.findOne({ examId, userId })
      .populate("examId", "title examType duration totalQuestions subjects")
      .lean();

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found for this user and exam",
      });
    }

    res.status(200).json({
      success: true,
      userDetails: {
        userId: submission.userId,
        name: submission.username, // Use username as name
        username: submission.username,
        email: submission.email,
      },
      examDetails: {
        title: submission.examSnapshot?.title || submission.examId?.title,
        examType: submission.examSnapshot?.examType || submission.examId?.examType,
        duration: submission.examSnapshot?.duration || submission.examId?.duration,
        totalQuestions: submission.questionStats?.totalQuestions || 0,
      },
      performance: {
        totalMarksObtained: submission.resultMetrics?.totalMarksObtained || 0,
        totalPossibleMarks: submission.resultMetrics?.totalPossibleMarks || 0,
        percentage: submission.resultMetrics?.percentage || 0,
        correctAnswers: submission.resultMetrics?.correctAnswers || 0,
        wrongAnswers: submission.resultMetrics?.wrongAnswers || 0,
        negativeMarksDeducted: submission.resultMetrics?.negativeMarksDeducted || 0,
        attempted: submission.questionStats?.attempted || 0,
        skipped: submission.questionStats?.skipped || 0,
        markedForReview: submission.questionStats?.markedForReview || 0,
      },
      subjectWisePerformance: submission.subjectWisePerformance || [],
      timeTracking: {
        timeAllocated: submission.timeTracking?.timeAllocated || 0,
        timeConsumed: submission.timeTracking?.timeConsumed || 0,
        timeRemaining: submission.timeTracking?.timeRemaining || 0,
        startedAt: submission.timeTracking?.startedAt,
        submittedAt: submission.timeTracking?.submittedAt,
      },
      violations: {
        total: submission.commonViolationCount || 0,
        breakdown: {
          fullscreenExit: submission.violations?.fullscreenExit || 0,
          tabSwitching: submission.violations?.tabSwitching || 0,
          escapeKey: submission.violations?.escapeKey || 0,
          windowBlur: submission.violations?.windowBlur || 0,
        },
      },
      banStatus: {
        isBanned: submission.isBanned || false,
        banReason: submission.banReason || null,
        completionReason: submission.completionReason || "manual",
      },
    });
  } catch (error) {
    console.error("Error fetching user exam details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user exam details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get all exam history for a specific user
 * @route   GET /liveExam/history/user/:userId
 * @access  Admin
 */
exports.getUserExamHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all submissions for this user
    const submissions = await LiveExamSubmission.find({ userId })
      .populate("examId", "title examType startTime endTime status")
      .sort({ createdAt: -1 })
      .lean();

    // Format the results
    const examHistory = submissions.map((submission) => ({
      examId: submission.examId?._id,
      examTitle: submission.examSnapshot?.title || submission.examId?.title,
      examType: submission.examSnapshot?.examType || submission.examId?.examType,
      examDate: submission.examId?.startTime || submission.createdAt,
      examStatus: submission.examId?.status || "completed",
      marks: submission.resultMetrics?.totalMarksObtained || 0,
      totalPossibleMarks: submission.resultMetrics?.totalPossibleMarks || 0,
      percentage: submission.resultMetrics?.percentage || 0,
      violations: submission.commonViolationCount || 0,
      isBanned: submission.isBanned || false,
      submittedAt: submission.timeTracking?.submittedAt || submission.createdAt,
    }));

    res.status(200).json({
      success: true,
      userId,
      totalExams: examHistory.length,
      examHistory,
    });
  } catch (error) {
    console.error("Error fetching user exam history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user exam history",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
