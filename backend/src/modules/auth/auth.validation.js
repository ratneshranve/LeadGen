const Joi = require("joi");

const registerSchema = {
  body: Joi.object().keys({
    name: Joi.string().required().trim().min(2).max(100),
    email: Joi.string().required().email().lowercase().trim(),
    phone: Joi.string().required().trim().min(10).max(15),
    password: Joi.string().required().min(6).max(128),
    role: Joi.string().valid("admin", "salesperson", "manager").default("salesperson"),
  }),
};

const loginSchema = {
  body: Joi.object().keys({
    email: Joi.string().required().email().lowercase().trim(),
    password: Joi.string().required(),
    fcmToken: Joi.string().optional().allow("", null),
  }),
};

const refreshTokenSchema = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const sendOtpSchema = {
  body: Joi.object().keys({
    phone: Joi.string().required().trim(),
  }),
};

const verifyOtpSchema = {
  body: Joi.object().keys({
    phone: Joi.string().required().trim(),
    otp: Joi.string().required().length(6),
  }),
};

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  sendOtpSchema,
  verifyOtpSchema,
};
