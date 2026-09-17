const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const taskService = require("./task.service");

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.body, req.user);
  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});

const getTasks = asyncHandler(async (req, res) => {
  const result = await taskService.getTasks(req.query, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Tasks fetched successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task updated successfully"));
});

const completeTask = asyncHandler(async (req, res) => {
  const task = await taskService.completeTask(req.params.id, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task marked as completed"));
});

const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Task soft-deleted successfully"));
});

module.exports = {
  createTask,
  getTasks,
  updateTask,
  completeTask,
  deleteTask,
};
