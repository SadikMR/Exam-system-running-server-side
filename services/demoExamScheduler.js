// services/demoExamScheduler.js

const cron = require("node-cron");
const LiveExam = require("../models/liveExam");
const demoExamQuestions = require("../data/demoExamQuestions");

class DemoExamScheduler {
  constructor() {
    this.task = null;
    this.isRunning = false;
  }

  /**
   * Create a new demo exam instance
   */
  async createDemoExam() {
    try {
      const now = new Date();
      const endTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
      const demoInstanceId = `demo-${Date.now()}`;

      console.log("🎯 Creating new demo exam instance...");
      console.log(`   Instance ID: ${demoInstanceId}`);
      console.log(`   Start Time: ${now.toISOString()}`);
      console.log(`   End Time: ${endTime.toISOString()}`);

      const demoExam = new LiveExam({
        title: demoExamQuestions.title,
        examType: demoExamQuestions.examType,
        examMode: "live",
        duration: demoExamQuestions.duration,
        startTime: now,
        endTime: endTime,
        password: null,
        isPremium: false,
        subjects: demoExamQuestions.subjects,
        status: "published",
        totalQuestions: demoExamQuestions.totalQuestions,
        tags: ["model-test"],
        passingScore: demoExamQuestions.passingScore,
        isDemo: true,
        demoInstanceId: demoInstanceId,
      });

      const savedExam = await demoExam.save();
      console.log(`✅ Demo exam created successfully! ID: ${savedExam._id}`);

      // Clean up old demo exams
      await this.cleanupOldDemoExams();

      return savedExam;
    } catch (error) {
      console.error("❌ Error creating demo exam:", error);
      throw error;
    }
  }

  /**
   * Clean up old demo exam instances
   * Keep only the most recent demo exam, delete all others
   */
  async cleanupOldDemoExams() {
    try {
      // Get all demo exams sorted by creation date (newest first)
      const allDemoExams = await LiveExam.find({ isDemo: true }).sort({ createdAt: -1 });
      
      // Keep only the most recent one, delete all others
      if (allDemoExams.length > 1) {
        const examsToDelete = allDemoExams.slice(1); // Skip first (most recent), delete rest
        const idsToDelete = examsToDelete.map(exam => exam._id);
        
        const result = await LiveExam.deleteMany({
          _id: { $in: idsToDelete }
        });

        if (result.deletedCount > 0) {
          console.log(`🧹 Cleaned up ${result.deletedCount} old demo exam(s)`);
        }
      }
    } catch (error) {
      console.error("❌ Error cleaning up old demo exams:", error);
    }
  }

  /**
   * Get current active demo exam
   */
  async getCurrentDemoExam() {
    try {
      const now = new Date();

      const demoExam = await LiveExam.findOne({
        isDemo: true,
        startTime: { $lte: now },
        endTime: { $gt: now },
        status: "published",
      }).sort({ startTime: -1 });

      return demoExam;
    } catch (error) {
      console.error("❌ Error fetching current demo exam:", error);
      return null;
    }
  }

  /**
   * Start the scheduler
   * Runs every 5 minutes: at 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55 minutes
   */
  start() {
    if (this.isRunning) {
      console.log("⚠️  Demo exam scheduler is already running");
      return;
    }

    console.log("🚀 Starting demo exam scheduler...");

    // Create initial demo exam
    this.createDemoExam();

    // Schedule to run every 5 minutes
    // Cron pattern: "*/5 * * * *" means every 5 minutes
    this.task = cron.schedule("*/5 * * * *", async () => {
      console.log("⏰ Demo exam scheduler triggered");
      await this.createDemoExam();
    });

    this.isRunning = true;
    console.log("✅ Demo exam scheduler started successfully");
    console.log("📅 New demo exams will be created every 5 minutes");
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.task) {
      this.task.stop();
      this.isRunning = false;
      console.log("🛑 Demo exam scheduler stopped");
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      message: this.isRunning
        ? "Demo exam scheduler is running"
        : "Demo exam scheduler is stopped",
    };
  }
}

// Create singleton instance
const demoExamScheduler = new DemoExamScheduler();

module.exports = demoExamScheduler;
