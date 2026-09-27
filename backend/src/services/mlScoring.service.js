const axios = require("axios");
const config = require("../../config/env");
const Lead = require("../models/Lead.model");
const Activity = require("../models/Activity.model");
const logger = require("../utils/logger");
const { extractFeatures } = require("./leadFeatures.util");

class MlScoringService {
  /**
   * Scores a lead via the ML microservice and persists score/priority/scoreHistory.
   * Never throws - the SOP requires lead creation/updates to keep working if the ML
   * service is unreachable (fallback: leave score unset, log a warning).
   */
  async scoreLead(leadId) {
    if (!config.mlService.url) return null;

    try {
      const lead = await Lead.findById(leadId).populate("sourceId", "name");
      if (!lead) return null;

      const features = extractFeatures(lead);
      const { data } = await axios.post(`${config.mlService.url}/predict`, features, {
        headers: { "X-API-Key": config.mlService.apiKey || "" },
        timeout: 5000,
      });

      lead.score = data.score;
      lead.priority = data.priority;
      lead.scoreHistory.push({
        score: data.score,
        probability: data.probability,
        modelVersion: data.modelVersion,
        scoredAt: new Date(),
      });
      await lead.save();

      await Activity.create({
        leadId: lead._id,
        userId: lead.createdBy,
        actionType: "SCORE_CALCULATED",
        entityType: "lead",
        entityId: lead._id,
        title: "Lead Score Calculated",
        description: `ML model scored this lead ${data.score}/100 (${data.priority} priority).`,
        newValue: { score: data.score, priority: data.priority },
        metadata: { modelVersion: data.modelVersion, probability: data.probability },
      });

      return { score: data.score, priority: data.priority };
    } catch (err) {
      logger.warn(`[mlScoring] Scoring unavailable for lead ${leadId}: ${err.message}`);
      return null;
    }
  }
}

module.exports = new MlScoringService();
