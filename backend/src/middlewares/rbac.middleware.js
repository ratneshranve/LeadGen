const ApiError = require("../utils/apiError");
const { ROLE_PERMISSIONS } = require("../constants/permissions");

/**
 * Role-Based Access Control Middleware
 * Verifies if user's role is listed in required roles.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required."));
    }

    if (req.user.status !== "active") {
      return next(new ApiError(403, "Account is deactivated. Access denied."));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Forbidden. Role '${req.user.role}' does not have access to this resource. Allowed roles: [${roles.join(", ")}]`
        )
      );
    }

    next();
  };
};

/**
 * Fine-Grained Permission Middleware
 * Checks if user has specific permission string(s).
 */
const checkPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required."));
    }

    if (req.user.status !== "active") {
      return next(new ApiError(403, "Account is deactivated. Access denied."));
    }

    // Admin has super-admin bypass
    if (req.user.role === "admin") {
      return next();
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const hasAllPermissions = requiredPermissions.every((perm) => userPermissions.includes(perm));

    if (!hasAllPermissions) {
      return next(
        new ApiError(
          403,
          `Forbidden. Missing required permission: [${requiredPermissions.join(", ")}]`
        )
      );
    }

    next();
  };
};

module.exports = {
  authorize,
  checkPermission,
};
