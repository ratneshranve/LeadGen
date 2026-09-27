const express = require("express");
const router = express.Router();
const leadController = require("./lead.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorize, checkPermission } = require("../../middlewares/rbac.middleware");
const { checkOwnership } = require("../../middlewares/ownership.middleware");
const Lead = require("../../models/Lead.model");
const { PERMISSIONS } = require("../../constants/permissions");
const {
  createLeadSchema,
  updateLeadSchema,
  assignLeadSchema,
  bulkActionSchema,
} = require("./lead.validation");

const upload = require("../../middlewares/upload.middleware");

router.use(authenticate);

router
  .route("/")
  .get(leadController.getLeads)
  .post(checkPermission(PERMISSIONS.LEADS_CREATE), validate(createLeadSchema), leadController.createLead);

router.post("/bulk", authorize("admin", "manager"), validate(bulkActionSchema), leadController.bulkActions);

router
  .route("/:id")
  .get(checkOwnership(Lead), leadController.getLeadById)
  .patch(checkOwnership(Lead), validate(updateLeadSchema), leadController.updateLead)
  .delete(authorize("admin"), leadController.deleteLead);

router.patch(
  "/:id/assign",
  authorize("admin", "manager"),
  validate(assignLeadSchema),
  leadController.assignLead
);

router.get("/:id/activities", checkOwnership(Lead), leadController.getLeadActivities);

router.post("/:id/ai-draft", checkOwnership(Lead), leadController.generateAiDraft);
router.post("/:id/interactions", checkOwnership(Lead), leadController.addInteraction);

router.post(
  "/:id/attachments",
  checkOwnership(Lead),
  upload.single("file"),
  leadController.addAttachment
);

router.delete(
  "/:id/attachments",
  checkOwnership(Lead),
  leadController.deleteAttachment
);

module.exports = router;
