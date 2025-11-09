const express = require("express");
const adminController = require("../../controller/adminController");
const router = express.Router();

router.get("/verify-token", adminController.verifyToken);

router.post("/invite", adminController.sendInvitation);
router.post("/register", adminController.registerAdmin);
router.post("/login", adminController.loginAdmin);
router.get("/users/roles", adminController.getUsersByRole);

module.exports = router;
