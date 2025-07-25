const mongoose = require("mongoose");
const { Schema } = mongoose;

// Sub-schema for question details
const questionDetailSchema = new Schema(
  {
    subjectIndex: { type: Number, required: true },
    subjectName: { type: String, required: true },
    questionIndex: { type: Number, required: true },
    questionId: { type: String, required: true },
    correctAnswer: { type: Number, required: true },
    userAnswer: { type: Number }, // Optional for skipped questions
    isCorrect: { type: Boolean, required: true },
    isSkipped: { type: Boolean, required: true },
    marks: { type: Number, required: true, default: 1 },
    negativeMarks: { type: Number, required: true, default: 0.25 },
    scoreContribution: { type: Number, required: true },
  },
  { _id: false }
);

// Sub-schema for subject-wise results
const subjectResultSchema = new Schema(
  {
    subjectName: { type: String, required: true },
    totalQuestions: { type: Number, required: true },
    correct: { type: Number, required: true },
    wrong: { type: Number, required: true },
    skipped: { type: Number, required: true },
    score: { type: Number, required: true },
  },
  { _id: false }
);

const liveExamSubmissionSchema = new Schema(
  {
    // Basic references
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    examId: { type: Schema.Types.ObjectId, ref: "liveexams", required: true },

    // Exam info
    examTitle: { type: String, required: true },
    username: { type: String, required: true },
    userEmail: { type: String },

    // Timing information
    startTime: { type: Number },
    submissionTime: { type: Date, default: Date.now },
    examDuration: { type: Number, required: true }, // in seconds
    timeConsumed: { type: Number, required: true },
    timeRemaining: { type: Number, required: true },

    // Score summary
    totalScore: { type: Number, required: true },
    totalCorrect: { type: Number, required: true },
    totalWrong: { type: Number, required: true },
    totalSkipped: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    percentage: { type: String, required: true }, // stored as "40.00"

    // Answer data
    answers: { type: Schema.Types.Mixed, required: true }, // { "0-0": 1, "0-1": 2 }
    questionDetails: [questionDetailSchema],
    subjectWiseResults: [subjectResultSchema],

    // Completion details
    completionReason: {
      type: String,
      enum: ["manual", "time_up", "expelled"],
      required: true,
    },
    device: {
      type: String,
      enum: ["mobile", "desktop"],
      required: true,
    },
    isExpelled: { type: Boolean, default: false },

    // Tracking arrays
    reviewMarkedQuestions: [String],
    visitedQuestions: [String],
    violations: [Schema.Types.Mixed],
  },
  {
    timestamps: true,
  }
);

// 📌 Indexes for performance
liveExamSubmissionSchema.index({ examId: 1, userId: 1 });
liveExamSubmissionSchema.index({ submissionTime: -1 });
liveExamSubmissionSchema.index({ userId: 1 });
liveExamSubmissionSchema.index({ examId: 1 });

module.exports = mongoose.model(
  "liveexamsubmissions",
  liveExamSubmissionSchema
);
