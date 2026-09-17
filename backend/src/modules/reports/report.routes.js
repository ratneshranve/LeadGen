const express = require("express");
const router = express.Router();
const reportController = require("./report.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");

router.use(authenticate);
// All report endpoints are admin/manager only — salesperson data is scoped in dashboard
router.use(authorize("admin", "manager"));

// Master combined report
router.get("/", reportController.getAllReports);

// Individual report endpoints (support filtering via query params)
// Filters: from, to, assignedTo, sourceId, stageId, productId, status, groupBy
router.get("/summary", reportController.getLeadSummary);
router.get("/trend", reportController.getDateWiseTrend);
router.get("/sources", reportController.getSourceWiseReport);
router.get("/salespersons", reportController.getSalespersonReport);
router.get("/products", reportController.getProductReport);
router.get("/followups", reportController.getFollowUpReport);
router.get("/pipeline", reportController.getPipelineReport);
router.get("/conversion", reportController.getConversionAnalysis);

module.exports = router;
