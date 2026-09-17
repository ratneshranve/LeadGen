const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const productService = require("./product.service");

const getProducts = asyncHandler(async (req, res) => {
  const activeOnly = req.query.active === "true";
  const products = await productService.getProducts(activeOnly);
  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

const toggleProductStatus = asyncHandler(async (req, res) => {
  const product = await productService.toggleProductStatus(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, product, `Product status toggled to ${product.isActive ? 'Active' : 'Inactive'}`));
});

const assignProductsToLead = asyncHandler(async (req, res) => {
  const { leadId, productIds } = req.body;
  const lead = await productService.assignProductsToLead(leadId, productIds || [], req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, lead, "Products assigned to lead successfully"));
});

const getProductAnalytics = asyncHandler(async (req, res) => {
  const analytics = await productService.getProductAnalytics();
  return res
    .status(200)
    .json(new ApiResponse(200, analytics, "Product-wise lead tracking analytics fetched successfully"));
});

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  toggleProductStatus,
  assignProductsToLead,
  getProductAnalytics,
};
