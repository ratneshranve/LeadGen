const mongoose = require("mongoose");

const ACTIVITY_TYPES = [
  // Lead Lifecycle
  "LEAD_CREATED",
  "LEAD_UPDATED",
  "LEAD_DELETED",
  // Status & Stage
  "STATUS_CHANGED",
  "STAGE_CHANGED",
  // Assignment
  "LEAD_ASSIGNED",
  "LEAD_REASSIGNED",
  "LEAD_UNASSIGNED",
  // Follow-ups
  "FOLLOWUP_CREATED",
  "FOLLOWUP_UPDATED",
  "FOLLOWUP_COMPLETED",
  "FOLLOWUP_CANCELLED",
  // Tasks
  "TASK_CREATED",
  "TASK_UPDATED",
  "TASK_COMPLETED",
  "TASK_ASSIGNED",
  // Notes
  "NOTE_ADDED",
  "NOTE_UPDATED",
  // Products / Services
  "PRODUCT_ADDED",
  "PRODUCT_REMOVED",
  // Attachments
  "ATTACHMENT_ADDED",
  "ATTACHMENT_REMOVED",
  // Legacy support
  "CREATED",
  "ASSIGNED",
  "REASSIGNED",
  "NOTE_ADDED",
  "FOLLOWUP_SCHEDULED",
  "FOLLOWUP_COMPLETED",
  "STAGE_MOVED",
];

const activitySchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userRole: {
      type: String,
      default: null,
    },
    actionType: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ["lead", "followup", "task", "note", "product", "attachment", "stage", "status", "assignment"],
      default: "lead",
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

activitySchema.index({ leadId: 1, createdAt: -1 });
activitySchema.index({ userId: 1, createdAt: -1 });

const Activity = mongoose.model("Activity", activitySchema);
module.exports = Activity;
