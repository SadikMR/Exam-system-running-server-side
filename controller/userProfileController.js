const User = require("../models/User/users");

/**
 * @desc    Get user profile information
 * @route   GET /user/profile/:userId
 * @access  Public
 */
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user by ID and exclude sensitive fields
    const user = await User.findById(userId)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        address: user.address || null,
        image: user.image || null,
        collegeOrUniversity: user.collegeOrUniversity || null,
        isVerified: user.isVerified || false,
        verificationStatus: user.verificationStatus || "unverified",
        enrollmentId: user.enrollmentId || null,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
