// models/LiveExam.js

const mongoose = require("mongoose");

// Question Schema
const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length >= 2;
        },
        message: "Question must have at least 2 options",
      },
    },
    correctAnswer: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          return value >= 0 && value < this.options.length;
        },
        message: "Correct answer must be a valid option index",
      },
    },
    explanation: {
      type: String,
      default: "",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    marks: {
      type: Number,
      default: 1,
    },
    negativeMarks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Subject Schema
const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    questionCount: {
      type: Number,
      required: true,
      min: 1,
    },
    questions: [questionSchema],
  },
  {
    timestamps: true,
  }
);

// Live Exam Schema
const liveExamSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    examType: {
      type: String,
      required: true,
      trim: true,
    },
    examMode: {
      type: String,
      required: true,
      enum: ["live"],
      default: "live",
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    password: {
      type: String,
      default: null,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    subjects: {
      type: [subjectSchema],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "At least one subject is required",
      },
    },
    status: {
      type: String,
      enum: ["draft", "published", "ongoing", "completed", "cancelled"],
      default: "draft",
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    tags: {
      type: [String],
      enum: ["model-test", "subject-wise"],
      default: [],
    },
    passingScore: {
      type: Number,
      default: 40, // Changed from 0 to 40
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LiveExam", liveExamSchema);
