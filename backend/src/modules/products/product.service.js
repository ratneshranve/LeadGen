const Product = require("../../models/Product.model");
const Lead = require("../../models/Lead.model");
const ApiError = require("../../utils/apiError");
const activityService = require("../activity/activity.service");

class ProductService {
  async getProducts(activeOnly = false) {
    const query = activeOnly ? { isActive: true } : {};
    return await Product.find(query).sort("name");
  }

  async createProduct(productData) {
    return await Product.create(productData);
  }

  async updateProduct(id, updateData) {
    const product = await Product.findById(id);
    if (!product) {
      throw new ApiError(404, "Product/Service not found.");
    }
    return await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async toggleProductStatus(id) {
    const product = await Product.findById(id);
    if (!product) {
      throw new ApiError(404, "Product/Service not found.");
    }
    product.isActive = !product.isActive;
    await product.save();
    return product;
  }

  async assignProductsToLead(leadId, productIds, user) {
    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw new ApiError(404, "Lead not found.");
    }

    const validProducts = await Product.find({ _id: { $in: productIds }, isActive: true });
    lead.products = validProducts.map((p) => p._id);
    
    // Auto-recalculate estimated lead value based on assigned products
    lead.estimatedValue = validProducts.reduce((sum, p) => sum + p.price, 0);
    await lead.save();

    const productNames = validProducts.map((p) => p.name).join(", ");

    // Log Activity
    await activityService.logActivity({
      leadId: lead._id,
      userId: user._id,
      actionType: "NOTE_ADDED",
      title: "Products/Services Assigned",
      description: `Assigned products/services: [${productNames || 'None'}]. Updated estimated deal value: ₹${lead.estimatedValue}.`,
    });

    return await Lead.findById(lead._id).populate("products", "name category price");
  }

  async getProductAnalytics() {
    return await Lead.aggregate([
      { $match: { isDeleted: false } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products",
          totalInterestedLeads: { $sum: 1 },
          convertedLeads: {
            $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] },
          },
          totalPipelineValue: { $sum: "$estimatedValue" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          productId: "$_id",
          productName: "$productInfo.name",
          productCategory: "$productInfo.category",
          price: "$productInfo.price",
          totalInterestedLeads: 1,
          convertedLeads: 1,
          totalPipelineValue: 1,
        },
      },
    ]);
  }
}

module.exports = new ProductService();
