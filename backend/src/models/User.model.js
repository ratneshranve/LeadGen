const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "salesperson", "manager"],
      default: "salesperson",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    avatarPublicId: {
      type: String,
      default: null,
    },
    fcmTokens: {
      type: [String],
      default: [],
    },
    // Automatic-assignment engine (backend/src/services/leadAssignment.service.js)
    maxActiveLeads: {
      type: Number,
      default: 20,
    },
    specializations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LeadCategory",
      },
    ],
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
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

// Text Index for user search
userSchema.index({ name: "text", email: "text", phone: "text" }, { name: "user_text_search" });

// Compound Indexes for user filtering & sorting
userSchema.index({ role: 1, isDeleted: 1, createdAt: -1 }, { name: "user_role_list" });
userSchema.index({ status: 1, isDeleted: 1 }, { name: "user_status" });

// Mongoose Pre-find middleware for Soft Delete filtering
userSchema.pre(/^find/, function (next) {
  if (!this.getOptions().withDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

// Password Hashing before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Method to verify password
userSchema.methods.isPasswordMatch = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

// Method to generate Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
    }
  );
};

// Method to generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
    }
  );
};

const User = mongoose.model("User", userSchema);
module.exports = User;
