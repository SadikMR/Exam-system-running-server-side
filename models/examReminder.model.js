const mongoose = require("mongoose");

const ExamReminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveExam",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    examTitle: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
      index: true,
    },
    sentAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// One reminder per user per exam
ExamReminderSchema.index({ examId: 1, userId: 1 }, { unique: true });

const ExamReminder = mongoose.model("ExamReminder", ExamReminderSchema);

module.exports = ExamReminder;
