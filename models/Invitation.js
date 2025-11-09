const mongoose = require("mongoose");

const InviteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: { type: String, enum: ["admin", "editor"], required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    accepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invite", InviteSchema);
