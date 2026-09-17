const LeadCategory = require("../../models/LeadCategory.model");
const Lead = require("../../models/Lead.model");
const ApiError = require("../../utils/apiError");

class CategoryService {
  async getCategories(activeOnly = false) {
    const query = activeOnly ? { isActive: true } : {};
    return await LeadCategory.find(query).sort("name");
  }

  async createCategory(categoryData) {
    const existing = await LeadCategory.findOne({ name: categoryData.name });
    if (existing) {
      throw new ApiError(400, `Lead category '${categoryData.name}' already exists.`);
    }
    return await LeadCategory.create(categoryData);
  }

  async updateCategory(id, updateData) {
    const category = await LeadCategory.findById(id);
    if (!category) {
      throw new ApiError(404, "Lead category not found.");
    }
    return await LeadCategory.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async toggleCategoryStatus(id) {
    const category = await LeadCategory.findById(id);
    if (!category) {
      throw new ApiError(404, "Lead category not found.");
    }
    category.isActive = !category.isActive;
    await category.save();
    return category;
  }

  async getCategoryAnalytics() {
    return await Lead.aggregate([
      { $match: { isDeleted: false, categoryId: { $ne: null } } },
      {
        $group: {
          _id: "$categoryId",
          totalLeads: { $sum: 1 },
          convertedLeads: {
            $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "leadcategories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      {
        $project: {
          categoryId: "$_id",
          categoryName: "$categoryInfo.name",
          categoryCode: "$categoryInfo.code",
          totalLeads: 1,
          convertedLeads: 1,
        },
      },
    ]);
  }
}

module.exports = new CategoryService();
