const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const userService = require("./user.service");

const getUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAllUsers(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Users fetched successfully"));
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details fetched successfully"));
});

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, user, "User created successfully"));
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await userService.toggleUserStatus(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, user, `User status changed to ${user.status}`));
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "User soft-deleted successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const user = await userService.updateUserAvatar(req.user._id, req.file);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User avatar updated successfully"));
});

const updateUserAvatarById = asyncHandler(async (req, res) => {
  const user = await userService.updateUserAvatar(req.params.id, req.file);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User avatar updated successfully"));
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  updateAvatar,
  updateUserAvatarById,
};
