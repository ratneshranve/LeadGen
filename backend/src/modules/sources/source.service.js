const LeadSource = require("../../models/LeadSource.model");
const Lead = require("../../models/Lead.model");
const ApiError = require("../../utils/apiError");

class SourceService {
  async getAllSources(activeOnly = false) {
    const query = activeOnly ? { isActive: true } : {};
    return await LeadSource.find(query).sort("name");
  }

  async createSource(sourceData) {
    const existing = await LeadSource.findOne({ name: sourceData.name });
    if (existing) {
      throw new ApiError(400, `Lead source '${sourceData.name}' already exists.`);
    }

    return await LeadSource.create(sourceData);
  }

  async updateSource(id, updateData) {
    const source = await LeadSource.findById(id);
    if (!source) {
      throw new ApiError(404, "Lead source not found.");
    }

    return await LeadSource.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async toggleSourceStatus(id) {
    const source = await LeadSource.findById(id);
    if (!source) {
      throw new ApiError(404, "Lead source not found.");
    }

    source.isActive = !source.isActive;
    await source.save();
    return source;
  }

  async getSourceAnalytics() {
    const analytics = await Lead.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: "$sourceId",
          totalLeads: { $sum: 1 },
          convertedLeads: {
            $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] },
          },
          lostLeads: {
            $sum: { $cond: [{ $eq: ["$status", "Lost"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "leadsources",
          localField: "_id",
          foreignField: "_id",
          as: "sourceInfo",
        },
      },
      { $unwind: "$sourceInfo" },
      {
        $project: {
          sourceId: "$_id",
          sourceName: "$sourceInfo.name",
          sourceCode: "$sourceInfo.code",
          isActive: "$sourceInfo.isActive",
          totalLeads: 1,
          convertedLeads: 1,
          lostLeads: 1,
          conversionRate: {
            $cond: [
              { $gt: ["$totalLeads", 0] },
              { $multiply: [{ $divide: ["$convertedLeads", "$totalLeads"] }, 100] },
              0,
            ],
          },
        },
      },
    ]);

    return analytics;
  }
}

module.exports = new SourceService();
