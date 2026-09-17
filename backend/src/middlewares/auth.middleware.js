const jwt = require("jsonwebtoken");
const config = require("../../config/env");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User.model");

const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized to access this route. Token missing.");
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    const user = await User.findById(decoded._id);

    if (!user || user.status !== "active" || user.isDeleted) {
      throw new ApiError(401, "User account is inactive or no longer exists.");
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token has expired. Please refresh token.");
    }
    throw new ApiError(401, "Invalid access token.");
  }
});

module.exports = {
  authenticate,
};
