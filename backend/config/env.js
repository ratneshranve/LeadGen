const Joi = require("joi");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
  PORT: Joi.number().default(5000),
  API_PREFIX: Joi.string().default("/api/v1"),
  MONGODB_URI: Joi.string().required().description("MongoDB Atlas Connection String"),
  JWT_ACCESS_SECRET: Joi.string().required().description("JWT Access Token Secret"),
  JWT_ACCESS_EXPIRY: Joi.string().default("15m"),
  JWT_REFRESH_SECRET: Joi.string().required().description("JWT Refresh Token Secret"),
  JWT_REFRESH_EXPIRY: Joi.string().default("7d"),
  CORS_ORIGIN: Joi.string().default("*"),
  CLOUDINARY_CLOUD_NAME: Joi.string().allow("", null),
  CLOUDINARY_API_KEY: Joi.string().allow("", null),
  CLOUDINARY_API_SECRET: Joi.string().allow("", null),
  FIREBASE_PROJECT_ID: Joi.string().allow("", null),
  FIREBASE_CLIENT_EMAIL: Joi.string().allow("", null),
  FIREBASE_PRIVATE_KEY: Joi.string().allow("", null),
  SMS_API_KEY: Joi.string().allow("", null),
  SMS_SENDER_ID: Joi.string().allow("", null),
})
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  apiPrefix: envVars.API_PREFIX,
  mongoose: {
    url: envVars.MONGODB_URI,
  },
  jwt: {
    accessSecret: envVars.JWT_ACCESS_SECRET,
    accessExpiration: envVars.JWT_ACCESS_EXPIRY,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    refreshExpiration: envVars.JWT_REFRESH_EXPIRY,
  },
  corsOrigin: envVars.CORS_ORIGIN,
  cloudinary: {
    cloudName: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
  },
  firebase: {
    projectId: envVars.FIREBASE_PROJECT_ID,
    clientEmail: envVars.FIREBASE_CLIENT_EMAIL,
    privateKey: envVars.FIREBASE_PRIVATE_KEY,
  },
  sms: {
    apiKey: envVars.SMS_API_KEY,
    senderId: envVars.SMS_SENDER_ID,
  },
};
