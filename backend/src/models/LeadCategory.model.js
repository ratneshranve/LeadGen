const mongoose = require("mongoose");

const leadCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category/Type name is required"],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
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

const LeadCategory = mongoose.model("LeadCategory", leadCategorySchema);
module.exports = LeadCategory;
