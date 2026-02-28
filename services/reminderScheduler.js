// services/reminderScheduler.js
// Runs every 60 seconds. Finds reminders due in 55-65 min window and sends emails.

const ExamReminder = require("../models/examReminder.model");
const { sendExamReminderEmail } = require("../utils/emailService");

let schedulerInterval = null;

const processReminders = async () => {
  try {
    const now = new Date();
    // Window: exam starts between 55 and 65 minutes from now
    const windowStart = new Date(now.getTime() + 55 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 65 * 60 * 1000);

    const dueReminders = await ExamReminder.find({
      reminderSent: false,
      startTime: { $gte: windowStart, $lte: windowEnd },
    });

    if (dueReminders.length === 0) return;

    console.log(`⏰ Reminder scheduler: found ${dueReminders.length} reminder(s) to send`);

    for (const reminder of dueReminders) {
      try {
        await sendExamReminderEmail(
          reminder.email,
          reminder.username,
          reminder.examTitle,
          reminder.startTime
        );

        reminder.reminderSent = true;
        reminder.sentAt = new Date();
        await reminder.save();

        console.log(`✅ Reminder sent to ${reminder.email} for exam: ${reminder.examTitle}`);
      } catch (err) {
        console.error(`❌ Failed to send reminder to ${reminder.email}:`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ Reminder scheduler error:", err.message);
  }
};

const startReminderScheduler = () => {
  if (schedulerInterval) {
    console.log("⚠️  Reminder scheduler already running");
    return;
  }
  console.log("🔔 Starting exam reminder scheduler (checks every 60s)...");
  // Run immediately then every 60 seconds
  processReminders();
  schedulerInterval = setInterval(processReminders, 60 * 1000);
};

const stopReminderScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("🛑 Reminder scheduler stopped");
  }
};

module.exports = { startReminderScheduler, stopReminderScheduler };
