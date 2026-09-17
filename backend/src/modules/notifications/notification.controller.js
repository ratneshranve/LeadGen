const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const notificationService = require("./notification.service");
const ApiError = require("../../utils/apiError");

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getUserNotifications(req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, notifications, "Notifications fetched successfully"));
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification marked as read"));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "All notifications marked as read"));
});

const registerDeviceToken = asyncHandler(async (req, res) => {
  const { deviceToken } = req.body;
  if (!deviceToken) {
    throw new ApiError(400, "deviceToken is required");
  }
  const result = await notificationService.registerDeviceToken(req.user._id, deviceToken);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Device token registered successfully"));
});

const removeDeviceToken = asyncHandler(async (req, res) => {
  const { deviceToken } = req.body;
  if (!deviceToken) {
    throw new ApiError(400, "deviceToken is required");
  }
  const result = await notificationService.removeDeviceToken(req.user._id, deviceToken);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Device token removed successfully"));
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  registerDeviceToken,
  removeDeviceToken,
};
