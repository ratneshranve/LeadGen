const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const activityService = require("./activity.service");
const auditLogService = require("./auditLog.service");
const ApiError = require("../../utils/apiError");

/**
 * GET /api/v1/activity/leads/:leadId
 * Get activity timeline for a specific lead.
 * Admin sees all activities. Salesperson only sees their own.
 */
const getLeadActivities = asyncHandler(async (req, res) => {
  const { leadId } = req.params;
  const result = await activityService.getLeadActivities(leadId, req.user, req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Lead activity timeline fetched successfully"));
});

/**
 * GET /api/v1/activity/my
 * Get current user's own activity history across all leads
 */
const getMyActivities = asyncHandler(async (req, res) => {
  const result = await activityService.getUserActivities(req.user._id, req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Your activity history fetched successfully"));
});

/**
 * GET /api/v1/activity (admin only)
 * Get system-wide recent activity
 */
const getRecentActivities = asyncHandler(async (req, res) => {
  const result = await activityService.getRecentActivities(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Recent system activities fetched successfully"));
});

/**
 * GET /api/v1/audit-logs (admin only)
 * Get paginated audit log records
 */
const getAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditLogService.getAllAuditLogs(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Audit logs fetched successfully"));
});

/**
 * GET /api/v1/audit-logs/:resource/:resourceId (admin only)
 * Get audit logs for a specific resource
 */
const getResourceAuditLogs = asyncHandler(async (req, res) => {
  const { resource, resourceId } = req.params;
  const result = await auditLogService.getResourceAuditLogs(resource, resourceId, req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, `Audit logs for ${resource} [${resourceId}] fetched successfully`));
});

module.exports = {
  getLeadActivities,
  getMyActivities,
  getRecentActivities,
  getAuditLogs,
  getResourceAuditLogs,
};
