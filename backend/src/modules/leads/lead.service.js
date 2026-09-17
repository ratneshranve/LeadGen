const Lead = require("../../models/Lead.model");
const ApiError = require("../../utils/apiError");
const { LeadQueryBuilder } = require("../../utils/queryBuilder");
const activityService = require("../activity/activity.service");
const notificationService = require("../notifications/notification.service");
const uploadService = require("../uploads/upload.service");

class LeadService {
  /**
   * Auto-generate custom lead ID (e.g. "LD-1001")
   * Safe against race conditions and deletion holes
   */
  async generateCustomLeadId() {
    const latestLead = await Lead.findOne(
      { customLeadId: { $regex: /^LD-\d+$/ } },
      { customLeadId: 1 },
      { withDeleted: true }
    ).sort("-createdAt");

    if (!latestLead || !latestLead.customLeadId) {
      return "LD-1001";
    }

    const currentNum = parseInt(latestLead.customLeadId.replace("LD-", ""), 10);
    const nextNum = isNaN(currentNum) ? 1001 : currentNum + 1;
    return `LD-${nextNum}`;
  }

  /**
   * Create a new Lead
   */
  async createLead(leadData, user) {
    const customId = leadData.customLeadId || (await this.generateCustomLeadId());

    const lead = await Lead.create({
      ...leadData,
      customLeadId: customId,
      createdBy: user._id,
      assignedTo: leadData.assignedTo || (user.role === "salesperson" ? user._id : null),
    });

    // 1. Log Activity Record
    await activityService.logActivity({
      leadId: lead._id,
      userId: user._id,
      userRole: user.role,
      actionType: "LEAD_CREATED",
      entityType: "lead",
      entityId: lead._id,
      title: "Lead Created",
      description: `Lead '${lead.name}' (${lead.company || 'Individual'}) was created by ${user.name}.`,
      newValue: { status: lead.status, source: lead.sourceId, assignedTo: lead.assignedTo },
      metadata: { createdBy: user.name, initialStatus: lead.status },
    });

    // 2. Trigger Notification if assigned
    if (lead.assignedTo) {
      await notificationService.sendNotification({
        recipientId: lead.assignedTo,
        targetRole: "salesperson",
        type: "LEAD_ASSIGNMENT",
        title: "New Lead Assigned",
        message: `Lead '${lead.name}' (${lead.company || 'N/A'}) was assigned to you.`,
        data: { leadId: lead._id },
      });
    }

    return await this.getLeadById(lead._id);
  }

  /**
   * Get leads list with search, filter, sort, pagination & role data scoping
   */
  async getAllLeads(queryString, user) {
    // 1. Build the role-scoped base filter
    const scopeFilter = {};
    if (user.role === "salesperson") {
      scopeFilter.$or = [{ assignedTo: user._id }, { createdBy: user._id }];
    }

    // 2. Use LeadQueryBuilder to safely parse all lead-specific query params
    const qb = new LeadQueryBuilder(Lead.find(), queryString);
    const leadFilter = qb.buildLeadFilter(scopeFilter);

    qb.modelQuery = Lead.find(leadFilter);

    // 3. Apply text search (uses $text index — not regex)
    qb.search();

    // 4. Sort, paginate
    qb.sort().paginate();

    // 5. Populate references
    qb.modelQuery
      .populate("sourceId", "name code")
      .populate("categoryId", "name code")
      .populate("stageId", "name key color order")
      .populate("assignedTo", "name email phone avatarUrl status")
      .populate("createdBy", "name role")
      .populate("products", "name category price");

    // 6. Run data query and count in parallel
    //    Count uses leadFilter (without pagination/skip/limit)
    const countFilter = qb.getFilter();
    const mergedCount = Object.keys(countFilter).length
      ? { ...leadFilter, ...countFilter }
      : leadFilter;

    const [leads, total] = await Promise.all([
      qb.modelQuery,
      Lead.countDocuments(mergedCount),
    ]);

    return { leads, pagination: qb.paginationMeta(total) };
  }

  /**
   * Get single lead details with populated references and activity timeline
   */
  async getLeadById(leadId, user = null) {
    const lead = await Lead.findById(leadId)
      .populate("sourceId", "name code")
      .populate("categoryId", "name code")
      .populate("stageId", "name key color order")
      .populate("assignedTo", "name email phone avatarUrl status")
      .populate("createdBy", "name role")
      .populate("products", "name category price");

    if (!lead) {
      throw new ApiError(404, "Lead not found");
    }

    // Fetch Activity History Timeline scoped to user role
    const activeUser = user || { role: "admin", _id: null };
    const activityResult = await activityService.getLeadActivities(leadId, activeUser, {});

    return {
      lead,
      activities: activityResult.activities,
    };
  }

  /**
   * Update lead profile, status, stage, notes, products with mutation tracking
   */
  async updateLead(leadId, updateData, user) {
    const lead = await Lead.findById(leadId)
      .populate("stageId", "name key")
      .populate("assignedTo", "name email");

    if (!lead) {
      throw new ApiError(404, "Lead not found");
    }

    const previousStatus = lead.status;
    const previousStage = lead.stageId?._id?.toString();
    const previousStageName = lead.stageId?.name || "N/A";
    const previousNotes = lead.notes;

    const updatedLead = await Lead.findByIdAndUpdate(leadId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("sourceId", "name code")
      .populate("categoryId", "name code")
      .populate("stageId", "name key color order")
      .populate("assignedTo", "name email phone avatarUrl")
      .populate("products", "name category price");

    // 1. Audit Track: Status Changes
    if (updateData.status && updateData.status !== previousStatus) {
      await activityService.logActivity({
        leadId: lead._id,
        userId: user._id,
        userRole: user.role,
        actionType: "STATUS_CHANGED",
        entityType: "status",
        entityId: lead._id,
        title: "Lead Status Changed",
        description: `Status changed from '${previousStatus}' to '${updateData.status}' by ${user.name}.`,
        oldValue: previousStatus,
        newValue: updateData.status,
        metadata: { changedBy: user.name },
      });
    }

    // 2. Audit Track: Pipeline Stage Movements
    if (updateData.stageId && updateData.stageId.toString() !== previousStage) {
      await activityService.logActivity({
        leadId: lead._id,
        userId: user._id,
        userRole: user.role,
        actionType: "STAGE_CHANGED",
        entityType: "stage",
        entityId: lead._id,
        title: "Pipeline Stage Changed",
        description: `Pipeline stage moved from '${previousStageName}' to '${updatedLead.stageId?.name || 'New Stage'}' by ${user.name}.`,
        oldValue: { stageId: previousStage, stageName: previousStageName },
        newValue: { stageId: updateData.stageId, stageName: updatedLead.stageId?.name },
        metadata: { changedBy: user.name },
      });
    }

    // 3. Audit Track: Note Additions
    if (updateData.notes && updateData.notes !== previousNotes) {
      await activityService.logActivity({
        leadId: lead._id,
        userId: user._id,
        userRole: user.role,
        actionType: "NOTE_UPDATED",
        entityType: "note",
        entityId: lead._id,
        title: "Lead Note Updated",
        description: `Note updated by ${user.name}.`,
        oldValue: previousNotes,
        newValue: updateData.notes,
      });
    }

    return updatedLead;
  }

  /**
   * Assign or Reassign Lead to Salesperson with tracking
   */
  async assignLead(leadId, targetUserId, currentUser) {
    const lead = await Lead.findById(leadId).populate("assignedTo", "name email");
    if (!lead) {
      throw new ApiError(404, "Lead not found");
    }

    const previousAssignedTo = lead.assignedTo;
    const previousName = previousAssignedTo ? previousAssignedTo.name : "Unassigned";

    lead.assignedTo = targetUserId;
    await lead.save();

    const updatedLead = await Lead.findById(leadId).populate("assignedTo", "name email phone avatarUrl");
    const newName = updatedLead.assignedTo ? updatedLead.assignedTo.name : "Unassigned";

    const isReassignment = !!previousAssignedTo;

    // 1. Audit Track Assignment/Reassignment
    await activityService.logActivity({
      leadId: lead._id,
      userId: currentUser._id,
      userRole: currentUser.role,
      actionType: isReassignment ? "LEAD_REASSIGNED" : "LEAD_ASSIGNED",
      entityType: "assignment",
      entityId: lead._id,
      title: isReassignment ? "Lead Reassigned" : "Lead Assigned",
      description: isReassignment
        ? `Lead reassigned from '${previousName}' to '${newName}' by ${currentUser.name}.`
        : `Lead assigned to '${newName}' by ${currentUser.name}.`,
      oldValue: previousAssignedTo ? { userId: previousAssignedTo._id, name: previousName } : null,
      newValue: { userId: targetUserId, name: newName },
      metadata: { changedBy: currentUser.name },
    });

    // 2. Dispatch Push Notification to Recipient
    await notificationService.sendNotification({
      recipientId: targetUserId,
      targetRole: "salesperson",
      type: "LEAD_ASSIGNMENT",
      title: isReassignment ? "Lead Reassigned to You" : "New Lead Assigned to You",
      message: `Lead '${lead.name}' was assigned to you by ${currentUser.name}.`,
      data: { leadId: lead._id },
    });

    return await this.getLeadById(leadId);
  }

  /**
   * Execute Bulk Actions (Bulk Assign, Bulk Status Change, Bulk Delete)
   */
  async bulkActions(actionData, currentUser) {
    const { leadIds, action, assignedTo, status } = actionData;

    if (action === "assign") {
      await Lead.updateMany({ _id: { $in: leadIds } }, { $set: { assignedTo } });
      for (const leadId of leadIds) {
        await activityService.logActivity({
          leadId,
          userId: currentUser._id,
          actionType: "ASSIGNED",
          title: "Bulk Lead Assignment",
          description: `Lead assigned to salesperson in bulk action by ${currentUser.name}.`,
        });
      }
    } else if (action === "status") {
      await Lead.updateMany({ _id: { $in: leadIds } }, { $set: { status } });
      for (const leadId of leadIds) {
        await activityService.logActivity({
          leadId,
          userId: currentUser._id,
          actionType: "STATUS_CHANGED",
          title: "Bulk Status Change",
          description: `Lead status changed to '${status}' in bulk action by ${currentUser.name}.`,
        });
      }
    } else if (action === "delete") {
      await Lead.updateMany({ _id: { $in: leadIds } }, { $set: { isDeleted: true, deletedAt: new Date() } });
    }

    return true;
  }

  /**
   * Soft Delete Lead
   */
  async deleteLead(leadId, user) {
    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw new ApiError(404, "Lead not found");
    }

    lead.isDeleted = true;
    lead.deletedAt = new Date();
    await lead.save();

    await activityService.logActivity({
      leadId: lead._id,
      userId: user._id,
      userRole: user.role,
      actionType: "LEAD_DELETED",
      entityType: "lead",
      entityId: lead._id,
      title: "Lead Deactivated",
      description: `Lead '${lead.name}' (${lead.customLeadId}) was soft-deleted by ${user.name}.`,
      oldValue: { isDeleted: false },
      newValue: { isDeleted: true },
      metadata: { deletedBy: user.name },
    });

    return true;
  }

  /**
   * Upload and attach image/document to a Lead via Cloudinary
   */
  async addLeadAttachment(leadId, file, user) {
    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw new ApiError(404, "Lead not found");
    }

    if (!file) {
      throw new ApiError(400, "Please upload a file attachment");
    }

    const isImage = file.mimetype.startsWith("image/");
    const folder = `appzeto/leads/${leadId}`;
    let uploadResult;

    if (isImage) {
      uploadResult = await uploadService.uploadImage(file, folder);
    } else {
      uploadResult = await uploadService.uploadDocument(file, folder);
    }

    const attachmentObj = {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      fileName: uploadResult.fileName,
      fileType: uploadResult.fileType,
      uploadedAt: new Date(),
    };

    lead.attachments.push(attachmentObj);
    await lead.save();

    await activityService.logActivity({
      leadId: lead._id,
      userId: user._id,
      actionType: "NOTE_ADDED",
      title: "Lead Attachment Added",
      description: `Attachment '${uploadResult.fileName}' uploaded by ${user.name}.`,
      metadata: attachmentObj,
    });

    return lead;
  }

  /**
   * Delete Lead attachment from Cloudinary and MongoDB document
   */
  async deleteLeadAttachment(leadId, publicId, user) {
    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw new ApiError(404, "Lead not found");
    }

    const attachmentIndex = lead.attachments.findIndex((att) => att.publicId === publicId);
    if (attachmentIndex === -1) {
      throw new ApiError(404, "Attachment not found in lead");
    }

    const attachment = lead.attachments[attachmentIndex];
    const resourceType = attachment.fileType === "image" ? "image" : "raw";

    await uploadService.deleteAsset(publicId, resourceType);

    lead.attachments.splice(attachmentIndex, 1);
    await lead.save();

    await activityService.logActivity({
      leadId: lead._id,
      userId: user._id,
      actionType: "NOTE_ADDED",
      title: "Lead Attachment Deleted",
      description: `Attachment '${attachment.fileName}' deleted by ${user.name}.`,
      metadata: { publicId },
    });

    return lead;
  }
}

module.exports = new LeadService();
