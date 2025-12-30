const express = require("express");
const router = express.Router();
const profileController = require("../controller/profileController");
const authMiddleware = require("../middleware/userAuthMiddleware");
const upload = require("../config/multerCloudinary");

// Profile routes (protected)
router.get("/profile", authMiddleware, profileController.getProfile);
router.put("/profile", authMiddleware, profileController.updateProfile);

// Password verification - before allowing image verification
router.post(
  "/profile/verify-password",
  authMiddleware,
  profileController.verifyPassword
);

// Verification routes (protected) - Cloudinary upload
router.post(
  "/profile/verify",
  authMiddleware,
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "left", maxCount: 1 },
    { name: "right", maxCount: 1 },
    { name: "up", maxCount: 1 },
  ]),
  profileController.submitVerification
);

router.get(
  "/profile/verification-status",
  authMiddleware,
  profileController.getVerificationStatus
);

router.get(
  "/profile/verification-details",
  authMiddleware,
  profileController.getVerificationDetails
);

module.exports = router;
