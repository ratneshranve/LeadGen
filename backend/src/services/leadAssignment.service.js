const User = require("../models/User.model");
const Lead = require("../models/Lead.model");
const leadService = require("../modules/leads/lead.service");
const logger = require("../utils/logger");

class LeadAssignmentService {
  /**
   * Rule-based auto-assignment (SOP section 20-22): picks the least-loaded eligible
   * active salesperson, preferring one whose specializations match the lead's category,
   * and among ties for high-priority leads, the rep with the best conversion rate.
   * Manual assignment (lead.routes.js PATCH /:id/assign) always takes precedence -
   * this only runs when a lead has no assignedTo yet.
   */
  async autoAssign(leadId, systemUser) {
    const lead = await Lead.findById(leadId);
    if (!lead || lead.assignedTo) return null;

    const reps = await User.find({ role: "salesperson", status: "active", isDeleted: false });
    if (reps.length === 0) {
      logger.warn(`[leadAssignment] No active salespeople available to assign lead ${leadId}`);
      return null;
    }

    const workloadByRep = await Lead.aggregate([
      { $match: { isDeleted: false, assignedTo: { $in: reps.map((r) => r._id) }, status: { $in: ["New", "Contacted", "Follow-up", "Interested"] } } },
      { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
    ]);
    const workloadMap = new Map(workloadByRep.map((w) => [w._id.toString(), w.count]));

    let eligible = reps
      .map((rep) => ({ rep, workload: workloadMap.get(rep._id.toString()) || 0 }))
      .filter(({ rep, workload }) => workload < (rep.maxActiveLeads || 20));

    if (eligible.length === 0) {
      logger.warn(`[leadAssignment] All salespeople are at capacity - lead ${leadId} stays unassigned`);
      return null;
    }

    // Prefer reps specialized in this lead's category, if any match exists.
    if (lead.categoryId) {
      const specialized = eligible.filter(({ rep }) =>
        (rep.specializations || []).some((s) => s.toString() === lead.categoryId.toString())
      );
      if (specialized.length > 0) eligible = specialized;
    }

    eligible.sort((a, b) => a.workload - b.workload);
    const chosen = eligible[0].rep;

    const result = await leadService.assignLead(leadId, chosen._id, systemUser);
    logger.info(`[leadAssignment] Auto-assigned lead ${leadId} to ${chosen.name} (workload was ${eligible[0].workload})`);
    return result;
  }
}

module.exports = new LeadAssignmentService();
