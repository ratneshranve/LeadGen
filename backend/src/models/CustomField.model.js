const mongoose = require("mongoose");

const customFieldSchema = new mongoose.Schema(
  {
    fieldName: {
      type: String,
      required: [true, "Field name is required"],
      trim: true,
    },
    fieldKey: {
      type: String,
      required: [true, "Field key is required"],
      unique: true,
      trim: true,
    },
    fieldType: {
      type: String,
      enum: ["text", "number", "select", "date", "boolean"],
      required: true,
    },
    options: [
      {
        type: String,
        trim: true,
      },
    ],
    isRequired: {
      type: Boolean,
      default: false,
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

const CustomField = mongoose.model("CustomField", customFieldSchema);
module.exports = CustomField;
