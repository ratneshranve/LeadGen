const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    targetRole: {
      type: String,
      enum: ["admin", "salesperson", "all"],
      default: "salesperson",
      index: true,
    },
    type: {
      type: String,
      enum: [
        "NEW_LEAD",
        "LEAD_ASSIGNMENT",
        "FOLLOWUP_REMINDER",
        "TASK_REMINDER",
        "IMPORTANT_ACTIVITY",
        "SYSTEM",
        "NEW LEAD",
        "FOLLOW-UP",
        "ASSIGNMENT",
        "PIPELINE",
        "RECENT ACTIVITY",
        "STATUS",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
