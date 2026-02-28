const ExamReminder = require("../../models/examReminder.model");
const LiveExam = require("../../models/liveExam");
const User = require("../../models/User/users");

// POST /liveExam/reminder — set a reminder for an exam
const setReminder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { examId } = req.body;

    if (!examId) {
      return res.status(400).json({ success: false, message: "examId is required" });
    }

    // Get exam details
    const exam = await LiveExam.findById(examId).select("title startTime endTime status isDemo isPractice");
    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }

    // Get user email and username
    const user = await User.findById(userId).select("email username name");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Upsert reminder (idempotent — clicking twice won't duplicate)
    const reminder = await ExamReminder.findOneAndUpdate(
      { examId, userId },
      {
        email: user.email,
        username: user.username || user.name,
        examTitle: exam.title,
        startTime: exam.startTime,
        reminderSent: false,
        sentAt: null,
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Reminder set! You'll receive an email 1 hour before the exam.",
      reminder: { id: reminder._id, examId, startTime: exam.startTime },
    });
  } catch (err) {
    console.error("setReminder error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /liveExam/reminder/:examId — remove a reminder
const removeReminder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { examId } = req.params;

    const result = await ExamReminder.findOneAndDelete({ examId, userId });

    if (!result) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    return res.status(200).json({ success: true, message: "Reminder removed" });
  } catch (err) {
    console.error("removeReminder error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /liveExam/reminders — get all active reminder examIds for the current user
const getUserReminders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const reminders = await ExamReminder.find({
      userId,
      reminderSent: false,
    }).select("examId");

    const examIds = reminders.map((r) => r.examId.toString());

    return res.status(200).json({ success: true, examIds });
  } catch (err) {
    console.error("getUserReminders error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { setReminder, removeReminder, getUserReminders };
