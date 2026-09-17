const express = require("express");
const router = express.Router();
const followUpController = require("./followup.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorize, checkPermission } = require("../../middlewares/rbac.middleware");
const { checkOwnership } = require("../../middlewares/ownership.middleware");
const FollowUp = require("../../models/FollowUp.model");
const { PERMISSIONS } = require("../../constants/permissions");

router.use(authenticate);

router
  .route("/")
  .get(followUpController.getFollowUps)
  .post(checkPermission(PERMISSIONS.FOLLOWUPS_CREATE), followUpController.createFollowUp);

router.get("/lead/:leadId", followUpController.getLeadFollowUps);

router
  .route("/:id")
  .patch(checkOwnership(FollowUp), followUpController.updateFollowUp)
  .delete(authorize("admin"), followUpController.deleteFollowUp);

router.patch("/:id/complete", checkOwnership(FollowUp), followUpController.markAsCompleted);
router.patch("/:id/cancel", checkOwnership(FollowUp), followUpController.cancelFollowUp);

module.exports = router;
