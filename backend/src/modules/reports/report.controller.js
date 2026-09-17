const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const reportService = require("./report.service");

// Master report — all sections combined
const getAllReports = asyncHandler(async (req, res) => {
  const result = await reportService.getAllReports(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Full analytics report generated successfully"));
});

// Lead summary KPI cards
const getLeadSummary = asyncHandler(async (req, res) => {
  const result = await reportService.getLeadSummaryReport(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Lead summary report fetched successfully"));
});

// Date-wise trend (daily / weekly / monthly)
const getDateWiseTrend = asyncHandler(async (req, res) => {
  const result = await reportService.getDateWiseTrend(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Date-wise lead trend fetched successfully"));
});

// Source-wise lead performance
const getSourceWiseReport = asyncHandler(async (req, res) => {
  const result = await reportService.getSourceWiseReport(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Source-wise performance report fetched successfully"));
});

// Salesperson performance
const getSalespersonReport = asyncHandler(async (req, res) => {
  const result = await reportService.getSalespersonReport(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Salesperson performance report fetched successfully"));
});

// Product/service-wise leads
const getProductReport = asyncHandler(async (req, res) => {
  const result = await reportService.getProductReport(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Product/service-wise lead report fetched successfully"));
});

// Follow-up report
const getFollowUpReport = asyncHandler(async (req, res) => {
  const result = await reportService.getFollowUpReport(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Follow-up report fetched successfully"));
});

// Pipeline stage report
const getPipelineReport = asyncHandler(async (req, res) => {
  const result = await reportService.getPipelineReport(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Pipeline stage report fetched successfully"));
});

// Conversion analysis
const getConversionAnalysis = asyncHandler(async (req, res) => {
  const result = await reportService.getConversionAnalysis(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Conversion analysis report fetched successfully"));
});

module.exports = {
  getAllReports,
  getLeadSummary,
  getDateWiseTrend,
  getSourceWiseReport,
  getSalespersonReport,
  getProductReport,
  getFollowUpReport,
  getPipelineReport,
  getConversionAnalysis,
};
