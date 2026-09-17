const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const dashboardService = require("./dashboard.service");

const getStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats(req.user, req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Dashboard metrics fetched successfully"));
});

module.exports = { getStats };
