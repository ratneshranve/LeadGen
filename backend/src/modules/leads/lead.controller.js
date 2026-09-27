const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const leadService = require("./lead.service");
const activityService = require("../activity/activity.service");

const createLead = asyncHandler(async (req, res) => {
  const lead = await leadService.createLead(req.body, req.user);
  return res
    .status(201)
    .json(new ApiResponse(201, lead, "Lead created successfully"));
});

const getLeads = asyncHandler(async (req, res) => {
  const result = await leadService.getAllLeads(req.query, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Leads fetched successfully"));
});

const getLeadById = asyncHandler(async (req, res) => {
  const result = await leadService.getLeadById(req.params.id, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Lead details and timeline fetched successfully"));
});

const updateLead = asyncHandler(async (req, res) => {
  const lead = await leadService.updateLead(req.params.id, req.body, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, lead, "Lead updated successfully"));
});

const assignLead = asyncHandler(async (req, res) => {
  const { assignedTo } = req.body;
  const lead = await leadService.assignLead(req.params.id, assignedTo, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, lead, "Lead assigned successfully"));
});

const bulkActions = asyncHandler(async (req, res) => {
  await leadService.bulkActions(req.body, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, null, `Bulk action '${req.body.action}' executed successfully`));
});

const deleteLead = asyncHandler(async (req, res) => {
  await leadService.deleteLead(req.params.id, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Lead soft-deleted successfully"));
});

const getLeadActivities = asyncHandler(async (req, res) => {
  const activities = await activityService.getLeadActivities(req.params.id, req.user, req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, activities, "Lead activity timeline fetched successfully"));
});

const addAttachment = asyncHandler(async (req, res) => {
  const lead = await leadService.addLeadAttachment(req.params.id, req.file, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, lead, "Attachment added to lead successfully"));
});

const generateAiDraft = asyncHandler(async (req, res) => {
  const result = await leadService.generateAiDraft(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "AI response draft generated"));
});

const addInteraction = asyncHandler(async (req, res) => {
  const result = await leadService.addInteraction(req.params.id, req.body, req.user);
  return res
    .status(201)
    .json(new ApiResponse(201, result, "Interaction recorded successfully"));
});

const deleteAttachment = asyncHandler(async (req, res) => {
  const { publicId } = req.body;
  const lead = await leadService.deleteLeadAttachment(req.params.id, publicId, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, lead, "Attachment deleted from lead successfully"));
});

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  assignLead,
  bulkActions,
  deleteLead,
  getLeadActivities,
  addAttachment,
  deleteAttachment,
  generateAiDraft,
  addInteraction,
};
