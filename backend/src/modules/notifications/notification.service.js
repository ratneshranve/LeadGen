const Notification = require("../../models/Notification.model");
const User = require("../../models/User.model");
const fcmService = require("../../services/fcm.service");
const logger = require("../../utils/logger");
const ApiError = require("../../utils/apiError");

class NotificationService {
  /**
   * Register or add device token for a user
   */
  async registerDeviceToken(userId, deviceToken) {
    if (!deviceToken) {
      throw new ApiError(400, "Device token is required");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!user.fcmTokens.includes(deviceToken)) {
      user.fcmTokens.push(deviceToken);
      await user.save();
    }

    return { userId, fcmTokensCount: user.fcmTokens.length };
  }

  /**
   * Remove device token for a user (e.g. on logout)
   */
  async removeDeviceToken(userId, deviceToken) {
    if (!deviceToken) {
      throw new ApiError(400, "Device token is required");
    }

    await User.updateOne({ _id: userId }, { $pull: { fcmTokens: deviceToken } });
    return { userId, deviceToken, status: "removed" };
  }

  /**
   * Primary entry point: Create database record & dispatch FCM push notification
   */
  async sendNotification(
    { recipientId = null, targetRole = "salesperson", type, title, message, data = {} },
    session = null
  ) {
    // 1. Persistence to MongoDB
    const notifObj = {
      recipientId,
      targetRole,
      type,
      title,
      message,
      data,
    };

    let notificationRecord;
    if (session) {
      const created = await Notification.create([notifObj], { session });
      notificationRecord = created[0];
    } else {
      notificationRecord = await Notification.create(notifObj);
    }

    // 2. Fetch Recipient Device Tokens for Push Delivery
    try {
      let tokens = [];
      if (recipientId) {
        const user = await User.findById(recipientId).select("fcmTokens");
        if (user && user.fcmTokens) {
          tokens = user.fcmTokens;
        }
      } else if (targetRole) {
        const roleQuery = targetRole === "all" ? {} : { role: targetRole };
        const users = await User.find(roleQuery).select("fcmTokens");
        users.forEach((u) => {
          if (u.fcmTokens && u.fcmTokens.length > 0) {
            tokens.push(...u.fcmTokens);
          }
        });
      }

      // Filter empty / null tokens
      tokens = [...new Set(tokens.filter(Boolean))];

      // 3. Dispatch to FCM Provider Layer
      if (tokens.length > 0) {
        await fcmService.sendMulticast({
          tokens,
          title,
          body: message,
          data: { ...data, type, notificationId: notificationRecord._id.toString() },
          userId: recipientId,
        });
      }
    } catch (err) {
      logger.error(`Failed to dispatch push notification: ${err.message}`);
    }

    return notificationRecord;
  }

  // --- Convenience Trigger Methods for Business Modules ---

  async notifyNewLead(lead, createdByUser) {
    return await this.sendNotification({
      targetRole: "admin",
      type: "NEW_LEAD",
      title: "New Lead Created",
      message: `Lead '${lead.name}' from ${lead.company || "Individual"} was added by ${createdByUser.name}.`,
      data: { leadId: lead._id.toString(), customLeadId: lead.customLeadId },
    });
  }

  async notifyLeadAssignment(lead, assignedUser) {
    return await this.sendNotification({
      recipientId: assignedUser._id,
      targetRole: "salesperson",
      type: "LEAD_ASSIGNMENT",
      title: "Lead Assigned to You",
      message: `Lead '${lead.name}' (${lead.phone}) has been assigned to you.`,
      data: { leadId: lead._id.toString(), customLeadId: lead.customLeadId },
    });
  }

  async notifyFollowUpReminder(followUp, user) {
    return await this.sendNotification({
      recipientId: user._id,
      targetRole: "salesperson",
      type: "FOLLOWUP_REMINDER",
      title: "Follow-up Scheduled",
      message: `Follow-up for Lead '${followUp.leadId?.name || "Lead"}' is scheduled.`,
      data: { followUpId: followUp._id.toString(), leadId: followUp.leadId?._id?.toString() || "" },
    });
  }

  async notifyTaskReminder(task, user) {
    return await this.sendNotification({
      recipientId: user._id,
      targetRole: "salesperson",
      type: "TASK_REMINDER",
      title: "Task Assigned / Due",
      message: `Task: ${task.title} is assigned to you.`,
      data: { taskId: task._id.toString() },
    });
  }

  async notifyImportantActivity(lead, activityTitle, description, user) {
    return await this.sendNotification({
      recipientId: lead.assignedTo || null,
      targetRole: lead.assignedTo ? "salesperson" : "admin",
      type: "IMPORTANT_ACTIVITY",
      title: activityTitle,
      message: description,
      data: { leadId: lead._id.toString() },
    });
  }

  // --- Read Status Queries ---

  async getUserNotifications(user) {
    const query = {};

    if (user.role === "admin") {
      query.$or = [{ targetRole: "admin" }, { targetRole: "all" }, { recipientId: user._id }];
    } else {
      query.$or = [
        { recipientId: user._id },
        { targetRole: "salesperson" },
        { targetRole: "all" },
      ];
    }

    return await Notification.find(query).sort("-createdAt").limit(50);
  }

  async markAsRead(notificationId, user) {
    const notif = await Notification.findById(notificationId);
    if (notif) {
      notif.isRead = true;
      await notif.save();
    }
    return notif;
  }

  async markAllAsRead(user) {
    const query = {};
    if (user.role === "admin") {
      query.$or = [{ targetRole: "admin" }, { targetRole: "all" }, { recipientId: user._id }];
    } else {
      query.$or = [{ recipientId: user._id }, { targetRole: "salesperson" }, { targetRole: "all" }];
    }

    await Notification.updateMany(query, { $set: { isRead: true } });
    return true;
  }
}

module.exports = new NotificationService();
