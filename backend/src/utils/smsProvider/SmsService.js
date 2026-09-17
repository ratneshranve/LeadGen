const MockSmsProvider = require("./MockSmsProvider");
const Fast2SmsProvider = require("./Fast2SmsProvider");
const logger = require("../logger");

class SmsService {
  constructor() {
    const providerName = (process.env.SMS_PROVIDER || "mock").toLowerCase();

    switch (providerName) {
      case "fast2sms":
      case "india_fast2sms":
        this.provider = new Fast2SmsProvider();
        break;
      case "mock":
      default:
        this.provider = new MockSmsProvider();
        break;
    }

    logger.info(`Initialized SMS Service with provider: [${this.provider.constructor.name}]`);
  }

  async sendOtp(phone, otp) {
    const message = `Your OTP for Appzeto Lead Management login is ${otp}. Valid for 5 minutes. Do not share it with anyone.`;
    return await this.provider.sendSms({ phone, message, otp });
  }

  async sendCustomSms(phone, message) {
    return await this.provider.sendSms({ phone, message });
  }
}

module.exports = new SmsService();
