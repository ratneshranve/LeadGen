const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const categoryService = require("./category.service");

const getCategories = asyncHandler(async (req, res) => {
  const activeOnly = req.query.active === "true";
  const categories = await categoryService.getCategories(activeOnly);
  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Lead categories fetched successfully"));
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, category, "Lead category created successfully"));
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, category, "Lead category updated successfully"));
});

const toggleCategoryStatus = asyncHandler(async (req, res) => {
  const category = await categoryService.toggleCategoryStatus(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, category, `Lead category status toggled to ${category.isActive ? 'Active' : 'Inactive'}`));
});

const getCategoryAnalytics = asyncHandler(async (req, res) => {
  const analytics = await categoryService.getCategoryAnalytics();
  return res
    .status(200)
    .json(new ApiResponse(200, analytics, "Category-wise lead analytics fetched successfully"));
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  getCategoryAnalytics,
};
