const mongoose = require("mongoose");

const LiveExamSubmissionSchema = new mongoose.Schema(
  {
    // References
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveExam",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },

    // Exam snapshot
    examSnapshot: {
      title: { type: String, required: true },
      examType: { type: String, required: true },
      duration: { type: Number, required: true },
      tags: [String],
    },

    // Answers (questionKey -> selectedOptionIndex)
    answers: {
      type: Map,
      of: Number,
      default: {},
    },

    // Question statistics
    questionStats: {
      totalQuestions: { type: Number, required: true },
      attempted: { type: Number, required: true },
      skipped: { type: Number, required: true },
      markedForReview: { type: Number, required: true },
    },

    // Result metrics
    resultMetrics: {
      correctAnswers: { type: Number, required: true },
      wrongAnswers: { type: Number, required: true },
      totalMarksObtained: { type: Number, required: true },
      totalPossibleMarks: { type: Number, required: true },
      percentage: { type: Number, required: true },
      negativeMarksDeducted: { type: Number, default: 0 },
    },

    // Difficulty-wise stats
    difficultyStats: {
      easy: {
        correct: { type: Number, default: 0 },
        wrong: { type: Number, default: 0 },
        skipped: { type: Number, default: 0 },
      },
      medium: {
        correct: { type: Number, default: 0 },
        wrong: { type: Number, default: 0 },
        skipped: { type: Number, default: 0 },
      },
      hard: {
        correct: { type: Number, default: 0 },
        wrong: { type: Number, default: 0 },
        skipped: { type: Number, default: 0 },
      },
    },

    // Subject-wise performance
    subjectWisePerformance: [
      {
        subjectName: String,
        totalQuestions: Number,
        attempted: Number,
        correct: Number,
        wrong: Number,
        skipped: Number,
        marksObtained: Number,
        maxMarks: Number,
      },
    ],

    // Time tracking
    timeTracking: {
      timeAllocated: { type: Number, required: true },
      timeConsumed: { type: Number, required: true },
      timeRemaining: { type: Number, required: true },
      startedAt: { type: Date, required: true },
      submittedAt: { type: Date, default: Date.now },
    },

    // Violation tracking
    violations: {
      total: { type: Number, default: 0 },
      fullscreenExit: { type: Number, default: 0 },
      tabSwitching: { type: Number, default: 0 },
      escapeKey: { type: Number, default: 0 },
      windowBlur: { type: Number, default: 0 },
    },

    // Completion metadata
    completionReason: {
      type: String,
      enum: ["manual", "timeout", "expelled", "system"],
      default: "manual",
    },

    // Status
    status: {
      type: String,
      enum: ["submitted", "verified"],
      default: "submitted",
    },

    // Metadata
    metadata: {
      ipAddress: String,
      userAgent: String,
      deviceType: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
LiveExamSubmissionSchema.index({ examId: 1, userId: 1 }, { unique: true });
LiveExamSubmissionSchema.index({ userId: 1, createdAt: -1 });
LiveExamSubmissionSchema.index({ username: 1, createdAt: -1 });
LiveExamSubmissionSchema.index({ examId: 1, createdAt: -1 });

const LiveExamSubmission = mongoose.model(
  "LiveExamSubmission",
  LiveExamSubmissionSchema
);

module.exports = LiveExamSubmission;
