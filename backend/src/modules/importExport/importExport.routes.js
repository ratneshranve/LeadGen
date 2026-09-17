const express = require("express");
const router = express.Router();
const importExportController = require("./importExport.controller");
const { handleImportUpload } = require("./importUpload.middleware");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");

router.use(authenticate);

// ── TEMPLATE ──────────────────────────────────────────────────────────────────
// GET /api/v1/import-export/template
// Download blank CSV import template (any authenticated user)
router.get("/template", importExportController.downloadTemplate);

// ── IMPORT ────────────────────────────────────────────────────────────────────
// POST /api/v1/import-export/import
// Upload CSV/Excel file → bulk create leads (admin only)
// Body: multipart/form-data, field name: "file"
router.post(
  "/import",
  authorize("admin"),
  handleImportUpload,
  importExportController.importLeads
);

// ── EXPORT ────────────────────────────────────────────────────────────────────
// GET /api/v1/import-export/export/csv
// Query params: from, to, assignedTo, sourceId, stageId, status
router.get("/export/csv", importExportController.exportToCsv);

// GET /api/v1/import-export/export/xlsx
// Query params: from, to, assignedTo, sourceId, stageId, status
router.get("/export/xlsx", importExportController.exportToXlsx);

module.exports = router;
