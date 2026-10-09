const BaseSmsProvider = require("./BaseSmsProvider");
const logger = require("../logger");

/**
 * SMS India Hub (SMSIndiaHub) provider, ported from The Food Galaxy backend
 * (same gateway account). Used for admin & sales login OTPs.
 *
 * India's DLT rules require the SMS text to match the registered template, so the
 * OTP text comes from SMS_INDIA_HUB_MESSAGE_TEMPLATE where {BRAND} is the variable
 * part (the app name, "LeadGen") and {OTP} is the code.
 */
const SMS_ENDPOINT = "https://cloud.smsindiahub.in/api/mt/SendSMS";
const DEFAULT_TEMPLATE = "Welcome to the {BRAND} powered by Appzeto.Your OTP for registration is {OTP}.BGADEC";

/** Indian mobile number -> 91XXXXXXXXXX (always uses the last 10 digits). */
const toIndianMsisdn = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 10) return "";
  return `91${digits.slice(-10)}`;
};

class SmsIndiaHubProvider extends BaseSmsProvider {
  constructor() {
    super();
    this.apiKey = process.env.SMS_INDIA_HUB_API_KEY;
    this.senderId = process.env.SMS_INDIA_HUB_SENDER_ID;
    this.dltTemplateId = process.env.SMS_INDIA_HUB_DLT_TEMPLATE_ID;
    this.entityId = process.env.SMS_INDIA_HUB_ENTITY_ID;
    this.brandName = process.env.SMS_BRAND_NAME || "LeadGen";
    this.template = process.env.SMS_INDIA_HUB_MESSAGE_TEMPLATE || DEFAULT_TEMPLATE;
  }

  buildOtpMessage(otp) {
    return this.template.replace(/\{BRAND\}/g, this.brandName).replace(/\{OTP\}/g, String(otp));
  }

  async sendSms({ phone, message }) {
    const msisdn = toIndianMsisdn(phone);
    if (!msisdn) {
      throw new Error(`Invalid Indian mobile number: ${phone}`);
    }
    if (!this.apiKey || !this.senderId) {
      throw new Error("SMS India Hub credentials are missing (SMS_INDIA_HUB_API_KEY / SMS_INDIA_HUB_SENDER_ID).");
    }

    // Format confirmed by SMS India Hub support for this account.
    const url = new URL(SMS_ENDPOINT);
    url.searchParams.append("APIKey", this.apiKey);
    url.searchParams.append("senderid", this.senderId);
    url.searchParams.append("channel", "Trans");
    url.searchParams.append("DCS", "0");
    url.searchParams.append("flashsms", "0");
    url.searchParams.append("number", msisdn);
    url.searchParams.append("text", message);
    url.searchParams.append("route", "0");
    if (this.dltTemplateId) url.searchParams.append("DLTTemplateId", this.dltTemplateId);
    if (this.entityId) url.searchParams.append("PEId", this.entityId);

    logger.info(`📱 [SMS PROVIDER - SMS India Hub] Sending OTP to ${msisdn}...`);
    const response = await fetch(url.toString());
    const resultText = await response.text();
    // Never log the API key; the response body does not contain it.
    logger.info(`📱 [SMS India Hub] Gateway response for ${msisdn}: ${resultText}`);

    // The gateway answers HTTP 200 even for failures, so inspect the body.
    let parsed = null;
    try { parsed = JSON.parse(resultText); } catch { /* plain text is fine */ }

    if (parsed && parsed.ErrorCode && parsed.ErrorCode !== "000") {
      if (parsed.ErrorCode === "006") {
        logger.error("[SMS India Hub] ErrorCode 006 = DLT template mismatch. The text must match the approved DLT template exactly (check SMS_INDIA_HUB_MESSAGE_TEMPLATE).");
      }
      throw new Error(`SMS India Hub error [${parsed.ErrorCode}] ${parsed.ErrorMessage || resultText}`);
    }
    if (!response.ok) {
      throw new Error(`SMS India Hub HTTP ${response.status}: ${resultText}`);
    }

    return {
      success: true,
      provider: "SmsIndiaHubProvider",
      messageId: parsed?.MessageData?.[0]?.MessageId || `sih_${Date.now()}`,
    };
  }
}

module.exports = SmsIndiaHubProvider;
