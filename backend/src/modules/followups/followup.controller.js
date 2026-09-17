const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const followUpService = require("./followup.service");

const createFollowUp = asyncHandler(async (req, res) => {
  const followUp = await followUpService.createFollowUp(req.body, req.user);
  return res
    .status(201)
    .json(new ApiResponse(201, followUp, "Follow-up scheduled successfully"));
});

const getFollowUps = asyncHandler(async (req, res) => {
  const result = await followUpService.getFollowUps(req.query, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Follow-ups fetched successfully"));
});

const getLeadFollowUps = asyncHandler(async (req, res) => {
  const followUps = await followUpService.getLeadFollowUps(req.params.leadId, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, followUps, "Lead follow-up history fetched successfully"));
});

const updateFollowUp = asyncHandler(async (req, res) => {
  const followUp = await followUpService.updateFollowUp(req.params.id, req.body, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, followUp, "Follow-up updated successfully"));
});

const markAsCompleted = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  const followUp = await followUpService.markAsCompleted(req.params.id, notes, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, followUp, "Follow-up marked as completed"));
});

const cancelFollowUp = asyncHandler(async (req, res) => {
  const followUp = await followUpService.cancelFollowUp(req.params.id, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, followUp, "Follow-up cancelled successfully"));
});

const deleteFollowUp = asyncHandler(async (req, res) => {
  await followUpService.deleteFollowUp(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Follow-up soft-deleted successfully"));
});

module.exports = {
  createFollowUp,
  getFollowUps,
  getLeadFollowUps,
  updateFollowUp,
  markAsCompleted,
  cancelFollowUp,
  deleteFollowUp,
};
