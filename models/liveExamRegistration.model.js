const mongoose = require("mongoose");

const LiveExamRegistrationSchema = new mongoose.Schema(
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
    },

    // Terms and conditions acceptance
    termsAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },
    acceptedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // Registration metadata
    ipAddress: String,
    userAgent: String,
    deviceType: String,

    // Status
    status: {
      type: String,
      enum: ["registered", "cancelled"],
      default: "registered",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes - ensure one registration per user per exam
LiveExamRegistrationSchema.index({ examId: 1, userId: 1 }, { unique: true });
LiveExamRegistrationSchema.index({ userId: 1, createdAt: -1 });
LiveExamRegistrationSchema.index({ examId: 1, createdAt: -1 });

const LiveExamRegistration = mongoose.model(
  "LiveExamRegistration",
  LiveExamRegistrationSchema
);

module.exports = LiveExamRegistration;

