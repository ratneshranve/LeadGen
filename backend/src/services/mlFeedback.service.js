const fs = require("fs");
const path = require("path");
const { extractFeatures } = require("./leadFeatures.util");
const logger = require("../utils/logger");

// SOP section 40 feedback loop: when a lead's real outcome (Converted/Lost) becomes
// known, append its features + outcome to the ML service's feedback log. retrain.py
// mixes this into training alongside the synthetic seed set. Not auto-triggered on a
// schedule - run manually before a demo/report (see backend/ml-service/README.md).
const FEEDBACK_LOG_PATH = path.join(__dirname, "../../ml-service/data/feedback_log.csv");

const CSV_HEADER = "source,interaction_count,replied,requirement_type,contact_complete,lead_freshness_days,followup_count,estimated_value,converted\n";

const csvEscape = (value) => {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

class MlFeedbackService {
  /**
   * Appends one training row for a lead whose outcome is now known. Never throws -
   * this is best-effort bookkeeping, not something that should block a status update.
   */
  recordOutcome(lead, converted) {
    try {
      const features = extractFeatures(lead);
      const row = [
        features.source,
        features.interaction_count,
        features.replied,
        features.requirement_type,
        features.contact_complete,
        features.lead_freshness_days,
        features.followup_count,
        features.estimated_value,
        converted ? 1 : 0,
      ]
        .map(csvEscape)
        .join(",");

      if (!fs.existsSync(FEEDBACK_LOG_PATH)) {
        fs.mkdirSync(path.dirname(FEEDBACK_LOG_PATH), { recursive: true });
        fs.writeFileSync(FEEDBACK_LOG_PATH, CSV_HEADER);
      }
      fs.appendFileSync(FEEDBACK_LOG_PATH, row + "\n");
      logger.info(`[mlFeedback] Recorded outcome for lead ${lead._id} (converted=${converted ? 1 : 0})`);
    } catch (err) {
      logger.warn(`[mlFeedback] Failed to record outcome for lead ${lead._id}: ${err.message}`);
    }
  }
}

module.exports = new MlFeedbackService();
