// services/practiceExamScheduler.js

const cron = require("node-cron");
const LiveExam = require("../models/liveExam");
const LiveExamRegistration = require("../models/liveExamRegistration.model");
const practiceExamQuestions = require("../data/practiceExamQuestions");

class PracticeExamScheduler {
  constructor() {
    this.task = null;
    this.isRunning = false;
  }

  /**
   * Create a new practice exam instance
   */
  async createPracticeExam() {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      const endTime = new Date(startTime.getTime() + practiceExamQuestions.duration * 60 * 1000);
      const practiceInstanceId = `practice-${Date.now()}`;

      console.log("🎯 Creating new practice exam instance...");
      console.log(`   Instance ID: ${practiceInstanceId}`);
      console.log(`   Start Time: ${startTime.toISOString()} (24 hours from now)`);
      console.log(`   End Time: ${endTime.toISOString()}`);

      const practiceExam = new LiveExam({
        title: practiceExamQuestions.title,
        examType: practiceExamQuestions.examType,
        examMode: "live",
        duration: practiceExamQuestions.duration,
        startTime: startTime,
        endTime: endTime,
        password: null,
        isPremium: false,
        subjects: practiceExamQuestions.subjects,
        status: "published",
        totalQuestions: practiceExamQuestions.totalQuestions,
        tags: ["model-test"],
        passingScore: practiceExamQuestions.passingScore,
        isPractice: true,
        practiceInstanceId: practiceInstanceId,
      });

      const savedExam = await practiceExam.save();
      console.log(`✅ Practice exam created successfully! ID: ${savedExam._id}`);
      console.log(`📅 Exam will start in 24 hours`);

      return savedExam;
    } catch (error) {
      console.error("❌ Error creating practice exam:", error);
      throw error;
    }
  }

  /**
   * Check and manage practice exam instances
   * Delete if no registrations after 5 minutes, otherwise keep
   */
  async managePracticeExams() {
    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      // Find practice exams created more than 5 minutes ago that haven't started yet
      const oldPracticeExams = await LiveExam.find({
        isPractice: true,
        createdAt: { $lt: fiveMinutesAgo },
        startTime: { $gt: now }, // Haven't started yet
      });

      for (const exam of oldPracticeExams) {
        // Check if this exam has any registrations
        const registrationCount = await LiveExamRegistration.countDocuments({
          examId: exam._id,
        });

        if (registrationCount === 0) {
          // No registrations - delete and create new one
          await LiveExam.deleteOne({ _id: exam._id });
          console.log(`🗑️  Deleted practice exam ${exam._id} (no registrations)`);
          
          // Create new practice exam
          await this.createPracticeExam();
        } else {
          console.log(`✅ Keeping practice exam ${exam._id} (${registrationCount} registrations)`);
        }
      }

      // Clean up completed practice exams (older than 1 hour after end time)
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const result = await LiveExam.deleteMany({
        isPractice: true,
        endTime: { $lt: oneHourAgo },
      });

      if (result.deletedCount > 0) {
        console.log(`🧹 Cleaned up ${result.deletedCount} completed practice exam(s)`);
      }
    } catch (error) {
      console.error("❌ Error managing practice exams:", error);
    }
  }

  /**
   * Get current active practice exam
   */
  async getCurrentPracticeExam() {
    try {
      const now = new Date();

      const practiceExam = await LiveExam.findOne({
        isPractice: true,
        startTime: { $gt: now }, // Future exam
        status: "published",
      }).sort({ startTime: 1 }); // Get the earliest upcoming one

      return practiceExam;
    } catch (error) {
      console.error("❌ Error fetching current practice exam:", error);
      return null;
    }
  }

  /**
   * Start the scheduler
   * Runs every 5 minutes to check and manage practice exams
   */
  start() {
    if (this.isRunning) {
      console.log("⚠️  Practice exam scheduler is already running");
      return;
    }

    console.log("🚀 Starting practice exam scheduler...");

    // Check if practice exam exists, if not create one
    this.getCurrentPracticeExam().then((exam) => {
      if (!exam) {
        console.log("📝 No practice exam found, creating initial one...");
        this.createPracticeExam();
      } else {
        console.log(`✅ Practice exam already exists (ID: ${exam._id})`);
        console.log(`📅 Starts at: ${exam.startTime.toISOString()}`);
      }
    });

    // Schedule to run every 5 minutes
    this.task = cron.schedule("*/5 * * * *", async () => {
      console.log("⏰ Practice exam scheduler triggered");
      await this.managePracticeExams();
    });

    this.isRunning = true;
    console.log("✅ Practice exam scheduler started successfully");
    console.log("📅 Will check every 5 minutes for exam management");
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.task) {
      this.task.stop();
      this.isRunning = false;
      console.log("🛑 Practice exam scheduler stopped");
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      message: this.isRunning
        ? "Practice exam scheduler is running"
        : "Practice exam scheduler is stopped",
    };
  }
}

// Create singleton instance
const practiceExamScheduler = new PracticeExamScheduler();

module.exports = practiceExamScheduler;
