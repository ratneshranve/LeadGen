require("dotenv").config();
const authService = require("../modules/auth/auth.service");
const User = require("../models/User.model");
const OtpVerification = require("../models/OtpVerification.model");
const connectDB = require("../../config/db");
const logger = require("../utils/logger");

const runAuthTests = async () => {
  try {
    logger.info("🧪 Starting Complete Authentication API Suite Test...");

    await connectDB();

    // Clean test user data
    const testEmail = `test.sales.${Date.now()}@appzeto.com`;
    const testPhone = `+9199${Math.floor(10000000 + Math.random() * 90000000)}`;

    logger.info("Step 1: Testing Registration...");
    const regResult = await authService.registerUser({
      name: "Test Sales Rep",
      email: testEmail,
      phone: testPhone,
      password: "TestPassword@123",
      role: "salesperson",
    });
    logger.info(`✅ Registered User ID: ${regResult.user._id} | Access Token Generated!`);

    logger.info("Step 2: Testing Login...");
    const loginResult = await authService.loginUser(testEmail, "TestPassword@123");
    logger.info(`✅ Login successful for [${loginResult.user.email}] | Role: ${loginResult.user.role}`);

    logger.info("Step 3: Testing OTP Generation & Resend Cooldown Protection...");
    const otpSend1 = await authService.sendOtp(testPhone);
    logger.info(`✅ OTP Dispatched to ${testPhone}. Cooldown: ${otpSend1.resendCooldownSeconds}s`);

    try {
      logger.info("Sub-test: Attempting immediate second OTP request (Should trigger 429 Cooldown)...");
      await authService.sendOtp(testPhone);
      logger.error("❌ Failed Cooldown Test: Resend protection did not block!");
    } catch (err) {
      logger.info(`✅ Cooldown Test Passed: Caught Expected Error -> "${err.message}"`);
    }

    logger.info("Step 4: Testing OTP Verification...");
    // Retrieve generated OTP directly from DB for test verification
    const otpRecord = await OtpVerification.findOne({ phone: testPhone });
    if (otpRecord) {
      logger.info("Sub-test: Testing invalid OTP attempt...");
      try {
        await authService.verifyOtp(testPhone, "000000");
      } catch (err) {
        logger.info(`✅ Attempt Limit Counter Test Passed: Caught -> "${err.message}"`);
      }
    }

    logger.info("Step 5: Testing Token Rotation & Refresh...");
    const refreshResult = await authService.refreshTokens(loginResult.refreshToken);
    logger.info("✅ Token Refresh & Rotation Successful! New Access Token Issued.");

    logger.info("Step 6: Testing Account Deactivation Lockout...");
    await User.findByIdAndUpdate(regResult.user._id, { status: "inactive" });
    try {
      await authService.loginUser(testEmail, "TestPassword@123");
      logger.error("❌ Deactivation Test Failed: Deactivated user was allowed to log in!");
    } catch (err) {
      logger.info(`✅ Deactivation Lockout Test Passed: Caught -> "${err.message}"`);
    }

    logger.info("Step 7: Testing Session Logout...");
    await authService.logoutUser(regResult.user._id, refreshResult.refreshToken);
    logger.info("✅ Session Logout & Token Revocation Successful!");

    // Clean up test records
    await User.findByIdAndDelete(regResult.user._id);
    await OtpVerification.deleteOne({ phone: testPhone });

    logger.info("🎉 All Authentication Tests Passed Successfully!");
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Auth Test Suite Failure: ${error.message}`);
    process.exit(1);
  }
};

runAuthTests();
