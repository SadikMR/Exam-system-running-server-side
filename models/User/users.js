const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^01\d{9}$/;

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return emailRegex.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return phoneRegex.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    address: { type: String, trim: true },
    image: { type: String },
    collegeOrUniversity: { type: String, trim: true },
    password: { type: String, required: true },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // Verification fields
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ["unverified", "verified"],
      default: "unverified",
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verificationSubmittedAt: {
      type: Date,
      default: null,
    },

    // Cloudinary verification images
    verificationImages: {
      front: {
        type: String,
        default: null,
      },
      left: {
        type: String,
        default: null,
      },
      right: {
        type: String,
        default: null,
      },
      up: {
        type: String,
        default: null,
      },
    },

    // Enrollment/Registration info
    enrollmentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    dateOfBirth: Date,
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Users", UserSchema);
