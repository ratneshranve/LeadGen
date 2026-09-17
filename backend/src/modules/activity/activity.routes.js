const express = require("express");
const router = express.Router();
const activityController = require("./activity.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");

router.use(authenticate);

// Lead-specific activity timeline (admin sees all, salesperson sees own only)
router.get("/leads/:leadId", activityController.getLeadActivities);

// Current user's own activity history
router.get("/my", activityController.getMyActivities);

// Admin: System-wide recent activities
router.get("/", authorize("admin", "manager"), activityController.getRecentActivities);

module.exports = router;
