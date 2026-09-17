const cloudinary = require("cloudinary").v2;
const config = require("./env");
const logger = require("../src/utils/logger");

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

if (config.cloudinary.cloudName && config.cloudinary.cloudName !== "your_cloudinary_cloud_name") {
  logger.info(`✅ Cloudinary SDK configured with Cloud Name: [${config.cloudinary.cloudName}]`);
} else {
  logger.warn("⚠️ Cloudinary credentials not configured in environment. File upload service running in fallback mode.");
}

module.exports = cloudinary;
