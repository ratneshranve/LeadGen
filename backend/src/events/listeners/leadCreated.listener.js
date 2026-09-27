const { leadEvents, LEAD_EVENTS } = require("../leadEvents");
const mlScoringService = require("../../services/mlScoring.service");
const leadAssignmentService = require("../../services/leadAssignment.service");

/**
 * Pipeline step order for a newly created lead: ML score -> auto-assign (only if
 * unassigned) -> (notification already sent synchronously in lead.service.js).
 * Runs after the HTTP response has been sent (fire-and-forget), so scoring/assignment
 * latency never blocks lead creation - matches the SOP's "ML unavailable -> keep lead
 * in processing, don't block" fallback requirement.
 */
leadEvents.on(LEAD_EVENTS.LEAD_CREATED, async ({ leadId, user }) => {
  const scoreResult = await mlScoringService.scoreLead(leadId);
  if (scoreResult) {
    console.log(`[leadCreated] Lead ${leadId} scored ${scoreResult.score}/100 (${scoreResult.priority})`);
  }

  await leadAssignmentService.autoAssign(leadId, user);
});

leadEvents.on(LEAD_EVENTS.LEAD_INTERACTION_RECORDED, async ({ leadId }) => {
  // Re-score whenever new behaviour becomes available (SOP section 16: dynamic scoring).
  await mlScoringService.scoreLead(leadId);
});

module.exports = {};
