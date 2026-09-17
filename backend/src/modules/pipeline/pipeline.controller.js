const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const pipelineService = require("./pipeline.service");

const getStages = asyncHandler(async (req, res) => {
  const stages = await pipelineService.getStages();
  return res
    .status(200)
    .json(new ApiResponse(200, stages, "Pipeline stages fetched successfully"));
});

const getPipelineBoard = asyncHandler(async (req, res) => {
  const board = await pipelineService.getPipelineLeads(req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, board, "Pipeline Kanban board fetched successfully"));
});

const createStage = asyncHandler(async (req, res) => {
  const stage = await pipelineService.createStage(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, stage, "Pipeline stage created successfully"));
});

const updateStage = asyncHandler(async (req, res) => {
  const stage = await pipelineService.updateStage(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, stage, "Pipeline stage updated successfully"));
});

const toggleStageStatus = asyncHandler(async (req, res) => {
  const stage = await pipelineService.toggleStageStatus(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, stage, `Pipeline stage status toggled to ${stage.isActive ? 'Active' : 'Inactive'}`));
});

const reorderStages = asyncHandler(async (req, res) => {
  const stages = await pipelineService.reorderStages(req.body.stages || []);
  return res
    .status(200)
    .json(new ApiResponse(200, stages, "Pipeline stages reordered successfully"));
});

const moveLeadStage = asyncHandler(async (req, res) => {
  const { leadId, stageId } = req.body;
  const lead = await pipelineService.moveLeadStage(leadId, stageId, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, lead, "Lead moved to new pipeline stage successfully"));
});

module.exports = {
  getStages,
  getPipelineBoard,
  createStage,
  updateStage,
  toggleStageStatus,
  reorderStages,
  moveLeadStage,
};
