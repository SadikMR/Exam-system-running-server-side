const express = require("express");
const { registerUser } = require("../controller/registration.controller.js");
const { login } = require("../controller/login.controller.js");
const router = express.Router();

// POST route for user registration
router.post("/register", registerUser);
router.post("/login", login);

module.exports = router;
