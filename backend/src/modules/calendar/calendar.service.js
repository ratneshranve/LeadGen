const FollowUp = require("../../models/FollowUp.model");
const Task = require("../../models/Task.model");
const ApiError = require("../../utils/apiError");

class CalendarService {
  /**
   * Derive Calendar Feed dynamically from FollowUp and Task collections.
   * Zero duplicate event database storage.
   */
  async getCalendarEvents({ view = "monthly", year, month, date, startDate, endDate }, user) {
    let rangeStart;
    let rangeEnd;

    const targetYear = parseInt(year, 10) || new Date().getFullYear();
    const targetMonth = parseInt(month, 10) || new Date().getMonth() + 1;

    if (view === "daily") {
      const baseDate = date ? new Date(date) : new Date();
      if (isNaN(baseDate.getTime())) {
        throw new ApiError(400, "Invalid date format for daily view.");
      }
      rangeStart = new Date(baseDate.setHours(0, 0, 0, 0));
      rangeEnd = new Date(baseDate.setHours(23, 59, 59, 999));
    } else if (view === "weekly") {
      if (!startDate || !endDate) {
        // Default to current week (Mon-Sun)
        const now = new Date();
        const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // Mon = 0
        rangeStart = new Date(now.setDate(now.getDate() - dayOfWeek));
        rangeStart.setHours(0, 0, 0, 0);
        rangeEnd = new Date(rangeStart);
        rangeEnd.setDate(rangeEnd.getDate() + 6);
        rangeEnd.setHours(23, 59, 59, 999);
      } else {
        rangeStart = new Date(startDate);
        rangeEnd = new Date(endDate);
        rangeEnd.setHours(23, 59, 59, 999);
      }
    } else {
      // Default: Monthly view
      rangeStart = new Date(targetYear, targetMonth - 1, 1, 0, 0, 0, 0);
      rangeEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);
    }

    // Common query scoping
    const followupQuery = {
      isDeleted: false,
      scheduledAt: { $gte: rangeStart, $lte: rangeEnd },
    };

    const taskQuery = {
      isDeleted: false,
      dueDate: { $gte: rangeStart, $lte: rangeEnd },
    };

    if (user.role === "salesperson") {
      followupQuery.assignedTo = user._id;
      taskQuery.assignedTo = user._id;
    }

    // 1. Fetch Derived Follow-up Events
    const followUps = await FollowUp.find(followupQuery)
      .populate("leadId", "name company phone email customLeadId status")
      .populate("assignedTo", "name email phone avatarUrl")
      .sort("scheduledAt");

    // 2. Fetch Derived General Tasks & Appointments
    const tasks = await Task.find(taskQuery)
      .populate("leadId", "name company phone email customLeadId status")
      .populate("assignedTo", "name email phone avatarUrl")
      .sort("dueDate");

    // 3. Map to unified Calendar Feed Schema
    const formattedFollowUps = followUps.map((f) => ({
      id: f._id,
      eventType: "FOLLOW_UP",
      title: `${f.type} with ${f.leadId?.name || "Lead"}`,
      category: f.type,
      start: f.scheduledAt,
      status: f.status,
      notes: f.notes,
      lead: f.leadId,
      assignedTo: f.assignedTo,
    }));

    const formattedTasks = tasks.map((t) => ({
      id: t._id,
      eventType: "TASK",
      title: t.title,
      category: t.priority,
      start: t.dueDate,
      status: t.status,
      notes: t.description,
      lead: t.leadId,
      assignedTo: t.assignedTo,
    }));

    const unifiedFeed = [...formattedFollowUps, ...formattedTasks].sort(
      (a, b) => new Date(a.start) - new Date(b.start)
    );

    return {
      view,
      dateRange: { start: rangeStart, end: rangeEnd },
      totalEvents: unifiedFeed.length,
      events: unifiedFeed,
    };
  }
}

module.exports = new CalendarService();
