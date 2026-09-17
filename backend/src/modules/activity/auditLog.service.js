const AuditLog = require("../../models/AuditLog.model");
const logger = require("../../utils/logger");

class AuditLogService {
  /**
   * Write an immutable audit log record.
   * Should NEVER throw — audit logging failure must not interrupt core requests.
   */
  async log({
    userId,
    userName = null,
    userRole,
    action,
    resource,
    resourceId = null,
    oldValues = null,
    newValues = null,
    changedFields = [],
    ipAddress = "",
    userAgent = "",
    status = "SUCCESS",
    errorMessage = null,
  }) {
    try {
      await AuditLog.create({
        userId,
        userName,
        userRole,
        action,
        resource,
        resourceId: resourceId ? resourceId.toString() : null,
        oldValues,
        newValues,
        changedFields,
        ipAddress,
        userAgent,
        status,
        errorMessage,
      });
    } catch (err) {
      logger.error(`AuditLog write failed: ${err.message}`);
    }
  }

  /**
   * Build audit context from Express request object
   */
  buildContext(req) {
    return {
      userId: req.user?._id,
      userName: req.user?.name,
      userRole: req.user?.role,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
      userAgent: req.headers["user-agent"] || "",
    };
  }

  /**
   * Compute field-level diff between two plain objects
   */
  computeDiff(oldData = {}, newData = {}) {
    const changedFields = [];
    const oldValues = {};
    const newValues = {};
    const SKIP_FIELDS = ["__v", "updatedAt", "createdAt"];

    const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);

    for (const key of allKeys) {
      if (SKIP_FIELDS.includes(key)) continue;
      const oldStr = JSON.stringify(oldData?.[key]);
      const newStr = JSON.stringify(newData?.[key]);
      if (oldStr !== newStr) {
        changedFields.push(key);
        oldValues[key] = oldData?.[key] ?? null;
        newValues[key] = newData?.[key] ?? null;
      }
    }

    return { changedFields, oldValues, newValues };
  }

  /**
   * Get audit logs for a specific resource (admin only)
   */
  async getResourceAuditLogs(resource, resourceId, query = {}) {
    const filter = { resource, resourceId: resourceId.toString() };
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(200, parseInt(query.limit) || 30);
    const skip = (page - 1) * limit;

    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt.$gte = new Date(query.from);
      if (query.to) filter.createdAt.$lte = new Date(query.to);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("userId", "name role")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(filter),
    ]);

    return {
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get all audit logs (admin only) with optional filters
   */
  async getAllAuditLogs(query = {}) {
    const filter = {};
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(200, parseInt(query.limit) || 30);
    const skip = (page - 1) * limit;

    if (query.userId) filter.userId = query.userId;
    if (query.action) filter.action = new RegExp(query.action, "i");
    if (query.resource) filter.resource = query.resource;
    if (query.status) filter.status = query.status;
    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt.$gte = new Date(query.from);
      if (query.to) filter.createdAt.$lte = new Date(query.to);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("userId", "name role")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(filter),
    ]);

    return {
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

module.exports = new AuditLogService();
