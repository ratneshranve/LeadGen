const express = require("express");
const router = express.Router();
const pipelineController = require("./pipeline.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");

router.use(authenticate);

router.get("/stages", pipelineController.getStages);
router.get("/board", pipelineController.getPipelineBoard);

router.post("/stages", authorize("admin"), pipelineController.createStage);
router.patch("/stages/:id", authorize("admin"), pipelineController.updateStage);
router.patch("/stages/:id/toggle-status", authorize("admin"), pipelineController.toggleStageStatus);
router.post("/reorder-stages", authorize("admin"), pipelineController.reorderStages);

router.patch("/move-lead", pipelineController.moveLeadStage);

module.exports = router;
