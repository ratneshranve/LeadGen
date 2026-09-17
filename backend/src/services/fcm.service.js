const { getMessagingInstance, isConfigured } = require("../../config/firebase");
const User = require("../models/User.model");
const logger = require("../utils/logger");

class FcmService {
  /**
   * Send FCM Push Notification to list of device tokens
   * @param {Object} params
   * @param {string[]} params.tokens - FCM device tokens
   * @param {string} params.title - Notification title
   * @param {string} params.body - Notification body text
   * @param {Object} [params.data] - Custom data payload
   * @param {string} [params.userId] - Optional recipient userId for token cleanup
   */
  async sendMulticast({ tokens = [], title, body, data = {}, userId = null }) {
    if (!tokens || tokens.length === 0) {
      return { successCount: 0, failureCount: 0, message: "No FCM tokens provided" };
    }

    if (!isConfigured()) {
      logger.info(
        `[FCM Fallback] Suppressed push message: "${title}" -> ${tokens.length} token(s) (Firebase unconfigured)`
      );
      return {
        successCount: 0,
        failureCount: 0,
        fallback: true,
        message: "Firebase not configured, notification persisted without push",
      };
    }

    const messaging = getMessagingInstance();
    const stringData = {};
    for (const [key, value] of Object.entries(data)) {
      stringData[key] = typeof value === "string" ? value : JSON.stringify(value);
    }

    const payload = {
      tokens,
      notification: {
        title,
        body,
      },
      data: stringData,
    };

    try {
      const response = await messaging.sendEachForMulticast(payload);
      logger.info(
        `[FCM Multicast] Sent push "${title}": ${response.successCount} succeeded, ${response.failureCount} failed.`
      );

      // Dead / Invalid token cleanup
      const invalidTokens = [];
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errorCode = resp.error?.code;
            if (
              errorCode === "messaging/invalid-registration-token" ||
              errorCode === "messaging/registration-token-not-registered"
            ) {
              invalidTokens.push(tokens[idx]);
            }
          }
        });
      }

      if (invalidTokens.length > 0) {
        await this.pruneInvalidTokens(invalidTokens, userId);
      }

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokensPruned: invalidTokens.length,
      };
    } catch (error) {
      logger.error(`[FCM Multicast Exception]: ${error.message}`);
      return {
        successCount: 0,
        failureCount: tokens.length,
        error: error.message,
      };
    }
  }

  /**
   * Prune/Remove dead or unregistered tokens from MongoDB User records
   */
  async pruneInvalidTokens(invalidTokens = [], userId = null) {
    if (!invalidTokens || invalidTokens.length === 0) return;

    try {
      if (userId) {
        await User.updateOne(
          { _id: userId },
          { $pull: { fcmTokens: { $in: invalidTokens } } }
        );
        logger.info(`Pruned ${invalidTokens.length} dead FCM token(s) from user [${userId}]`);
      } else {
        await User.updateMany(
          {},
          { $pull: { fcmTokens: { $in: invalidTokens } } }
        );
        logger.info(`Pruned ${invalidTokens.length} dead FCM token(s) across all users`);
      }
    } catch (err) {
      logger.error(`Failed to prune dead FCM tokens: ${err.message}`);
    }
  }
}

module.exports = new FcmService();
