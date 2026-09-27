const mongoose = require("mongoose");
const Lead = require("../../models/Lead.model");
const FollowUp = require("../../models/FollowUp.model");
const Task = require("../../models/Task.model");
const User = require("../../models/User.model");

class ReportService {
  /**
   * Build a reusable $match from filter params.
   * Filters: from, to, assignedTo, sourceId, stageId, productId, status
   */
  _buildMatch(filters = {}) {
    const match = { isDeleted: false };

    if (filters.from || filters.to) {
      match.createdAt = {};
      if (filters.from) match.createdAt.$gte = new Date(filters.from);
      if (filters.to) {
        const to = new Date(filters.to);
        to.setHours(23, 59, 59, 999);
        match.createdAt.$lte = to;
      }
    }
    if (filters.assignedTo) {
      match.assignedTo = new mongoose.Types.ObjectId(filters.assignedTo);
    }
    if (filters.sourceId) {
      match.sourceId = new mongoose.Types.ObjectId(filters.sourceId);
    }
    if (filters.stageId) {
      match.stageId = new mongoose.Types.ObjectId(filters.stageId);
    }
    if (filters.productId) {
      match.products = new mongoose.Types.ObjectId(filters.productId);
    }
    if (filters.status) {
      match.status = filters.status;
    }

    return match;
  }

  // ─── 1. LEAD SUMMARY REPORT ──────────────────────────────────────────────────
  async getLeadSummaryReport(filters = {}) {
    const match = this._buildMatch(filters);

    const [result] = await Lead.aggregate([
      { $match: match },
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
          convertedValue: {
            $sum: {
              $cond: [{ $eq: ["$status", "Converted"] }, "$estimatedValue", 0],
            },
          },
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
          lossRate: {
            $cond: [
              { $gt: ["$total", 0] },
              { $round: [{ $multiply: [{ $divide: ["$lost", "$total"] }, 100] }, 2] },
              0,
            ],
          },
        },
      },
    ]);

    return result || {
      total: 0, newLeads: 0, active: 0, contacted: 0, followUp: 0,
      interested: 0, converted: 0, lost: 0, totalEstimatedValue: 0,
      convertedValue: 0, conversionRate: 0, lossRate: 0,
    };
  }

  // ─── 2. DATE-WISE LEAD TREND ──────────────────────────────────────────────────
  async getDateWiseTrend(filters = {}) {
    const match = this._buildMatch(filters);
    const groupBy = filters.groupBy || "day"; // day | week | month

    const dateGrouping = {
      year: { $year: "$createdAt" },
      month: { $month: "$createdAt" },
    };
    if (groupBy === "day") dateGrouping.day = { $dayOfMonth: "$createdAt" };
    if (groupBy === "week") dateGrouping.week = { $week: "$createdAt" };

    return await Lead.aggregate([
      { $match: match },
      {
        $group: {
          _id: dateGrouping,
          total: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] } },
          lost: { $sum: { $cond: [{ $eq: ["$status", "Lost"] }, 1, 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);
  }

  // ─── 3. SOURCE-WISE PERFORMANCE ────────────────────────────────────────────────
  async getSourceWiseReport(filters = {}) {
    const match = this._buildMatch(filters);

    return await Lead.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$sourceId",
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
          convertedValue: {
            $sum: { $cond: [{ $eq: ["$status", "Converted"] }, "$estimatedValue", 0] },
          },
        },
      },
      {
        $lookup: {
          from: "leadsources",
          localField: "_id",
          foreignField: "_id",
          as: "source",
        },
      },
      { $unwind: { path: "$source", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          sourceName: { $ifNull: ["$source.name", "Unknown"] },
          sourceCode: "$source.code",
          total: 1,
          converted: 1,
          lost: 1,
          active: 1,
          totalValue: 1,
          convertedValue: 1,
          conversionRate: {
            $cond: [
              { $gt: ["$total", 0] },
              { $round: [{ $multiply: [{ $divide: ["$converted", "$total"] }, 100] }, 2] },
              0,
            ],
          },
        },
      },
      { $sort: { total: -1 } },
    ]);
  }

  // ─── 4. SALESPERSON PERFORMANCE ───────────────────────────────────────────────
  async getSalespersonReport(filters = {}) {
    const match = this._buildMatch(filters);

    const leadPerformance = await Lead.aggregate([
      { $match: { ...match, assignedTo: { $ne: null } } },
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
                1, 0,
              ],
            },
          },
          totalValue: { $sum: "$estimatedValue" },
          convertedValue: {
            $sum: { $cond: [{ $eq: ["$status", "Converted"] }, "$estimatedValue", 0] },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "salesperson",
        },
      },
      { $unwind: "$salesperson" },
      {
        $project: {
          name: "$salesperson.name",
          email: "$salesperson.email",
          avatarUrl: "$salesperson.avatarUrl",
          total: 1,
          converted: 1,
          lost: 1,
          active: 1,
          totalValue: 1,
          convertedValue: 1,
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
    ]);

    // Follow-up completion stats per salesperson
    const followupStats = await FollowUp.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: "$assignedTo",
          totalFollowUps: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
        },
      },
    ]);

    const followupMap = {};
    for (const f of followupStats) {
      if (f._id) followupMap[f._id.toString()] = f;
    }

    return leadPerformance.map((sp) => {
      const fu = followupMap[sp._id?.toString()] || {};
      return {
        ...sp,
        totalFollowUps: fu.totalFollowUps || 0,
        completedFollowUps: fu.completed || 0,
        pendingFollowUps: fu.pending || 0,
      };
    });
  }

  // ─── 5. PRODUCT/SERVICE-WISE REPORT ────────────────────────────────────────────
  async getProductReport(filters = {}) {
    const match = this._buildMatch(filters);

    return await Lead.aggregate([
      { $match: match },
      { $unwind: { path: "$products", preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: "$products",
          total: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] } },
          lost: { $sum: { $cond: [{ $eq: ["$status", "Lost"] }, 1, 0] } },
          totalValue: { $sum: "$estimatedValue" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productName: { $ifNull: ["$product.name", "Unknown"] },
          productCategory: "$product.category",
          total: 1,
          converted: 1,
          lost: 1,
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
      { $sort: { total: -1 } },
    ]);
  }

  // ─── 6. FOLLOW-UP REPORT ─────────────────────────────────────────────────────
  async getFollowUpReport(filters = {}) {
    const match = { isDeleted: false };
    if (filters.from || filters.to) {
      match.scheduledAt = {};
      if (filters.from) match.scheduledAt.$gte = new Date(filters.from);
      if (filters.to) {
        const to = new Date(filters.to);
        to.setHours(23, 59, 59, 999);
        match.scheduledAt.$lte = to;
      }
    }
    if (filters.assignedTo) {
      match.assignedTo = new mongoose.Types.ObjectId(filters.assignedTo);
    }

    const [summary] = await FollowUp.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "Pending"] },
                    { $lt: ["$scheduledAt", new Date()] },
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

    const typeBreakdown = await FollowUp.aggregate([
      { $match: match },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $project: { type: "$_id", count: 1, _id: 0 } },
    ]);

    return {
      summary: summary || { total: 0, pending: 0, completed: 0, cancelled: 0, overdue: 0 },
      typeBreakdown,
    };
  }

  // ─── 7. STAGE-WISE (PIPELINE) REPORT ──────────────────────────────────────────
  async getPipelineReport(filters = {}) {
    const match = this._buildMatch(filters);

    return await Lead.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$stageId",
          count: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] } },
          lost: { $sum: { $cond: [{ $eq: ["$status", "Lost"] }, 1, 0] } },
          totalValue: { $sum: "$estimatedValue" },
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
          stageOrder: { $ifNull: ["$stage.order", 0] },
          stageColor: "$stage.color",
          count: 1,
          converted: 1,
          lost: 1,
          totalValue: 1,
          conversionRate: {
            $cond: [
              { $gt: ["$count", 0] },
              { $round: [{ $multiply: [{ $divide: ["$converted", "$count"] }, 100] }, 2] },
              0,
            ],
          },
        },
      },
      { $sort: { stageOrder: 1 } },
    ]);
  }

  // ─── 8. CONVERSION ANALYSIS ────────────────────────────────────────────────────
  async getConversionAnalysis(filters = {}) {
    const match = this._buildMatch(filters);

    const [overall] = await Lead.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] } },
          lost: { $sum: { $cond: [{ $eq: ["$status", "Lost"] }, 1, 0] } },
          totalValue: { $sum: "$estimatedValue" },
          convertedValue: {
            $sum: { $cond: [{ $eq: ["$status", "Converted"] }, "$estimatedValue", 0] },
          },
        },
      },
      {
        $addFields: {
          conversionRate: {
            $cond: [
              { $gt: ["$total", 0] },
              { $round: [{ $multiply: [{ $divide: ["$converted", "$total"] }, 100] }, 2] },
              0,
            ],
          },
          lossRate: {
            $cond: [
              { $gt: ["$total", 0] },
              { $round: [{ $multiply: [{ $divide: ["$lost", "$total"] }, 100] }, 2] },
              0,
            ],
          },
        },
      },
    ]);

    // Monthly conversion trend
    const monthlyConversion = await Lead.aggregate([
      { $match: match },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          total: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] } },
        },
      },
      {
        $addFields: {
          conversionRate: {
            $cond: [
              { $gt: ["$total", 0] },
              { $round: [{ $multiply: [{ $divide: ["$converted", "$total"] }, 100] }, 2] },
              0,
            ],
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return {
      overall: overall || {
        total: 0, converted: 0, lost: 0, totalValue: 0,
        convertedValue: 0, conversionRate: 0, lossRate: 0,
      },
      monthlyConversion,
    };
  }

  // ─── MASTER REPORT (all sections combined) ─────────────────────────────────────
  async getAllReports(filters = {}) {
    const [
      summary,
      dateWiseTrend,
      sourceWise,
      salespersonWise,
      productWise,
      followUpReport,
      pipelineReport,
      conversionAnalysis,
    ] = await Promise.all([
      this.getLeadSummaryReport(filters),
      this.getDateWiseTrend(filters),
      this.getSourceWiseReport(filters),
      this.getSalespersonReport(filters),
      this.getProductReport(filters),
      this.getFollowUpReport(filters),
      this.getPipelineReport(filters),
      this.getConversionAnalysis(filters),
    ]);

    return {
      summary,
      dateWiseTrend,
      sourceWise,
      salespersonWise,
      productWise,
      followUpReport,
      pipelineReport,
      conversionAnalysis,
    };
  }
}

module.exports = new ReportService();
