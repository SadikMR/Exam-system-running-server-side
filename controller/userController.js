const User = require("../models/User/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendPasswordResetCode, sendEmailVerificationCode } = require("../utils/emailService");

// Registration
const registerUser = async (req, res) => {
  try {
    const {
      username,
      name,
      email,
      phone,
      address,
      collegeOrUniversity,
      password,
    } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or email already registered." });
    }

    // Get image URL from multer/cloudinary upload
    // If file was uploaded, req.file.path contains the Cloudinary URL
    const imageUrl = req.file ? req.file.path : null;

    const newUser = new User({
      username,
      name,
      email,
      phone,
      address,
      image: imageUrl, // Store Cloudinary URL from multer
      collegeOrUniversity,
      password, // hashed by schema pre-save
      isEmailVerified: false,
    });

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(verificationCode, 10);

    newUser.emailVerificationCode = hashedCode;
    newUser.emailVerificationCodeExpires = Date.now() + 600000; // 10 minutes

    await newUser.save();

    // Send verification email
    await sendEmailVerificationCode(newUser.email, verificationCode, newUser.username);

    res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
      email: newUser.email,
    });
  } catch (error) {
    console.error("User registration error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// Login
const loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: "Missing credentials." });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials." });

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        message: "Please verify your email before logging in.",
        email: user.email,
        requiresVerification: true
      });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("User login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

// Get user profile (protected)
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Server error fetching profile." });
  }
};

// Update profile (no password update here)
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;

    if (updates.password) delete updates.password; // Defensive check

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
      select: "-password",
    });

    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json({ message: "Profile updated.", user });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error updating profile." });
  }
};

// Request password reset: generate 6-digit code, save hashed code, and send email
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(resetCode, 10);

    user.resetPasswordCode = hashedCode;
    user.resetPasswordCodeExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    await sendPasswordResetCode(user.email, resetCode, user.username);

    res.status(200).json({ message: "Password reset code sent to your email." });
  } catch (error) {
    console.error("Password reset request error:", error);
    res
      .status(500)
      .json({ message: "Server error on password reset request." });
  }
};

// Verify reset code (new endpoint)
const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (
      !user.resetPasswordCode ||
      !user.resetPasswordCodeExpires ||
      user.resetPasswordCodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired verification code." });
    }

    const isValid = await bcrypt.compare(code, user.resetPasswordCode);
    if (!isValid) return res.status(400).json({ message: "Invalid verification code." });

    res.status(200).json({ message: "Verification code is valid." });
  } catch (error) {
    console.error("Verify reset code error:", error);
    res.status(500).json({ message: "Server error during code verification." });
  }
};

// Reset password: verify code and update password
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (
      !user.resetPasswordCode ||
      !user.resetPasswordCodeExpires ||
      user.resetPasswordCodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired verification code." });
    }

    const isValid = await bcrypt.compare(code, user.resetPasswordCode);
    if (!isValid) return res.status(400).json({ message: "Invalid verification code." });

    user.password = newPassword; // hashed in pre-save hook
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error during password reset." });
  }
};

// Verify email with code
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified." });
    }

    if (
      !user.emailVerificationCode ||
      !user.emailVerificationCodeExpires ||
      user.emailVerificationCodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired verification code." });
    }

    const isValid = await bcrypt.compare(code, user.emailVerificationCode);
    if (!isValid) return res.status(400).json({ message: "Invalid verification code." });

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Email verified successfully. You can now login." });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ message: "Server error during email verification." });
  }
};

// Resend verification code
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified." });
    }

    // Generate new 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(verificationCode, 10);

    user.emailVerificationCode = hashedCode;
    user.emailVerificationCodeExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    await sendEmailVerificationCode(user.email, verificationCode, user.username);

    res.status(200).json({ message: "Verification code sent to your email." });
  } catch (error) {
    console.error("Resend verification code error:", error);
    res.status(500).json({ message: "Server error sending verification code." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
  verifyEmail,
  resendVerificationCode,
};
