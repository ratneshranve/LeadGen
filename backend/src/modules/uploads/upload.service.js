const cloudinaryService = require("../../services/cloudinary.service");
const ApiError = require("../../utils/apiError");

class UploadService {
  /**
   * Upload single image file to Cloudinary
   */
  async uploadImage(file, folder = "appzeto/images") {
    cloudinaryService.validateImage(file);
    const result = await cloudinaryService.uploadFile(file.buffer, folder, "image");
    return {
      url: result.url,
      publicId: result.publicId,
      fileName: file.originalname,
      fileType: "image",
      bytes: result.bytes,
      format: result.format,
    };
  }

  /**
   * Upload single document file to Cloudinary
   */
  async uploadDocument(file, folder = "appzeto/documents") {
    cloudinaryService.validateDocument(file);
    const result = await cloudinaryService.uploadFile(file.buffer, folder, "raw");
    return {
      url: result.url,
      publicId: result.publicId,
      fileName: file.originalname,
      fileType: "document",
      bytes: result.bytes,
      format: result.format,
    };
  }

  /**
   * Replace an existing asset with a new file
   */
  async replaceAsset(oldPublicId, file, folder = "appzeto/general", isImage = true) {
    if (isImage) {
      cloudinaryService.validateImage(file);
    } else {
      cloudinaryService.validateDocument(file);
    }

    const resourceType = isImage ? "image" : "raw";
    const result = await cloudinaryService.replaceFile(oldPublicId, file.buffer, folder, resourceType);

    return {
      url: result.url,
      publicId: result.publicId,
      fileName: file.originalname,
      fileType: isImage ? "image" : "document",
      bytes: result.bytes,
    };
  }

  /**
   * Delete asset from Cloudinary by publicId
   */
  async deleteAsset(publicId, resourceType = "image") {
    if (!publicId) {
      throw new ApiError(400, "Cloudinary publicId is required for deletion.");
    }
    const success = await cloudinaryService.deleteFile(publicId, resourceType);
    return { success, publicId };
  }
}

module.exports = new UploadService();
