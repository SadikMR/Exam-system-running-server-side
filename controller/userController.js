const User = require("../models/User/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendResetPasswordEmail } = require("../utils/emailService"); // Import your email function

// Registration
const registerUser = async (req, res) => {
  try {
    const {
      username,
      name,
      email,
      phone,
      address,
      image,
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

    const newUser = new User({
      username,
      name,
      email,
      phone,
      address,
      image,
      collegeOrUniversity,
      password, // hashed by schema pre-save
    });

    await newUser.save();

    res.status(201).json({
      message: "User registration successful.",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
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

// Request password reset: generate token, save hashed token, and send email using EmailService
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&id=${user._id}`;

    await sendResetPasswordEmail(user.email, resetUrl, user.username);

    res.status(200).json({ message: "Password reset email sent." });
  } catch (error) {
    console.error("Password reset request error:", error);
    res
      .status(500)
      .json({ message: "Server error on password reset request." });
  }
};

// Reset password: verify token and update password
const resetPassword = async (req, res) => {
  try {
    const { userId, token, newPassword } = req.body;
    if (!userId || !token || !newPassword) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (
      !user.resetPasswordToken ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const isValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isValid) return res.status(400).json({ message: "Invalid token." });

    user.password = newPassword; // hashed in pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error during password reset." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  requestPasswordReset,
  resetPassword,
};
