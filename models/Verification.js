const mongoose = require("mongoose");

const VerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    images: {
      left: String,    // Image path or URL
      right: String,
      up: String,
      down: String,
    },
    angles: [String],  // ['left', 'right', 'up', 'down']
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    capturedAt: Date,
    submittedAt: Date,
    verifiedAt: Date,
    adminNotes: String,
    rejectionReason: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Verification", VerificationSchema);
