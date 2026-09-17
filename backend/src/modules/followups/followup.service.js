const FollowUp = require("../../models/FollowUp.model");
const Lead = require("../../models/Lead.model");
const ApiError = require("../../utils/apiError");
const { FollowUpQueryBuilder } = require("../../utils/queryBuilder");
const activityService = require("../activity/activity.service");
const notificationService = require("../notifications/notification.service");

class FollowUpService {
  async createFollowUp(followUpData, user) {
    const lead = await Lead.findById(followUpData.leadId);
    if (!lead) {
      throw new ApiError(404, "Associated lead not found.");
    }

    const scheduledDate = new Date(followUpData.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw new ApiError(400, "Invalid scheduled date/time format.");
    }

    const assignedToUser = followUpData.assignedTo || lead.assignedTo || user._id;

    const followUp = await FollowUp.create({
      ...followUpData,
      assignedTo: assignedToUser,
      scheduledAt: scheduledDate,
      status: "Pending",
    });

    // Update lead's next follow up date
    lead.nextFollowUpDate = scheduledDate;
    if (lead.status === "New" || lead.status === "Contacted") {
      lead.status = "Follow-up";
    }
    await lead.save();

    // 1. Audit Log Activity
    await activityService.logActivity({
      leadId: lead._id,
      userId: user._id,
      userRole: user.role,
      actionType: "FOLLOWUP_CREATED",
      entityType: "followup",
      entityId: followUp._id,
      title: "Follow-up Scheduled",
      description: `Follow-up (${followUp.type}) scheduled for ${scheduledDate.toLocaleString()} by ${user.name}.`,
      newValue: { type: followUp.type, scheduledAt: scheduledDate, status: "Pending" },
      metadata: { followUpId: followUp._id, type: followUp.type, scheduledAt: scheduledDate },
    });

    // 2. Dispatch Notification to assigned salesperson
    if (assignedToUser.toString() !== user._id.toString()) {
      await notificationService.sendNotification({
        recipientId: assignedToUser,
        targetRole: "salesperson",
        type: "FOLLOWUP_REMINDER",
        title: "Follow-up Task Scheduled",
        message: `A follow-up (${followUp.type}) with '${lead.name}' was scheduled for ${scheduledDate.toLocaleString()}.`,
        data: { followUpId: followUp._id, leadId: lead._id },
      });
    }

    return await FollowUp.findById(followUp._id)
      .populate("leadId", "name company phone email customLeadId status")
      .populate("assignedTo", "name email phone avatarUrl");
  }

  async getFollowUps(queryString, user) {
    const scopeFilter = {};
    if (user.role === "salesperson") {
      scopeFilter.assignedTo = user._id;
    }

    const qb = new FollowUpQueryBuilder(FollowUp.find(), queryString);
    const filter = qb.buildFollowUpFilter(scopeFilter);

    qb.modelQuery = FollowUp.find(filter);
    qb.sort().paginate();

    qb.modelQuery
      .populate("leadId", "name company phone email customLeadId status")
      .populate("assignedTo", "name email phone avatarUrl");

    const [followUps, total] = await Promise.all([
      qb.modelQuery,
      FollowUp.countDocuments(filter),
    ]);

    return { followUps, pagination: qb.paginationMeta(total) };
  }

  async getLeadFollowUps(leadId, user) {
    if (user && user.role === "salesperson") {
      const lead = await Lead.findById(leadId);
      if (!lead) {
        throw new ApiError(404, "Lead not found.");
      }
      const isOwner =
        (lead.assignedTo && lead.assignedTo.toString() === user._id.toString()) ||
        (lead.createdBy && lead.createdBy.toString() === user._id.toString());
      if (!isOwner) {
        throw new ApiError(
          403,
          "Access denied. You do not have permission to view follow-ups for this lead."
        );
      }
    }

    return await FollowUp.find({ leadId, isDeleted: false })
      .populate("assignedTo", "name email avatarUrl")
      .sort("-scheduledAt");
  }

  async updateFollowUp(followUpId, updateData, user) {
    const followUp = await FollowUp.findById(followUpId);
    if (!followUp) {
      throw new ApiError(404, "Follow-up not found.");
    }

    if (updateData.scheduledAt) {
      const scheduledDate = new Date(updateData.scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        throw new ApiError(400, "Invalid scheduled date/time format.");
      }
      updateData.scheduledAt = scheduledDate;
    }

    const updated = await FollowUp.findByIdAndUpdate(followUpId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("leadId", "name company phone customLeadId")
      .populate("assignedTo", "name email");

    return updated;
  }

  async markAsCompleted(followUpId, notes, user) {
    const followUp = await FollowUp.findById(followUpId);
    if (!followUp) {
      throw new ApiError(404, "Follow-up not found.");
    }

    followUp.status = "Completed";
    followUp.completedAt = new Date();
    if (notes) followUp.notes = notes;
    await followUp.save();

    // Audit Log Activity
    await activityService.logActivity({
      leadId: followUp.leadId,
      userId: user._id,
      userRole: user.role,
      actionType: "FOLLOWUP_COMPLETED",
      entityType: "followup",
      entityId: followUp._id,
      title: "Follow-up Completed",
      description: `Follow-up (${followUp.type}) marked completed by ${user.name}.${notes ? ` Notes: "${notes}"` : ''}`,
      oldValue: { status: "Pending" },
      newValue: { status: "Completed", completedAt: followUp.completedAt },
      metadata: { followUpId: followUp._id, type: followUp.type, notes: notes || null },
    });

    return await FollowUp.findById(followUp._id)
      .populate("leadId", "name company phone customLeadId")
      .populate("assignedTo", "name email");
  }

  async cancelFollowUp(followUpId, user) {
    const followUp = await FollowUp.findById(followUpId);
    if (!followUp) {
      throw new ApiError(404, "Follow-up not found.");
    }

    followUp.status = "Cancelled";
    await followUp.save();

    await activityService.logActivity({
      leadId: followUp.leadId,
      userId: user._id,
      userRole: user.role,
      actionType: "FOLLOWUP_CANCELLED",
      entityType: "followup",
      entityId: followUp._id,
      title: "Follow-up Cancelled",
      description: `Follow-up (${followUp.type}) cancelled by ${user.name}.`,
      oldValue: { status: followUp.status },
      newValue: { status: "Cancelled" },
    });

    return followUp;
  }

  async deleteFollowUp(followUpId) {
    const followUp = await FollowUp.findById(followUpId);
    if (!followUp) {
      throw new ApiError(404, "Follow-up not found.");
    }
    followUp.isDeleted = true;
    await followUp.save();
    return true;
  }
}

module.exports = new FollowUpService();
