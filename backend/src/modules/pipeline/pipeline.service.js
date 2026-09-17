const PipelineStage = require("../../models/PipelineStage.model");
const Lead = require("../../models/Lead.model");
const ApiError = require("../../utils/apiError");
const activityService = require("../activity/activity.service");

class PipelineService {
  async getStages() {
    return await PipelineStage.find().sort("order");
  }

  async getPipelineBoard(user) {
    const stages = await PipelineStage.find({ isActive: true }).sort("order");
    const leadQuery = { isDeleted: false };

    if (user.role === "salesperson") {
      leadQuery.$or = [{ assignedTo: user._id }, { createdBy: user._id }];
    }

    const leads = await Lead.find(leadQuery)
      .populate("sourceId", "name code")
      .populate("categoryId", "name code")
      .populate("stageId", "name key color order")
      .populate("assignedTo", "name email phone avatarUrl");

    const pipelineData = stages.map((stage) => {
      const stageLeads = leads.filter((l) => l.stageId?._id?.toString() === stage._id.toString());
      return {
        stage,
        count: stageLeads.length,
        leads: stageLeads,
      };
    });

    return pipelineData;
  }

  async createStage(stageData) {
    const existingKey = await PipelineStage.findOne({ key: stageData.key });
    if (existingKey) {
      throw new ApiError(400, "Pipeline stage key already exists.");
    }

    const count = await PipelineStage.countDocuments();
    const stage = await PipelineStage.create({
      ...stageData,
      order: stageData.order || count + 1,
    });

    return stage;
  }

  async updateStage(stageId, updateData) {
    const stage = await PipelineStage.findById(stageId);
    if (!stage) {
      throw new ApiError(404, "Pipeline stage not found.");
    }

    const updated = await PipelineStage.findByIdAndUpdate(stageId, updateData, {
      new: true,
      runValidators: true,
    });

    return updated;
  }

  async toggleStageStatus(stageId) {
    const stage = await PipelineStage.findById(stageId);
    if (!stage) {
      throw new ApiError(404, "Pipeline stage not found.");
    }

    // Safety check: Prevent deactivation if active leads reside in this stage
    if (stage.isActive) {
      const leadCount = await Lead.countDocuments({ stageId: stage._id, isDeleted: false });
      if (leadCount > 0) {
        throw new ApiError(
          400,
          `Cannot deactivate stage '${stage.name}' because ${leadCount} active lead(s) reside in it. Please reassign those leads first.`
        );
      }
    }

    stage.isActive = !stage.isActive;
    await stage.save();
    return stage;
  }

  async reorderStages(stagesOrder) {
    for (const item of stagesOrder) {
      await PipelineStage.findByIdAndUpdate(item.id, { order: item.order });
    }
    return await this.getStages();
  }

  async moveLeadStage(leadId, newStageId, user) {
    const lead = await Lead.findById(leadId).populate("stageId", "name key");
    if (!lead) {
      throw new ApiError(404, "Lead not found.");
    }

    const newStage = await PipelineStage.findById(newStageId);
    if (!newStage || !newStage.isActive) {
      throw new ApiError(400, "Invalid or inactive target pipeline stage.");
    }

    const previousStageName = lead.stageId?.name || "N/A";
    lead.stageId = newStage._id;

    // Automatic status sync for Converted / Lost stage keys
    if (newStage.key === "converted") {
      lead.status = "Converted";
    } else if (newStage.key === "lost") {
      lead.status = "Lost";
    } else if (newStage.key === "contacted") {
      lead.status = "Contacted";
    } else if (newStage.key === "follow_up") {
      lead.status = "Follow-up";
    } else if (newStage.key === "interested") {
      lead.status = "Interested";
    }

    await lead.save();

    // Log Activity Movement
    await activityService.logActivity({
      leadId: lead._id,
      userId: user._id,
      actionType: "STAGE_MOVED",
      title: "Pipeline Stage Changed",
      description: `Lead moved from '${previousStageName}' to '${newStage.name}' by ${user.name}.`,
      metadata: {
        oldStage: previousStageName,
        newStage: newStage.name,
      },
    });

    return await Lead.findById(lead._id)
      .populate("sourceId", "name code")
      .populate("stageId", "name key color order")
      .populate("assignedTo", "name email phone avatarUrl");
  }
}

module.exports = new PipelineService();
