const User = require("../models/User/users");
const cloudinary = require("../config/cloudinary");

// Get profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, phone, address } = req.body;

    // Don't allow updating email and enrollmentId
    const updates = {};
    if (fullName) updates.name = fullName;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      data: user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Verify password before allowing verification submission
const verifyPassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password with stored hash
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Password is incorrect",
        success: false,
      });
    }

    res.json({
      success: true,
      message: "Password verified successfully",
    });
  } catch (error) {
    console.error("Verify password error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Submit verification (with Cloudinary upload)
const submitVerification = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Validate that all 3 images are uploaded
    if (
      !req.files ||
      !req.files.front ||
      !req.files.left ||
      !req.files.right
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All three verification images are required (front, left, right)",
      });
    }

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      // Clean up uploaded images if user not found
      const deletePromises = [
        cloudinary.uploader.destroy(req.files.front[0].filename),
        cloudinary.uploader.destroy(req.files.left[0].filename),
        cloudinary.uploader.destroy(req.files.right[0].filename),
      ];
      await Promise.all(deletePromises).catch((err) =>
        console.error("Error deleting images:", err)
      );

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete old verification images from Cloudinary if they exist
    if (user.verificationImages) {
      const deletePromises = [];
      Object.values(user.verificationImages).forEach((imageUrl) => {
        if (imageUrl) {
          try {
            const urlParts = imageUrl.split("/");
            const fileWithExt = urlParts[urlParts.length - 1];
            const folderName = urlParts[urlParts.length - 2];
            const publicId = `${folderName}/${fileWithExt.split(".")[0]}`;

            deletePromises.push(
              cloudinary.uploader
                .destroy(publicId)
                .catch((err) =>
                  console.error(`Error deleting old image ${publicId}:`, err)
                )
            );
          } catch (error) {
            console.error("Error parsing image URL:", error);
          }
        }
      });

      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
      }
    }

    // Save new verification images URLs from Cloudinary to database
    user.verificationImages = {
      front: req.files.front[0].path,
      left: req.files.left[0].path,
      right: req.files.right[0].path,
    };

    // Automatically verify the user
    user.verificationStatus = "verified";
    user.isVerified = true;
    user.verificationSubmittedAt = new Date();
    user.verifiedAt = new Date();

    await user.save();


    res.status(200).json({
      success: true,
      message: "Verification images uploaded and verified successfully",
      data: {
        verificationImages: user.verificationImages,
        verificationStatus: user.verificationStatus,
        isVerified: user.isVerified,
        verificationSubmittedAt: user.verificationSubmittedAt,
        verifiedAt: user.verifiedAt,
      },
    });
  } catch (error) {
    console.error("Verification submission error:", error);

    // Clean up uploaded images on error
    if (req.files) {
      const deletePromises = [];
      Object.values(req.files).forEach((fileArray) => {
        if (fileArray && fileArray[0]) {
          deletePromises.push(
            cloudinary.uploader
              .destroy(fileArray[0].filename)
              .catch((err) => console.error("Error cleaning up file:", err))
          );
        }
      });
      await Promise.all(deletePromises);
    }

    res.status(500).json({
      success: false,
      message: "Failed to submit verification",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Get verification status
const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select(
      "verificationStatus verificationImages verificationSubmittedAt verifiedAt isVerified"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        status: user.verificationStatus || "unverified",
        isVerified: user.isVerified || false,
        verificationImages: user.verificationImages || null,
        submittedAt: user.verificationSubmittedAt || null,
        verifiedAt: user.verifiedAt || null,
      },
    });
  } catch (error) {
    console.error("Get verification status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get verification status",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Get verification details
const getVerificationDetails = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select(
      "verificationStatus verificationImages verificationSubmittedAt verifiedAt isVerified name email username"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          username: user.username,
        },
        verification: {
          status: user.verificationStatus || "unverified",
          isVerified: user.isVerified || false,
          verificationImages: user.verificationImages || null,
          submittedAt: user.verificationSubmittedAt || null,
          verifiedAt: user.verifiedAt || null,
        },
      },
    });
  } catch (error) {
    console.error("Get verification details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get verification details",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  verifyPassword,
  submitVerification,
  getVerificationStatus,
  getVerificationDetails,
};
