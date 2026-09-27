const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const config = require("../config/env");
const errorHandler = require("./middlewares/error.middleware");
const { apiLimiter } = require("./middlewares/rateLimiter.middleware");
const ApiError = require("./utils/apiError");
const ApiResponse = require("./utils/apiResponse");

// Import Route Modules
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const leadRoutes = require("./modules/leads/lead.routes");
const followUpRoutes = require("./modules/followups/followup.routes");
const taskRoutes = require("./modules/tasks/task.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const pipelineRoutes = require("./modules/pipeline/pipeline.routes");
const sourceRoutes = require("./modules/sources/source.routes");
const categoryRoutes = require("./modules/categories/category.routes");
const productRoutes = require("./modules/products/product.routes");
const notificationRoutes = require("./modules/notifications/notification.routes");
const calendarRoutes = require("./modules/calendar/calendar.routes");
const reportRoutes = require("./modules/reports/report.routes");
const importExportRoutes = require("./modules/importExport/importExport.routes");
const uploadRoutes = require("./modules/uploads/upload.routes");
const activityRoutes = require("./modules/activity/activity.routes");
const auditLogRoutes = require("./modules/activity/auditLog.routes");
const ingestionRoutes = require("./modules/ingestion/ingestion.routes");

const mongoSanitize = require("express-mongo-sanitize");

const app = express();

// Security HTTP Headers
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: config.corsOrigin === "*" ? true : config.corsOrigin?.split(",") || "*",
    credentials: true,
  })
);

// Body Parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Sanitize user input against NoSQL Query Injection attacks
app.use(mongoSanitize());

// HTTP Request Logger
if (config.env === "development") {
  app.use(morgan("dev"));
}

// Global Rate Limiting
const apiPrefix = config.apiPrefix || "/api/v1";
app.use(apiPrefix, apiLimiter);

// Health Check Endpoints
const healthHandler = (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        status: "UP",
        environment: config.env,
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())}s`,
      },
      "Backend service is healthy and operational"
    )
  );
};

app.get("/health", healthHandler);
app.get(`${apiPrefix}/health`, healthHandler);

// API Central Route Registration
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/leads`, leadRoutes);
app.use(`${apiPrefix}/followups`, followUpRoutes);
app.use(`${apiPrefix}/tasks`, taskRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/pipeline`, pipelineRoutes);
app.use(`${apiPrefix}/sources`, sourceRoutes);
app.use(`${apiPrefix}/categories`, categoryRoutes);
app.use(`${apiPrefix}/products`, productRoutes);
app.use(`${apiPrefix}/notifications`, notificationRoutes);
app.use(`${apiPrefix}/calendar`, calendarRoutes);
app.use(`${apiPrefix}/reports`, reportRoutes);
app.use(`${apiPrefix}/import-export`, importExportRoutes);
app.use(`${apiPrefix}/uploads`, uploadRoutes);
app.use(`${apiPrefix}/activity`, activityRoutes);
app.use(`${apiPrefix}/audit-logs`, auditLogRoutes);
app.use(`${apiPrefix}/ingest`, ingestionRoutes);

// Handle 404 Route Not Found
app.use("*", (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found on this server.`));
});

// Centralized Error Handler Middleware
app.use(errorHandler);

module.exports = app;
