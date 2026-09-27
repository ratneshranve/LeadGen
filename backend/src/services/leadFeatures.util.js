// Shared feature extraction for the ML scoring service (mlScoring.service.js) and the
// feedback loop (mlFeedback.service.js) - both must build features the exact same way
// the training data does (backend/ml-service/data/generate_synthetic_data.py).
const SOURCE_NAME_FALLBACK = "Website Inquiry";

// Maps free-text notes content to one of the synthetic model's requirement_type buckets -
// a real system would use a structured "requirement" field; this project's Lead model
// doesn't have one, so we infer it cheaply from notes text.
const inferRequirementType = (lead) => {
  const text = `${lead.notes || ""}`.toLowerCase();
  if (text.includes("demo")) return "Demo";
  if (text.includes("pric")) return "Pricing";
  if (text.includes("support")) return "Support";
  return "General";
};

const extractFeatures = (lead) => {
  const freshnessDays = Math.max(0, Math.floor((Date.now() - new Date(lead.createdAt || Date.now())) / 86400000));
  const interactions = lead.interactions || [];

  return {
    source: lead.sourceId?.name || SOURCE_NAME_FALLBACK,
    interaction_count: interactions.length,
    replied: interactions.some((i) => i.channel === "reply") ? 1 : 0,
    requirement_type: inferRequirementType(lead),
    contact_complete: lead.email && lead.phone ? 1 : 0,
    lead_freshness_days: freshnessDays,
    followup_count: lead.nextFollowUpDate ? 1 : 0,
    estimated_value: lead.estimatedValue || 0,
  };
};

module.exports = { extractFeatures };
