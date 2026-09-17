const mongoose = require("mongoose");

const rolePermissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["admin", "salesperson", "manager"],
    },
    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const RolePermission = mongoose.model("RolePermission", rolePermissionSchema);
module.exports = RolePermission;
