const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const authMiddleware = require("../middleware/userAuthMiddleware");

// Public routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/request-password-reset", userController.requestPasswordReset);
router.post("/reset-password", userController.resetPassword);

// Protected routes requiring JWT auth
router.get("/profile", authMiddleware, userController.getUserProfile);
router.put("/profile", authMiddleware, userController.updateUserProfile);

module.exports = router;
