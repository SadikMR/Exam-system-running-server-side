// routes/liveExam.js

const express = require("express");
const { createLiveExam } = require("../controller/createLiveExam");

const router = express.Router();

// POST /liveExam/Create
router.post("/create", createLiveExam);

// New mock data route
router.get("/mock", (req, res) => {
  try {
    const { mockApiResponse } = require("../data/mockLiveExams");
    res.json(mockApiResponse);
  } catch (error) {
    console.error("Error serving mock data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load mock data",
      error: error.message,
    });
  }
});

module.exports = router;
