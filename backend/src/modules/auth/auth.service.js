const User = require("../../models/User.model");
const OtpVerification = require("../../models/OtpVerification.model");
const ApiError = require("../../utils/apiError");
const smsService = require("../../utils/smsProvider/SmsService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const config = require("../../../config/env");

class AuthService {
  /**
   * Register a new user
   */
  async registerUser(userData) {
    const existingUser = await User.findOne({
      $or: [{ email: userData.email }, { phone: userData.phone }],
    });

    if (existingUser) {
      throw new ApiError(400, "User with this email or phone number already exists.");
    }

    const user = await User.create({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      passwordHash: userData.password,
      role: userData.role || "salesperson",
      status: "active",
    });

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Store Refresh Token in DB
    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refreshToken } });

    const sanitizedUser = await User.findById(user._id);

    return {
      user: sanitizedUser,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Email/Password Login
   */
  async loginUser(email, password, fcmToken = null) {
    const user = await User.findOne({ email }).select("+passwordHash +refreshTokens");

    if (!user) {
      throw new ApiError(401, "Invalid email or password credentials.");
    }

    if (user.status !== "active") {
      throw new ApiError(403, "Your account has been deactivated. Please contact your System Administrator.");
    }

    const isMatch = await user.isPasswordMatch(password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password credentials.");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    const updateQuery = { $push: { refreshTokens: refreshToken } };
    if (fcmToken && !user.fcmTokens.includes(fcmToken)) {
      updateQuery.$addToSet = { fcmTokens: fcmToken };
    }

    await User.findByIdAndUpdate(user._id, updateQuery);

    const userObj = user.toObject();
    delete userObj.passwordHash;
    delete userObj.refreshTokens;

    return {
      user: userObj,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Request OTP for Phone Authentication / Password Reset
   */
  async sendOtp(phone) {
    const existingOtpRecord = await OtpVerification.findOne({ phone });

    // 1. Resend Protection: 60 Seconds Cooldown
    if (existingOtpRecord) {
      const timeSinceLastSent = (Date.now() - new Date(existingOtpRecord.lastSentAt).getTime()) / 1000;
      if (timeSinceLastSent < 60) {
        const remainingSeconds = Math.ceil(60 - timeSinceLastSent);
        throw new ApiError(429, `Resend protection active. Please wait ${remainingSeconds} seconds before requesting a new OTP.`);
      }
    }

    // 2. Generate 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(rawOtp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 Minutes Expiration

    // 3. Upsert OTP Record
    await OtpVerification.findOneAndUpdate(
      { phone },
      {
        otpHash,
        attempts: 0,
        lastSentAt: new Date(),
        expiresAt,
        isVerified: false,
      },
      { upsert: true, new: true }
    );

    // 4. Dispatch SMS via Provider Interface
    await smsService.sendOtp(phone, rawOtp);

    return {
      phone,
      expiresInSeconds: 300,
      resendCooldownSeconds: 60,
    };
  }

  /**
   * Verify OTP and Login / Authenticate Phone
   */
  async verifyOtp(phone, otp) {
    const otpRecord = await OtpVerification.findOne({ phone });

    if (!otpRecord) {
      throw new ApiError(400, "OTP has expired or was not requested for this phone number.");
    }

    // 1. Check Max Attempt Limits (Max 5 Failed Attempts)
    if (otpRecord.attempts >= 5) {
      await OtpVerification.deleteOne({ phone });
      throw new ApiError(429, "Too many failed OTP attempts. Maximum limit exceeded. Please request a new OTP.");
    }

    // 2. Check Expiration
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await OtpVerification.deleteOne({ phone });
      throw new ApiError(400, "OTP has expired. Please request a new OTP.");
    }

    // 3. Compare OTP Hash
    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remainingAttempts = 5 - otpRecord.attempts;
      throw new ApiError(400, `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`);
    }

    // 4. Mark as Verified
    otpRecord.isVerified = true;
    await otpRecord.save();

    // 5. If Phone corresponds to registered active User, log them in
    const user = await User.findOne({ phone });
    if (!user) {
      return {
        phone,
        isVerified: true,
        userExists: false,
        message: "Phone number verified successfully. Please proceed with registration.",
      };
    }

    if (user.status !== "active") {
      throw new ApiError(403, "Your account has been deactivated. Please contact your System Administrator.");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refreshToken } });
    await OtpVerification.deleteOne({ phone });

    const userObj = user.toObject();
    delete userObj.passwordHash;

    return {
      user: userObj,
      accessToken,
      refreshToken,
      isVerified: true,
      userExists: true,
    };
  }

  /**
   * Refresh Token Rotation Strategy
   */
  async refreshTokens(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      const user = await User.findById(decoded._id).select("+refreshTokens");

      if (!user || user.status !== "active" || !user.refreshTokens.includes(refreshToken)) {
        throw new ApiError(401, "Invalid, revoked, or expired refresh token.");
      }

      const newAccessToken = user.generateAccessToken();
      const newRefreshToken = user.generateRefreshToken();

      // Token Rotation: Swap old refresh token with new one
      await User.findByIdAndUpdate(user._id, {
        $pull: { refreshTokens: refreshToken },
        $push: { refreshTokens: newRefreshToken },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (err) {
      throw new ApiError(401, "Invalid or expired refresh token.");
    }
  }

  /**
   * Revoke Session & Logout
   */
  async logoutUser(userId, refreshToken) {
    if (refreshToken) {
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: refreshToken },
      });
    }
    return true;
  }
}

module.exports = new AuthService();
