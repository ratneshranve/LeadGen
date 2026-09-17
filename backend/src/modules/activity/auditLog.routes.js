const express = require("express");
const router = express.Router();
const activityController = require("./activity.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");

router.use(authenticate);
router.use(authorize("admin"));

// Admin: Get all audit logs
router.get("/", activityController.getAuditLogs);

// Admin: Get audit logs for a specific resource
router.get("/:resource/:resourceId", activityController.getResourceAuditLogs);

module.exports = router;
