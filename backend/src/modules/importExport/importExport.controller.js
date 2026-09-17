const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const ApiError = require("../../utils/apiError");
const importExportService = require("./importExport.service");

// ── IMPORT ──────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/import-export/import
 * Upload a CSV or Excel file and bulk-create leads.
 * Admin only.
 */
const importLeads = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please upload a CSV or Excel file using the 'file' field.");
  }

  const result = await importExportService.importFromFile(
    req.file.buffer,
    req.file.mimetype,
    req.file.originalname,
    req.user
  );

  const statusCode = result.failed > 0 && result.succeeded === 0 ? 400 : 207;
  const message =
    result.succeeded === 0
      ? `Import failed. All ${result.failed} record(s) had errors.`
      : result.failed > 0
      ? `Import partially successful. ${result.succeeded} record(s) created, ${result.failed} failed.`
      : `Import successful. ${result.succeeded} lead(s) created.`;

  return res.status(statusCode).json(new ApiResponse(statusCode, result, message));
});

// ── EXPORT ──────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/import-export/export/csv
 * Export leads as CSV file download.
 * Supports query filters: from, to, assignedTo, sourceId, stageId, status
 */
const exportToCsv = asyncHandler(async (req, res) => {
  const buffer = await importExportService.exportToCsv(req.user, req.query);

  const filename = `leads_export_${new Date().toISOString().split("T")[0]}.csv`;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Length", buffer.length);
  return res.send(buffer);
});

/**
 * GET /api/v1/import-export/export/xlsx
 * Export leads as Excel (.xlsx) file download.
 * Supports query filters: from, to, assignedTo, sourceId, stageId, status
 */
const exportToXlsx = asyncHandler(async (req, res) => {
  const buffer = await importExportService.exportToXlsx(req.user, req.query);

  const filename = `leads_export_${new Date().toISOString().split("T")[0]}.xlsx`;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Length", buffer.length);
  return res.send(buffer);
});

/**
 * GET /api/v1/import-export/template
 * Download blank CSV import template with correct column headers.
 */
const downloadTemplate = asyncHandler(async (req, res) => {
  const buffer = importExportService.getImportTemplate();

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="lead_import_template.csv"');
  res.setHeader("Content-Length", buffer.length);
  return res.send(buffer);
});

module.exports = {
  importLeads,
  exportToCsv,
  exportToXlsx,
  downloadTemplate,
};
