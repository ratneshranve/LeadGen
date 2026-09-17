const mongoose = require("mongoose");

const leadSourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Source name is required"],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
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

const LeadSource = mongoose.model("LeadSource", leadSourceSchema);
module.exports = LeadSource;
