const mongoose = require("mongoose");
const Lead = require("../../models/Lead.model");
const FollowUp = require("../../models/FollowUp.model");
const Task = require("../../models/Task.model");
const Activity = require("../../models/Activity.model");

class DashboardService {
  /**
   * Build the base $match filter based on role + optional date range
   */
  _buildLeadMatch(user, query = {}) {
    const match = { isDeleted: false };

    if (user.role === "salesperson") {
      match.$or = [{ assignedTo: user._id }, { createdBy: user._id }];
    }

    // Optional filters from query
    if (query.assignedTo && user.role !== "salesperson") {
      match.assignedTo = new mongoose.Types.ObjectId(query.assignedTo);
    }
    if (query.sourceId) {
      match.sourceId = new mongoose.Types.ObjectId(query.sourceId);
    }
    if (query.stageId) {
      match.stageId = new mongoose.Types.ObjectId(query.stageId);
    }
    if (query.from || query.to) {
      match.createdAt = {};
      if (query.from) match.createdAt.$gte = new Date(query.from);
      if (query.to) match.createdAt.$lte = new Date(query.to);
    }

    return match;
  }

  /**
   * Main dashboard: KPI cards + status distribution + stage distribution
   * + monthly trend + recent activities + pending follow-ups/tasks
   */
  async getDashboardStats(user, query = {}) {
    const leadMatch = this._buildLeadMatch(user, query);

    // ── 1. KPI Counts via single aggregation ──────────────────────────────────
    const [kpiResult] = await Lead.aggregate([
      { $match: leadMatch },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          newLeads: { $sum: { $cond: [{ $eq: ["$status", "New"] }, 1, 0] } },
          contacted: { $sum: { $cond: [{ $eq: ["$status", "Contacted"] }, 1, 0] } },
          followUp: { $sum: { $cond: [{ $eq: ["$status", "Follow-up"] }, 1, 0] } },
          interested: { $sum: { $cond: [{ $eq: ["$status", "Interested"] }, 1, 0] } },
          converted: { $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] } },
          lost: { $sum: { $cond: [{ $eq: ["$status", "Lost"] }, 1, 0] } },
          totalEstimatedValue: { $sum: "$estimatedValue" },
        },
      },
      {
        $addFields: {
          active: { $add: ["$newLeads", "$contacted", "$followUp", "$interested"] },
          conversionRate: {
            $cond: [
              { $gt: ["$total", 0] },
              { $round: [{ $multiply: [{ $divide: ["$converted", "$total"] }, 100] }, 2] },
              0,
            ],
          },
        },
      },
    ]);

    const kpi = kpiResult || {
      total: 0, newLeads: 0, active: 0, contacted: 0,
      followUp: 0, interested: 0, converted: 0, lost: 0,
      totalEstimatedValue: 0, conversionRate: 0,
    };

    // ── 2. Status Distribution ────────────────────────────────────────────────
    const statusDistribution = await Lead.aggregate([
      { $match: leadMatch },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    // ── 3. Pipeline Stage Distribution ────────────────────────────────────────
    const stageDistribution = await Lead.aggregate([
      { $match: leadMatch },
      {
        $group: {
          _id: "$stageId",
          count: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: "pipelinestages",
          localField: "_id",
          foreignField: "_id",
          as: "stage",
        },
      },
      { $unwind: { path: "$stage", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          stageName: { $ifNull: ["$stage.name", "Unassigned"] },
          stageColor: "$stage.color",
          stageOrder: "$stage.order",
          count: 1,
          converted: 1,
        },
      },
      { $sort: { stageOrder: 1 } },
    ]);

    // ── 4. Monthly Lead Trend (last 6 months) ─────────────────────────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrend = await Lead.aggregate([
      { $match: { ...leadMatch, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          total: 1,
          converted: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    // ── 5. Pending Follow-ups count ───────────────────────────────────────────
    const followupMatch = { status: "Pending", isDeleted: false };
    if (user.role === "salesperson") followupMatch.assignedTo = user._id;

    const [followupStats] = await FollowUp.aggregate([
      { $match: followupMatch },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          overdue: {
            $sum: { $cond: [{ $lt: ["$scheduledAt", new Date()] }, 1, 0] },
          },
          dueToday: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$scheduledAt", new Date(new Date().setHours(0, 0, 0, 0))] },
                    { $lt: ["$scheduledAt", new Date(new Date().setHours(23, 59, 59, 999))] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // ── 6. Pending Tasks count ────────────────────────────────────────────────
    const taskMatch = { status: { $in: ["Pending", "In Progress"] } };
    if (user.role === "salesperson") taskMatch.assignedTo = user._id;

    const pendingTasksCount = await Task.countDocuments(taskMatch);

    // ── 7. Top Salesperson Performance (admin only) ──────────────────────────
    let teamPerformance = [];
    if (user.role !== "salesperson") {
      teamPerformance = await Lead.aggregate([
        { $match: { isDeleted: false, assignedTo: { $ne: null } } },
        {
          $group: {
            _id: "$assignedTo",
            total: { $sum: 1 },
            converted: { $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] } },
            lost: { $sum: { $cond: [{ $eq: ["$status", "Lost"] }, 1, 0] } },
            active: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["New", "Contacted", "Follow-up", "Interested"]] },
                  1,
                  0,
                ],
              },
            },
            totalValue: { $sum: "$estimatedValue" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            name: "$user.name",
            email: "$user.email",
            avatarUrl: "$user.avatarUrl",
            total: 1,
            converted: 1,
            lost: 1,
            active: 1,
            totalValue: 1,
            conversionRate: {
              $cond: [
                { $gt: ["$total", 0] },
                { $round: [{ $multiply: [{ $divide: ["$converted", "$total"] }, 100] }, 2] },
                0,
              ],
            },
          },
        },
        { $sort: { converted: -1 } },
        { $limit: 10 },
      ]);
    }

    // ── 8. Recent Activities ──────────────────────────────────────────────────
    const activityMatch = user.role === "salesperson" ? { userId: user._id } : {};
    const recentActivities = await Activity.find(activityMatch)
      .populate("userId", "name avatarUrl role")
      .populate("leadId", "name company customLeadId")
      .sort("-createdAt")
      .limit(10);

    return {
      kpi: {
        totalLeads: kpi.total,
        newLeads: kpi.newLeads,
        activeLeads: kpi.active,
        convertedLeads: kpi.converted,
        lostLeads: kpi.lost,
        pendingFollowUps: followupStats?.total || 0,
        overdueFollowUps: followupStats?.overdue || 0,
        dueTodayFollowUps: followupStats?.dueToday || 0,
        pendingTasks: pendingTasksCount,
        totalEstimatedValue: kpi.totalEstimatedValue,
        conversionRate: kpi.conversionRate,
      },
      statusDistribution,
      stageDistribution,
      monthlyTrend,
      teamPerformance,
      recentActivities,
    };
  }
}

module.exports = new DashboardService();
