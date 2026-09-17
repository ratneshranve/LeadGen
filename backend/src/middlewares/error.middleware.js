const config = require("../../config/env");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  let error = err;

  // If error is not an instance of ApiError, wrap it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const message = `Duplicate value entered for field: ${field}. Please use another value.`;
    error = new ApiError(400, message);
  }

  // Handle Mongoose CastError (Invalid ID)
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid ID format for field: ${err.path}`;
    error = new ApiError(404, message);
  }

  // Log error
  logger.error(`[${req.method}] ${req.originalUrl} - ${error.statusCode}: ${error.message}`);

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors || [],
    ...(config.env === "development" && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
