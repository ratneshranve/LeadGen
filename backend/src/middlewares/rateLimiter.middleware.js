const rateLimit = require("express-rate-limit");

const isDev = process.env.NODE_ENV !== "production";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 3000 : 300, // Limit each IP to N requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 200 : 20, // Limit login/auth attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

const ingestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 500 : 60, // Public lead-ingestion form/webhook - stricter than the general API
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many submissions from this IP, please try again later.",
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  ingestLimiter,
};
