/**
 * Abstract Base SMS Provider Interface
 * All SMS vendor adapters (Fast2SMS, Twilio, 2Factor, Mock) must extend this class.
 */
class BaseSmsProvider {
  async sendSms({ phone, message, otp }) {
    throw new Error("Method 'sendSms()' must be implemented by subclass.");
  }
}

module.exports = BaseSmsProvider;
