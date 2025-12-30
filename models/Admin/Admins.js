const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    image: { type: String }, // Stores base64 string or image URL
    role: { type: String, enum: ["admin", "editor"], required: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    invitationToken: { type: String },
    invitationExpiresAt: { type: Date },
  },
  { timestamps: true }
);

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

AdminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Admins", AdminSchema);
