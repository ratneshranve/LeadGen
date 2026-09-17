const mongoose = require("mongoose");
const config = require("./env");
const logger = require("../src/utils/logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoose.url, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(`✅ MongoDB Atlas Connected: ${conn.connection.host} [Database: ${conn.connection.name}]`);
    return conn;
  } catch (error) {
    logger.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);
    if (config.env === "production") {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
