const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    customLeadId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
    },
    company: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, "Lead phone number is required"],
      trim: true,
      index: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeadSource",
      required: [true, "Lead source is required"],
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeadCategory",
      default: null,
      index: true,
    },
    stageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PipelineStage",
      required: [true, "Pipeline stage is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Follow-up", "Interested", "Converted", "Lost"],
      default: "New",
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    estimatedValue: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    lossReason: {
      type: String,
      default: null,
    },
    nextFollowUpDate: {
      type: Date,
      default: null,
      index: true,
    },
    customFieldsData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    attachments: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        fileName: { type: String, required: true },
        fileType: { type: String, enum: ["image", "document"], required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Full-Text Index (search across name, company, email, phone, customLeadId) ──
leadSchema.index(
  { name: "text", company: "text", email: "text", phone: "text", customLeadId: "text" },
  { name: "lead_text_search", weights: { name: 10, phone: 5, customLeadId: 5, email: 3, company: 1 } }
);

// ── Compound indexes for common filter combinations ────────────────────────────
// Default list: isDeleted + sort by createdAt
leadSchema.index({ isDeleted: 1, createdAt: -1 }, { name: "lead_list_default" });

// Status filter (most common single filter)
leadSchema.index({ isDeleted: 1, status: 1, createdAt: -1 }, { name: "lead_by_status" });

// Assigned salesperson scoping (salesperson dashboard)
leadSchema.index({ assignedTo: 1, isDeleted: 1, createdAt: -1 }, { name: "lead_by_assignedTo" });
leadSchema.index({ createdBy: 1, isDeleted: 1, createdAt: -1 }, { name: "lead_by_createdBy" });

// Source filter
leadSchema.index({ sourceId: 1, isDeleted: 1, createdAt: -1 }, { name: "lead_by_source" });

// Stage filter
leadSchema.index({ stageId: 1, isDeleted: 1, createdAt: -1 }, { name: "lead_by_stage" });

// Category (lead type) filter
leadSchema.index({ categoryId: 1, isDeleted: 1, createdAt: -1 }, { name: "lead_by_category" });

// Combined: salesperson + status (most common for salesperson panel)
leadSchema.index({ assignedTo: 1, status: 1, isDeleted: 1 }, { name: "lead_assignedTo_status" });

// Combined: stage + status (pipeline view)
leadSchema.index({ stageId: 1, status: 1, isDeleted: 1 }, { name: "lead_stage_status" });

// Follow-up date range queries
leadSchema.index({ nextFollowUpDate: 1, isDeleted: 1 }, { name: "lead_followup_date" });

// Estimated value sorting
leadSchema.index({ isDeleted: 1, estimatedValue: -1 }, { name: "lead_by_value" });

// Pre-find middleware for Soft Delete filtering
leadSchema.pre(/^find/, function (next) {
  if (!this.getOptions().withDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

const Lead = mongoose.model("Lead", leadSchema);
module.exports = Lead;
