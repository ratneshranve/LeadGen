const cron = require("node-cron");
const FollowUp = require("../models/FollowUp.model");
const User = require("../models/User.model");
const notificationService = require("../modules/notifications/notification.service");
const logger = require("../utils/logger");

let scheduled = false;

// Follow-ups within this many minutes of "now" get a reminder.
const REMINDER_WINDOW_MINUTES = 15;
// Follow-ups overdue by more than this get escalated to the assigned rep's manager once.
const ESCALATION_OVERDUE_HOURS = 24;

async function runFollowUpSweep() {
  const now = new Date();

  // 1. Due-soon reminders (SOP section 31/32) - one push per follow-up per sweep window,
  // scoped by scheduledAt falling inside the current reminder window so the same
  // follow-up isn't re-notified every 15 minutes.
  const windowStart = now;
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MINUTES * 60000);

  const dueSoon = await FollowUp.find({
    status: "Pending",
    isDeleted: false,
    scheduledAt: { $gte: windowStart, $lt: windowEnd },
    reminderSentAt: null,
  }).populate("leadId", "name company");

  for (const followUp of dueSoon) {
    await notificationService.sendNotification({
      recipientId: followUp.assignedTo,
      targetRole: "salesperson",
      type: "FOLLOWUP_REMINDER",
      title: "Follow-up Due Soon",
      message: `${followUp.type} with '${followUp.leadId?.name || "a lead"}' is due at ${followUp.scheduledAt.toLocaleTimeString()}.`,
      data: { followUpId: followUp._id, leadId: followUp.leadId?._id },
    });
    followUp.reminderSentAt = now;
    await followUp.save();
  }

  // 2. Escalation for follow-ups overdue by more than ESCALATION_OVERDUE_HOURS with no
  // status change - notify an admin/manager (SOP section 44's "important lead not
  // handled -> manager notification").
  const overdueThreshold = new Date(now.getTime() - ESCALATION_OVERDUE_HOURS * 3600000);
  const severelyOverdue = await FollowUp.find({
    status: "Pending",
    isDeleted: false,
    scheduledAt: { $lt: overdueThreshold },
    escalatedAt: null,
  }).populate("leadId", "name").populate("assignedTo", "name");

  if (severelyOverdue.length > 0) {
    const managers = await User.find({ role: { $in: ["admin", "manager"] }, status: "active" });
    for (const followUp of severelyOverdue) {
      for (const manager of managers) {
        await notificationService.sendNotification({
          recipientId: manager._id,
          targetRole: "admin",
          type: "FOLLOWUP_REMINDER",
          title: "Overdue Follow-up Escalation",
          message: `${followUp.assignedTo?.name || "A rep"}'s follow-up with '${followUp.leadId?.name || "a lead"}' is over ${ESCALATION_OVERDUE_HOURS}h overdue.`,
          data: { followUpId: followUp._id, leadId: followUp.leadId?._id },
        });
      }
      followUp.escalatedAt = now;
      await followUp.save();
    }
  }

  if (dueSoon.length > 0 || severelyOverdue.length > 0) {
    logger.info(`[followupReminders] Sent ${dueSoon.length} due-soon reminder(s), ${severelyOverdue.length} escalation(s)`);
  }
}

function startFollowUpReminderJob() {
  if (scheduled) return; // guard against double-registration under nodemon restarts
  scheduled = true;

  // Every 15 minutes - matches REMINDER_WINDOW_MINUTES so nothing is missed or duplicated.
  cron.schedule("*/15 * * * *", () => {
    runFollowUpSweep().catch((err) => logger.error(`[followupReminders] Sweep failed: ${err.message}`));
  });

  logger.info("[followupReminders] Scheduled follow-up reminder sweep every 15 minutes");
}

module.exports = { startFollowUpReminderJob, runFollowUpSweep };
