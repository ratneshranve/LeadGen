const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const authService = require("./auth.service");

const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, result, "User registered successfully"));
});

const login = asyncHandler(async (req, res) => {
  const { email, password, fcmToken } = req.body;
  const result = await authService.loginUser(email, password, fcmToken);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "User logged in successfully"));
});

const sendOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const result = await authService.sendOtp(phone);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "OTP dispatched successfully via SMS provider"));
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  const result = await authService.verifyOtp(phone, otp);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "OTP verified successfully"));
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  const result = await authService.refreshTokens(token);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Access token refreshed successfully"));
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  await authService.logoutUser(req.user._id, token);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

const getMe = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user profile fetched successfully"));
});

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
  refreshToken,
  logout,
  getMe,
};
