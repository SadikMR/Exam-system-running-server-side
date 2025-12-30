const LiveExamRegistration = require("../../models/liveExamRegistration.model");
const LiveExam = require("../../models/liveExam");

// @desc    Register user for a live exam
// @route   POST /liveExam/register
// @access  Private
exports.registerForExam = async (req, res) => {
  try {
    const { examId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!examId) {
      return res.status(400).json({
        success: false,
        message: "Exam ID is required",
      });
    }

    // Check if exam exists and is published
    const exam = await LiveExam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    if (exam.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Exam is not available for registration",
      });
    }

    // Check if exam has already started or ended
    const currentTime = new Date();
    if (new Date(exam.startTime) <= currentTime) {
      return res.status(400).json({
        success: false,
        message: "Registration is closed. Exam has already started.",
      });
    }
    
    if (new Date(exam.endTime) <= currentTime) {
      return res.status(400).json({
        success: false,
        message: "Registration is closed. Exam has already ended.",
      });
    }

    // Check if user is already registered
    const existingRegistration = await LiveExamRegistration.findOne({
      examId,
      userId,
      status: "registered",
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this exam",
      });
    }

    // Get IP address and user agent
    const ipAddress =
      req.ip ||
      req.connection?.remoteAddress ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      "Unknown";

    const userAgent = req.headers["user-agent"] || "Unknown";

    // Create registration
    const registration = new LiveExamRegistration({
      examId,
      userId,
      username: req.user.username || "Unknown",
      email: req.user.email || "Unknown",
      termsAccepted: true,
      acceptedAt: new Date(),
      ipAddress,
      userAgent,
      status: "registered",
    });

    await registration.save();

    res.status(201).json({
      success: true,
      message: "Successfully registered for the exam",
      registration: {
        id: registration._id,
        examId: registration.examId,
        registeredAt: registration.createdAt,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle duplicate registration (unique index violation)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this exam",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to register for exam",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Check if user is registered for an exam
// @route   GET /liveExam/registration/:examId
// @access  Private
exports.checkRegistration = async (req, res) => {
  try {
    const { examId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const registration = await LiveExamRegistration.findOne({
      examId,
      userId,
      status: "registered",
    });

    res.status(200).json({
      success: true,
      isRegistered: !!registration,
      registration: registration
        ? {
            id: registration._id,
            examId: registration.examId,
            registeredAt: registration.createdAt,
            termsAccepted: registration.termsAccepted,
          }
        : null,
    });
  } catch (error) {
    console.error("Check registration error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check registration status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get all registrations for a user
// @route   GET /liveExam/registration/user/:userId
// @access  Private
exports.getUserRegistrations = async (req, res) => {
  try {
    const { userId } = req.params;

    const registrations = await LiveExamRegistration.find({
      userId,
      status: "registered",
    })
      .populate("examId", "title examType code startTime endTime")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error("Get user registrations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch registrations",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

