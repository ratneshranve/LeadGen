const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const uploadService = require("./upload.service");
const ApiError = require("../../utils/apiError");

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please upload an image file");
  }
  const folder = req.body.folder || "appzeto/images";
  const result = await uploadService.uploadImage(req.file, folder);
  return res.status(201).json(new ApiResponse(201, result, "Image uploaded successfully"));
});

const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please upload a document file");
  }
  const folder = req.body.folder || "appzeto/documents";
  const result = await uploadService.uploadDocument(req.file, folder);
  return res.status(201).json(new ApiResponse(201, result, "Document uploaded successfully"));
});

const deleteAsset = asyncHandler(async (req, res) => {
  const { publicId, resourceType } = req.body;
  if (!publicId) {
    throw new ApiError(400, "publicId is required");
  }
  const result = await uploadService.deleteAsset(publicId, resourceType || "image");
  return res.status(200).json(new ApiResponse(200, result, "Asset deleted successfully from Cloudinary"));
});

module.exports = {
  uploadImage,
  uploadDocument,
  deleteAsset,
};
