const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned user is required"],
      index: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
      index: true,
    },
    dueDate: {
      type: Date,
      required: [true, "Task due date is required"],
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
      index: true,
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

// Text Index for task search
taskSchema.index({ title: "text", description: "text" }, { name: "task_text_search" });

// Compound Indexes for filtering and sorting
taskSchema.index({ assignedTo: 1, isDeleted: 1, dueDate: 1 }, { name: "task_assigned_dueDate" });
taskSchema.index({ status: 1, isDeleted: 1, dueDate: 1 }, { name: "task_status_dueDate" });
taskSchema.index({ leadId: 1, isDeleted: 1 }, { name: "task_leadId" });

taskSchema.pre(/^find/, function (next) {
  if (!this.getOptions().withDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
