const Activity = require("../../models/Activity.model");
const ApiError = require("../../utils/apiError");
const logger = require("../../utils/logger");

class ActivityService {
  /**
   * Log an activity record for a lead.
   * @param {Object} params
   * @param {string} params.leadId - Lead ObjectId
   * @param {string} params.userId - Actor ObjectId
   * @param {string} [params.userRole] - Actor role
   * @param {string} params.actionType - See Activity.model ACTIVITY_TYPES
   * @param {string} [params.entityType] - Entity being changed (lead, followup, task, etc)
   * @param {string} [params.entityId] - ObjectId of entity being changed
   * @param {string} params.title - Short activity title
   * @param {string} [params.description] - Long description
   * @param {*} [params.oldValue] - Previous value before change
   * @param {*} [params.newValue] - New value after change
   * @param {Object} [params.metadata] - Any extra metadata
   * @param {Object} [session] - Optional mongoose session
   */
  async logActivity(
    {
      leadId,
      userId,
      userRole = null,
      actionType,
      entityType = "lead",
      entityId = null,
      title,
      description = "",
      oldValue = null,
      newValue = null,
      metadata = {},
    },
    session = null
  ) {
    try {
      const activityDoc = {
        leadId,
        userId,
        userRole,
        actionType,
        entityType,
        entityId,
        title,
        description,
        oldValue,
        newValue,
        metadata,
      };

      if (session) {
        const result = await Activity.create([activityDoc], { session });
        return result[0];
      }
      return await Activity.create(activityDoc);
    } catch (err) {
      logger.error(`Activity logging failed: ${err.message}`);
      // Do not throw - activity logging failure must never break primary business logic
    }
  }

  /**
   * Compute field-level diff between two objects (oldData vs newData)
   */
  computeDiff(oldData = {}, newData = {}) {
    const changedFields = [];
    const oldValues = {};
    const newValues = {};

    for (const key of Object.keys(newData)) {
      const oldVal = oldData?.[key];
      const newVal = newData[key];
      const oldStr = JSON.stringify(oldVal);
      const newStr = JSON.stringify(newVal);

      if (oldStr !== newStr) {
        changedFields.push(key);
        oldValues[key] = oldVal ?? null;
        newValues[key] = newVal ?? null;
      }
    }

    return { changedFields, oldValues, newValues };
  }

  /**
   * Get full activity timeline for a specific lead.
   * Salesperson is restricted to their own activities only.
   */
  async getLeadActivities(leadId, user, query = {}) {
    const filter = { leadId };

    // Salesperson can only see activities they performed themselves
    if (user.role === "salesperson") {
      filter.userId = user._id;
    }

    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, parseInt(query.limit) || 20);
    const skip = (page - 1) * limit;

    // Optional action type filter
    if (query.actionType) {
      filter.actionType = query.actionType;
    }

    // Date range filter
    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt.$gte = new Date(query.from);
      if (query.to) filter.createdAt.$lte = new Date(query.to);
    }

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .populate("userId", "name role avatarUrl")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Activity.countDocuments(filter),
    ]);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get activity history for a specific user (their own actions)
   */
  async getUserActivities(userId, query = {}) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, parseInt(query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = { userId };
    if (query.actionType) filter.actionType = query.actionType;

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .populate("leadId", "name company customLeadId")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Activity.countDocuments(filter),
    ]);

    return {
      activities,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get system-wide recent activity (admin only)
   */
  async getRecentActivities(query = {}) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, parseInt(query.limit) || 50);
    const skip = (page - 1) * limit;

    const filter = {};
    if (query.actionType) filter.actionType = query.actionType;
    if (query.userId) filter.userId = query.userId;
    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt.$gte = new Date(query.from);
      if (query.to) filter.createdAt.$lte = new Date(query.to);
    }

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .populate("userId", "name role avatarUrl")
        .populate("leadId", "name company customLeadId")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Activity.countDocuments(filter),
    ]);

    return {
      activities,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

module.exports = new ActivityService();
