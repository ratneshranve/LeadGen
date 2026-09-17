const mongoose = require("mongoose");

const pipelineStageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Stage name is required"],
      trim: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      default: "#ff3b19",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const PipelineStage = mongoose.model("PipelineStage", pipelineStageSchema);
module.exports = PipelineStage;
