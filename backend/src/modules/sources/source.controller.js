const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const sourceService = require("./source.service");

const getSources = asyncHandler(async (req, res) => {
  const activeOnly = req.query.active === "true";
  const sources = await sourceService.getAllSources(activeOnly);
  return res
    .status(200)
    .json(new ApiResponse(200, sources, "Lead sources fetched successfully"));
});

const createSource = asyncHandler(async (req, res) => {
  const source = await sourceService.createSource(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, source, "Lead source created successfully"));
});

const updateSource = asyncHandler(async (req, res) => {
  const source = await sourceService.updateSource(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, source, "Lead source updated successfully"));
});

const toggleSourceStatus = asyncHandler(async (req, res) => {
  const source = await sourceService.toggleSourceStatus(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, source, `Lead source status toggled to ${source.isActive ? 'Active' : 'Inactive'}`));
});

const getSourceAnalytics = asyncHandler(async (req, res) => {
  const analytics = await sourceService.getSourceAnalytics();
  return res
    .status(200)
    .json(new ApiResponse(200, analytics, "Source-wise conversion analytics fetched successfully"));
});

module.exports = {
  getSources,
  createSource,
  updateSource,
  toggleSourceStatus,
  getSourceAnalytics,
};
