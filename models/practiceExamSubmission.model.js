// models/PracticeExamSubmission.js

const mongoose = require("mongoose");

const PracticeExamSubmissionSchema = new mongoose.Schema(
  {
    // References
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
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
      examType: {
        type: String,
        required: true,
        enum: [
          "HSC",
          "BCS",
          "Bank",
          "Model Test",
          "Chapter Test",
          "Subject Test",
          "Other",
        ],
      },
      duration: { type: Number, required: true },
      tags: [String],

      // Exam category (subject-wise or full)
      category: {
        type: String,
        enum: ["subject-wise", "full"],
        required: true,
      },

      // ✅ examYear: Required for full exams of HSC/BCS/Bank, optional for subject-wise
      examYear: {
        type: Number,
        required: function () {
          return (
            this.examSnapshot?.category === "full" &&
            ["HSC", "BCS", "Bank"].includes(this.examSnapshot?.examType)
          );
        },
      },

      // ✅ hscGroup: Required only for full HSC exams
      hscGroup: {
        type: String,
        enum: ["Science", "Arts", "Commerce"],
        required: function () {
          return (
            this.examSnapshot?.examType === "HSC" &&
            this.examSnapshot?.category === "full"
          );
        },
      },

      // ✅ hscBoard: Required only for full HSC exams
      hscBoard: {
        type: String,
        trim: true,
        required: function () {
          return (
            this.examSnapshot?.examType === "HSC" &&
            this.examSnapshot?.category === "full"
          );
        },
      },

      // ✅ batch: Required only for full BCS exams
      batch: {
        type: Number,
        required: function () {
          return (
            this.examSnapshot?.examType === "BCS" &&
            this.examSnapshot?.category === "full"
          );
        },
      },

      // ✅ subjects: Store full exam structure with questions for review
      subjects: [
        {
          name: { type: String, required: true },
          questionCount: { type: Number },
          questions: [
            {
              text: { type: String, required: true },
              options: [{ type: String, required: true }],
              correctAnswer: { type: Number, required: true },
              marks: { type: Number, default: 1 },
              negativeMarks: { type: Number, default: 0 },
              difficulty: {
                type: String,
                enum: ["easy", "medium", "hard"],
                default: "medium",
              },
              explanation: { type: String, default: "" },
            },
          ],
        },
      ],
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

    // Status
    status: {
      type: String,
      enum: ["submitted", "reviewed"],
      default: "submitted",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PracticeExamSubmissionSchema.index({ userId: 1, createdAt: -1 });
PracticeExamSubmissionSchema.index({ username: 1, createdAt: -1 });
PracticeExamSubmissionSchema.index({ email: 1, createdAt: -1 });
PracticeExamSubmissionSchema.index({ examId: 1, createdAt: -1 });
PracticeExamSubmissionSchema.index({ "examSnapshot.examType": 1 });
PracticeExamSubmissionSchema.index({ "examSnapshot.category": 1 });

const PracticeExamSubmission = mongoose.model(
  "PracticeExamSubmission",
  PracticeExamSubmissionSchema
);

module.exports = PracticeExamSubmission;
