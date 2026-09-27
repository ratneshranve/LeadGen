const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: [true, "Lead reference is required"],
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned salesperson is required"],
      index: true,
    },
    type: {
      type: String,
      enum: ["Call", "Meeting", "WhatsApp", "Email"],
      default: "Call",
    },
    scheduledAt: {
      type: Date,
      required: [true, "Scheduled date/time is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Cancelled", "Overdue"],
      default: "Pending",
      index: true,
    },
    notes: {
      type: String,
      default: "",
    },
    completedAt: {
      type: Date,
      default: null,
    },
    // Automation engine bookkeeping (backend/src/jobs/followupReminders.job.js) - prevents
    // the same due-soon reminder / overdue escalation from firing more than once.
    reminderSentAt: {
      type: Date,
      default: null,
    },
    escalatedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Indexes for query performance
followUpSchema.index({ assignedTo: 1, isDeleted: 1, scheduledAt: 1 }, { name: "followup_assigned_scheduledAt" });
followUpSchema.index({ status: 1, isDeleted: 1, scheduledAt: 1 }, { name: "followup_status_scheduledAt" });
followUpSchema.index({ leadId: 1, isDeleted: 1, scheduledAt: -1 }, { name: "followup_lead_scheduledAt" });

// Mongoose Pre-find middleware for Soft Delete filtering
followUpSchema.pre(/^find/, function (next) {
  if (!this.getOptions().withDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

const FollowUp = mongoose.model("FollowUp", followUpSchema);
module.exports = FollowUp;
