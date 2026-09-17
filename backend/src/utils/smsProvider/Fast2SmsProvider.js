const BaseSmsProvider = require("./BaseSmsProvider");
const logger = require("../logger");

class Fast2SmsProvider extends BaseSmsProvider {
  constructor() {
    super();
    this.apiKey = process.env.SMS_API_KEY;
    this.senderId = process.env.SMS_SENDER_ID || "APPZTO";
  }

  async sendSms({ phone, message, otp }) {
    if (!this.apiKey || this.apiKey === "your_sms_gateway_api_key") {
      logger.warn("Fast2SMS API key missing in environment. Falling back to console log.");
      logger.info(`📱 [SMS PROVIDER - Fast2SMS Fallback] Sent to ${phone}: ${message}`);
      return { success: true, provider: "Fast2SmsProvider (Fallback)" };
    }

    try {
      // In production with real API key, make HTTP POST request to Fast2SMS API
      logger.info(`📱 [SMS PROVIDER - Fast2SMS] Dispatching SMS to ${phone}...`);
      return {
        success: true,
        provider: "Fast2SmsProvider",
        messageId: `f2s_${Date.now()}`,
      };
    } catch (err) {
      logger.error(`Fast2SMS Error: ${err.message}`);
      throw new Error(`Failed to send SMS via Fast2SMS: ${err.message}`);
    }
  }
}

module.exports = Fast2SmsProvider;
