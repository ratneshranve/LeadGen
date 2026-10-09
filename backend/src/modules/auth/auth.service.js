const User = require("../../models/User.model");
const OtpVerification = require("../../models/OtpVerification.model");
const ApiError = require("../../utils/apiError");
const smsService = require("../../utils/smsProvider/SmsService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const logger = require("../../utils/logger");

const config = require("../../../config/env");

// Which backend roles may sign in to each frontend portal
const PORTAL_ROLES = {
  admin: ["admin", "manager"],
  sales: ["salesperson"],
};

/** Any Indian mobile format (+91..., 91..., spaces) -> its last 10 digits */
const toTenDigitPhone = (phone) => String(phone || "").replace(/\D/g, "").slice(-10);

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
    return this._issueOtp(phone);
  }

  /**
   * Phone + OTP login, step 1: send an OTP to a registered, active user of this portal
   */
  async sendLoginOtp(phone, portal) {
    const tenDigitPhone = toTenDigitPhone(phone);
    await this._findPortalUser(tenDigitPhone, portal);
    return this._issueOtp(tenDigitPhone);
  }

  /**
   * Phone + OTP login, step 2: verify the OTP and issue tokens
   */
  async verifyLoginOtp(phone, otp, portal, fcmToken = null) {
    const tenDigitPhone = toTenDigitPhone(phone);
    const user = await this._findPortalUser(tenDigitPhone, portal);
    await this._checkOtp(tenDigitPhone, otp);
    await OtpVerification.deleteOne({ phone: tenDigitPhone });

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

    return { user: userObj, accessToken, refreshToken };
  }

  /**
   * Find the active user with this mobile number who may use the given portal.
   * Stored phones may be "+91XXXXXXXXXX" or plain 10 digits, so match on the last 10.
   */
  async _findPortalUser(tenDigitPhone, portal) {
    if (!/^[6-9]\d{9}$/.test(tenDigitPhone)) {
      throw new ApiError(400, "Please enter a valid 10-digit mobile number.");
    }

    const user = await User.findOne({ phone: { $regex: `${tenDigitPhone}$` } });
    if (!user) {
      throw new ApiError(404, "No account is registered with this mobile number.");
    }
    if (user.status !== "active") {
      throw new ApiError(403, "Your account has been deactivated. Please contact your System Administrator.");
    }
    if (!PORTAL_ROLES[portal].includes(user.role)) {
      throw new ApiError(
        403,
        portal === "admin"
          ? "Access denied: Only Admin accounts can sign in here. Please use the Sales App Login."
          : "Notice: This is an Admin account. Please use the Admin Portal Login."
      );
    }
    return user;
  }

  /**
   * Generate, store and SMS a new OTP (with resend cooldown)
   */
  async _issueOtp(phone) {
    const existingOtpRecord = await OtpVerification.findOne({ phone });

    // 1. Resend Protection: 60 Seconds Cooldown
    if (existingOtpRecord) {
      const timeSinceLastSent = (Date.now() - new Date(existingOtpRecord.lastSentAt).getTime()) / 1000;
      if (timeSinceLastSent < 60) {
        const remainingSeconds = Math.ceil(60 - timeSinceLastSent);
        throw new ApiError(429, `Resend protection active. Please wait ${remainingSeconds} seconds before requesting a new OTP.`);
      }
    }

    // 2. Generate 6-digit OTP (or the fixed test OTP when USE_DEFAULT_OTP=true)
    const useDefaultOtp = config.otp.useDefault;
    const rawOtp = useDefaultOtp ? config.otp.defaultOtp : crypto.randomInt(100000, 999999).toString();
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

    // 4. Dispatch SMS via Provider Interface. On failure, drop the record so the
    //    user can retry immediately instead of waiting out the resend cooldown.
    if (useDefaultOtp) {
      logger.warn(`[OTP] USE_DEFAULT_OTP=true - SMS skipped for ${phone}, default OTP accepted.`);
      return { phone, expiresInSeconds: 300, resendCooldownSeconds: 60 };
    }
    try {
      await smsService.sendOtp(phone, rawOtp);
    } catch (err) {
      await OtpVerification.deleteOne({ phone });
      throw new ApiError(502, `Could not send the OTP SMS. Please try again. (${err.message})`);
    }

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
    const otpRecord = await this._checkOtp(phone, otp);

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
   * Validate an OTP against the stored hash (attempt limit + expiry). Returns the record.
   */
  async _checkOtp(phone, otp) {
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

    return otpRecord;
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
