const BaseSmsProvider = require("./BaseSmsProvider");
const logger = require("../logger");

class MockSmsProvider extends BaseSmsProvider {
  async sendSms({ phone, message, otp }) {
    logger.info(`📱 [SMS PROVIDER - MOCK MODE] Sent to ${phone}: "${message}" | OTP: [${otp || "N/A"}]`);
    return {
      success: true,
      provider: "MockSmsProvider",
      messageId: `mock_${Date.now()}`,
    };
  }
}

module.exports = MockSmsProvider;
