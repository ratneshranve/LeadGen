const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Reusable Ownership Middleware
 * Verifies that non-admin user owns or is assigned to the requested resource.
 * @param {Mongoose.Model} model - Mongoose model to query (e.g. Lead, FollowUp, Task)
 * @param {String} idParamKey - Request URL param key (default 'id')
 * @param {Array<String>} ownerFields - Fields on model to check against req.user._id (e.g. ['assignedTo', 'createdBy'])
 */
const checkOwnership = (model, idParamKey = "id", ownerFields = ["assignedTo", "createdBy"]) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required.");
    }

    // Admin and Manager role bypass ownership restriction
    if (req.user.role === "admin" || req.user.role === "manager") {
      return next();
    }

    const resourceId = req.params[idParamKey];
    if (!resourceId) {
      throw new ApiError(400, "Resource ID missing from request parameters.");
    }

    const doc = await model.findById(resourceId);
    if (!doc) {
      throw new ApiError(404, "Resource not found.");
    }

    const userIdStr = req.user._id.toString();
    const isOwner = ownerFields.some((field) => {
      const val = doc[field];
      if (!val) return false;
      return val.toString() === userIdStr;
    });

    if (!isOwner) {
      throw new ApiError(
        403,
        "Access denied. You do not have permission to modify or access another representative's resource."
      );
    }

    // Attach fetched resource to request for downstream controller efficiency
    req.resource = doc;
    next();
  });
};

module.exports = {
  checkOwnership,
};
