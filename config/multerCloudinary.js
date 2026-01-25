const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary.js");

// Storage for verification images
const verificationStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "verification-images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
    upload_preset: "OnlineExam",
  },
});

// Storage for profile images
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile-images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
    upload_preset: "OnlineExam",
  },
});

const verificationUpload = multer({
  storage: verificationStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

const profileUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Export verification upload as default for backward compatibility
module.exports = verificationUpload;
module.exports.profileUpload = profileUpload;
module.exports.verificationUpload = verificationUpload;
