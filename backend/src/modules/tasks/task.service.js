const Task = require("../../models/Task.model");
const ApiError = require("../../utils/apiError");
const { TaskQueryBuilder } = require("../../utils/queryBuilder");
const notificationService = require("../notifications/notification.service");

class TaskService {
  async createTask(taskData, user) {
    const dueDate = new Date(taskData.dueDate);
    if (isNaN(dueDate.getTime())) {
      throw new ApiError(400, "Invalid task due date format.");
    }

    const assignedTo = taskData.assignedTo || user._id;

    const task = await Task.create({
      ...taskData,
      assignedTo,
      dueDate,
    });

    // Notify assignee if assigned to another team member
    if (assignedTo.toString() !== user._id.toString()) {
      await notificationService.createNotification({
        recipientId: assignedTo,
        targetRole: "salesperson",
        type: "FOLLOW-UP",
        title: "New Task Assigned",
        message: `Task '${task.title}' was assigned to you by ${user.name}.`,
        data: { taskId: task._id },
      });
    }

    return await Task.findById(task._id)
      .populate("assignedTo", "name email avatarUrl")
      .populate("leadId", "name company customLeadId");
  }

  async getTasks(queryString, user) {
    const scopeFilter = {};
    if (user.role === "salesperson") {
      scopeFilter.assignedTo = user._id;
    }

    const qb = new TaskQueryBuilder(Task.find(), queryString);
    const filter = qb.buildTaskFilter(scopeFilter);

    qb.modelQuery = Task.find(filter);
    qb.search();
    qb.sort().paginate();

    qb.modelQuery
      .populate("assignedTo", "name email avatarUrl")
      .populate("leadId", "name company customLeadId");

    const [tasks, total] = await Promise.all([
      qb.modelQuery,
      Task.countDocuments(filter),
    ]);

    return { tasks, pagination: qb.paginationMeta(total) };
  }

  async updateTask(taskId, updateData, user) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new ApiError(404, "Task not found.");
    }

    if (updateData.dueDate) {
      const dueDate = new Date(updateData.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new ApiError(400, "Invalid task due date format.");
      }
      updateData.dueDate = dueDate;
    }

    const updated = await Task.findByIdAndUpdate(taskId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("assignedTo", "name email avatarUrl")
      .populate("leadId", "name company customLeadId");

    return updated;
  }

  async completeTask(taskId, user) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new ApiError(404, "Task not found.");
    }

    task.status = "Completed";
    await task.save();

    return await Task.findById(task._id)
      .populate("assignedTo", "name email avatarUrl")
      .populate("leadId", "name company customLeadId");
  }

  async deleteTask(taskId) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new ApiError(404, "Task not found.");
    }
    task.isDeleted = true;
    await task.save();
    return true;
  }
}

module.exports = new TaskService();
