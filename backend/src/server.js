const app = require("./app");
const connectDB = require("../config/db");
const config = require("../config/env");
const logger = require("./utils/logger");

const PORT = config.port || 5000;

// Initialize Server & Database Connection
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Appzeto Lead Management Backend running in [${config.env}] mode on port ${PORT}`);
    logger.info(`🔗 Base API Endpoint: http://localhost:${PORT}${config.apiPrefix}`);
    logger.info(`🩺 Health Check: http://localhost:${PORT}${config.apiPrefix}/health`);
  });

  // Handle Unhandled Promise Rejections
  process.on("unhandledRejection", (err) => {
    logger.error(`Unhandled Rejection Error: ${err.message}`);
    server.close(() => process.exit(1));
  });

  // Handle Uncaught Exceptions
  process.on("uncaughtException", (err) => {
    logger.error(`Uncaught Exception Error: ${err.message}`);
    process.exit(1);
  });
};

startServer();
