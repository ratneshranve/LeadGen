const cloudinary = require("../../config/cloudinary");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

class CloudinaryService {
  /**
   * Validate image file size and MIME type
   */
  validateImage(file) {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB

    if (!file) {
      throw new ApiError(400, "No image file uploaded.");
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ApiError(400, "Invalid image file type. Allowed formats: JPG, JPEG, PNG, WEBP.");
    }

    if (file.size > maxSizeInBytes) {
      throw new ApiError(400, "Image file size exceeds maximum limit of 5 MB.");
    }

    return true;
  }

  /**
   * Validate document file size and MIME type
   */
  validateDocument(file) {
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB

    if (!file) {
      throw new ApiError(400, "No document file uploaded.");
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ApiError(400, "Invalid document format. Allowed formats: PDF, DOC, DOCX, XLSX, CSV.");
    }

    if (file.size > maxSizeInBytes) {
      throw new ApiError(400, "Document file size exceeds maximum limit of 10 MB.");
    }

    return true;
  }

  /**
   * Upload Buffer or Base64 string to Cloudinary
   */
  async uploadFile(fileBuffer, folder = "appzeto/general", resourceType = "image") {
    if (!fileBuffer) {
      throw new ApiError(400, "File buffer is required for upload.");
    }

    try {
      return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: resourceType,
          },
          (error, result) => {
            if (error) {
              logger.error(`Cloudinary Upload Error: ${error.message}`);
              return reject(new ApiError(500, `Cloudinary upload failed: ${error.message}`));
            }
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              bytes: result.bytes,
            });
          }
        );

        uploadStream.end(fileBuffer);
      });
    } catch (error) {
      logger.error(`Upload Execution Failure: ${error.message}`);
      throw new ApiError(500, `Image/Document upload failed: ${error.message}`);
    }
  }

  /**
   * Delete asset from Cloudinary using publicId
   */
  async deleteFile(publicId, resourceType = "image") {
    if (!publicId) return true;

    try {
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      logger.info(`Cloudinary asset deleted: [${publicId}] -> Result: ${result.result}`);
      return result;
    } catch (error) {
      logger.warn(`Failed to delete Cloudinary asset [${publicId}]: ${error.message}`);
      return false;
    }
  }

  /**
   * Replace existing asset: Deletes old asset first, then uploads new file
   */
  async replaceFile(oldPublicId, newFileBuffer, folder = "appzeto/general", resourceType = "image") {
    if (oldPublicId) {
      await this.deleteFile(oldPublicId, resourceType);
    }
    return await this.uploadFile(newFileBuffer, folder, resourceType);
  }
}

module.exports = new CloudinaryService();
