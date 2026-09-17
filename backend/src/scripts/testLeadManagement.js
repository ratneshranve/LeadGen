require("dotenv").config();
const leadService = require("../modules/leads/lead.service");
const User = require("../models/User.model");
const LeadSource = require("../models/LeadSource.model");
const PipelineStage = require("../models/PipelineStage.model");
const Product = require("../models/Product.model");
const Lead = require("../models/Lead.model");
const Activity = require("../models/Activity.model");
const connectDB = require("../../config/db");
const logger = require("../utils/logger");

const runLeadManagementTests = async () => {
  try {
    logger.info("🧪 Starting Complete Lead Management API Suite Test...");

    await connectDB();

    // 1. Setup mock test entities
    const adminUser = await User.create({
      name: "Admin Lead Tester",
      email: `admin.tester.${Date.now()}@appzeto.com`,
      phone: `+9188${Math.floor(10000000 + Math.random() * 90000000)}`,
      passwordHash: "AdminPass@123",
      role: "admin",
    });

    const salesUser = await User.create({
      name: "Sales Rep Tester",
      email: `sales.tester.${Date.now()}@appzeto.com`,
      phone: `+9177${Math.floor(10000000 + Math.random() * 90000000)}`,
      passwordHash: "SalesPass@123",
      role: "salesperson",
    });

    const testSource = await LeadSource.create({
      name: `Test Source ${Date.now()}`,
      code: "TESTSRC",
    });

    const stage1 = await PipelineStage.create({
      name: `New Stage ${Date.now()}`,
      key: `stage_new_${Date.now()}`,
      order: 1,
    });

    const stage2 = await PipelineStage.create({
      name: `Contacted Stage ${Date.now()}`,
      key: `stage_contacted_${Date.now()}`,
      order: 2,
    });

    const testProduct = await Product.create({
      name: `Enterprise CRM Module ${Date.now()}`,
      price: 50000,
    });

    logger.info("Step 1: Testing Lead Creation & Auto-Generated Custom ID...");
    const leadRes1 = await leadService.createLead(
      {
        name: "Acme Heavy Industries",
        company: "Acme Corp",
        email: "contact@acme.com",
        phone: "+919876500001",
        sourceId: testSource._id,
        stageId: stage1._id,
        status: "New",
        products: [testProduct._id],
        notes: "Interested in enterprise CRM solution.",
      },
      adminUser
    );
    logger.info(`✅ Created Lead Custom ID: [${leadRes1.lead.customLeadId}] | Name: '${leadRes1.lead.name}'`);

    logger.info("Step 2: Testing Lead Assignment & Reassignment Audit Logs...");
    const assignRes = await leadService.assignLead(leadRes1.lead._id, salesUser._id, adminUser);
    logger.info(`✅ Lead assigned to: [${assignRes.lead.assignedTo?.name}]`);

    logger.info("Step 3: Testing Lead Status & Stage Mutation Tracking...");
    const updateRes = await leadService.updateLead(
      leadRes1.lead._id,
      {
        status: "Contacted",
        stageId: stage2._id,
        notes: "Initial phone call completed. Demo scheduled.",
      },
      salesUser
    );
    logger.info(`✅ Lead Status Updated to: [${updateRes.status}] | Stage: [${updateRes.stageId?.name}]`);

    logger.info("Step 4: Testing Lead Details Retrieval & Timeline History...");
    const detailsRes = await leadService.getLeadById(leadRes1.lead._id);
    logger.info(`✅ Lead Details Fetched. Timeline Activities Recorded: ${detailsRes.activities.length}`);

    logger.info("Step 5: Testing Data Scoping (Salesperson view vs Admin view)...");
    const salesLeads = await leadService.getAllLeads({}, salesUser);
    const adminLeads = await leadService.getAllLeads({}, adminUser);
    logger.info(`✅ Salesperson View Count: ${salesLeads.leads.length} | Admin View Count: ${adminLeads.leads.length}`);

    logger.info("Step 6: Testing Bulk Operations & Soft Delete...");
    await leadService.bulkActions({ leadIds: [leadRes1.lead._id], action: "status", status: "Interested" }, adminUser);
    logger.info("✅ Bulk status change executed successfully!");

    await leadService.deleteLead(leadRes1.lead._id, adminUser);
    logger.info("✅ Lead soft-deleted successfully!");

    // Clean test entities
    await User.deleteMany({ _id: { $in: [adminUser._id, salesUser._id] } });
    await LeadSource.deleteOne({ _id: testSource._id });
    await PipelineStage.deleteMany({ _id: { $in: [stage1._id, stage2._id] } });
    await Product.deleteOne({ _id: testProduct._id });
    await Lead.deleteOne({ _id: leadRes1.lead._id });
    await Activity.deleteMany({ leadId: leadRes1.lead._id });

    logger.info("🎉 All Lead Management API Suite Tests Passed Successfully!");
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Lead Management Suite Failure: ${error.message}`);
    process.exit(1);
  }
};

runLeadManagementTests();
