/**
 * Sends a test notification (DB record + FCM push) to the user with this mobile number,
 * through the same path real lead/follow-up notifications use.
 *
 *   node src/scripts/sendTestPush.js 9770133148
 */
require("../../config/env");
const mongoose = require("mongoose");
const User = require("../models/User.model");
const notificationService = require("../modules/notifications/notification.service");

const run = async () => {
  const phone = String(process.argv[2] || "").replace(/\D/g, "").slice(-10);
  if (phone.length !== 10) throw new Error("Usage: node src/scripts/sendTestPush.js <10-digit mobile>");

  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ phone: { $regex: `${phone}$` } }).select("name role fcmTokens");
  if (!user) throw new Error(`No user with mobile ${phone}`);

  console.log(`${user.name} (${user.role}) has ${user.fcmTokens.length} registered device(s).`);
  if (user.fcmTokens.length === 0) {
    console.log("Log in to LeadGen in a browser and allow notifications first.");
  }

  await notificationService.sendNotification({
    recipientId: user._id,
    targetRole: user.role,
    type: "SYSTEM",
    title: "LeadGen test notification",
    message: `Hi ${user.name}, push notifications are working.`,
  });

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Test push failed:", err.message);
  process.exit(1);
});
