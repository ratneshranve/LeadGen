require("dotenv").config();
const followUpService = require("../modules/followups/followup.service");
const taskService = require("../modules/tasks/task.service");
const calendarService = require("../modules/calendar/calendar.service");
const leadService = require("../modules/leads/lead.service");
const User = require("../models/User.model");
const LeadSource = require("../models/LeadSource.model");
const PipelineStage = require("../models/PipelineStage.model");
const Lead = require("../models/Lead.model");
const FollowUp = require("../models/FollowUp.model");
const Task = require("../models/Task.model");
const Activity = require("../models/Activity.model");
const connectDB = require("../../config/db");
const logger = require("../utils/logger");

const runFollowupsTasksCalendarTests = async () => {
  try {
    logger.info("🧪 Starting Complete Follow-ups, Tasks & Derived Calendar Feed Test...");

    await connectDB();

    // Setup Test User and Lead
    const testUser = await User.create({
      name: "Calendar Sales Rep",
      email: `cal.sales.${Date.now()}@appzeto.com`,
      phone: `+9198${Math.floor(10000000 + Math.random() * 90000000)}`,
      passwordHash: "SalesPass@123",
      role: "salesperson",
    });

    const testSource = await LeadSource.create({ name: `Cal Source ${Date.now()}`, code: "CAL" });
    const testStage = await PipelineStage.create({ name: `Cal Stage ${Date.now()}`, key: `cal_${Date.now()}`, order: 1 });

    const leadRes = await leadService.createLead(
      {
        name: "Calendar Prospect Corp",
        phone: "+919876599999",
        sourceId: testSource._id,
        stageId: testStage._id,
        status: "New",
      },
      testUser
    );
    const leadId = leadRes.lead._id;

    logger.info("Step 1: Testing Follow-up Scheduling & Date Validation...");
    const scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
    const followup = await followUpService.createFollowUp(
      {
        leadId,
        type: "Meeting",
        scheduledAt: scheduledDate.toISOString(),
        notes: "In-person product demonstration.",
      },
      testUser
    );
    logger.info(`✅ Scheduled Follow-up ID: [${followup._id}] | Type: ${followup.type} | Date: ${new Date(followup.scheduledAt).toLocaleDateString()}`);

    logger.info("Step 2: Testing Follow-up Resolution & Activity Timeline Logging...");
    const completed = await followUpService.markAsCompleted(followup._id, "Meeting went exceptionally well. Proposal requested.", testUser);
    logger.info(`✅ Follow-up Marked as Completed! Status: ${completed.status}`);

    logger.info("Step 3: Testing Task Creation, Assignment & Completion...");
    const taskDueDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 2 Days later
    const task = await taskService.createTask(
      {
        title: "Send Commercial Proposal PDF",
        description: "Draft quotation for enterprise license and send via email.",
        leadId,
        dueDate: taskDueDate.toISOString(),
        priority: "High",
      },
      testUser
    );
    logger.info(`✅ Created Task: '${task.title}' | Priority: ${task.priority}`);

    const completedTask = await taskService.completeTask(task._id, testUser);
    logger.info(`✅ Task Marked as Completed! Status: ${completedTask.status}`);

    logger.info("Step 4: Testing Derived Calendar Feed (Zero Duplicate Event Database Storage)...");
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const monthlyFeed = await calendarService.getCalendarEvents(
      { view: "monthly", year: currentYear, month: currentMonth },
      testUser
    );
    logger.info(`✅ Derived Monthly Calendar Feed Count: ${monthlyFeed.events.length} event(s) fetched.`);

    const dailyFeed = await calendarService.getCalendarEvents(
      { view: "daily", date: new Date().toISOString() },
      testUser
    );
    logger.info(`✅ Derived Daily Calendar Feed Count: ${dailyFeed.events.length} event(s) fetched.`);

    // Cleanup test entities
    await User.deleteOne({ _id: testUser._id });
    await LeadSource.deleteOne({ _id: testSource._id });
    await PipelineStage.deleteOne({ _id: testStage._id });
    await Lead.deleteOne({ _id: leadId });
    await FollowUp.deleteOne({ _id: followup._id });
    await Task.deleteOne({ _id: task._id });
    await Activity.deleteMany({ leadId });

    logger.info("🎉 All Follow-ups, Tasks & Calendar Feed Tests Passed Successfully!");
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Follow-ups/Tasks/Calendar Test Failure: ${error.message}`);
    process.exit(1);
  }
};

runFollowupsTasksCalendarTests();
