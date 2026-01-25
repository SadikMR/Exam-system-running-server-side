const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const authMiddleware = require("../middleware/userAuthMiddleware");
const { profileUpload } = require("../config/multerCloudinary");

// Public routes
router.post("/register", profileUpload.single("image"), userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/verify-email", userController.verifyEmail);
router.post("/resend-verification-code", userController.resendVerificationCode);
router.post("/request-password-reset", userController.requestPasswordReset);
router.post("/verify-reset-code", userController.verifyResetCode);
router.post("/reset-password", userController.resetPassword);

// Public user profile route (for viewing other users)
const userProfileController = require("../controller/userProfileController");
router.get("/profile/:userId", userProfileController.getUserProfile);

// Protected routes requiring JWT auth
router.get("/profile", authMiddleware, userController.getUserProfile);
router.put("/profile", authMiddleware, userController.updateUserProfile);

module.exports = router;
