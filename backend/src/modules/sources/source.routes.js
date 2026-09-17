const express = require("express");
const router = express.Router();
const sourceController = require("./source.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");

router.use(authenticate);

router.get("/analytics", authorize("admin", "manager"), sourceController.getSourceAnalytics);

router
  .route("/")
  .get(sourceController.getSources)
  .post(authorize("admin"), sourceController.createSource);

router
  .route("/:id")
  .patch(authorize("admin"), sourceController.updateSource);

router.patch("/:id/toggle-status", authorize("admin"), sourceController.toggleSourceStatus);

module.exports = router;
