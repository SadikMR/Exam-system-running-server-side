const mongoose = require("mongoose");

// Question Schema
const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 2,
        message: "Question must have at least 2 options",
      },
    },
    correctAnswer: {
      type: Number,
      required: true,
      validate: function (value) {
        return value >= 0 && value < this.options.length;
      },
    },
    explanation: { type: String, default: "" },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    marks: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Subject Schema
const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    questions: [questionSchema],
  },
  { timestamps: true }
);

// HSC Previous Year Exam Schema
const hscPreviousYearSchema = new mongoose.Schema(
  {
    examYear: { type: Number, required: true },
    hscGroup: {
      type: String,
      enum: ["Science", "Arts", "Commerce"],
      required: true,
    },
    hscBoard: { type: String, required: true, trim: true },
    subjects: { type: [subjectSchema], required: true },
    totalQuestions: {
      type: Number,
      default: function () {
        return this.subjects.reduce((sum, s) => sum + s.questions.length, 0);
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "HSCPreviousYearQuestions",
  hscPreviousYearSchema
);
