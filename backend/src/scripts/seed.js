require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../../config/db");
const User = require("../models/User.model");
const LeadSource = require("../models/LeadSource.model");
const PipelineStage = require("../models/PipelineStage.model");
const Product = require("../models/Product.model");
const Lead = require("../models/Lead.model");
const FollowUp = require("../models/FollowUp.model");
const logger = require("../utils/logger");

const seedDatabase = async () => {
  try {
    await connectDB();

    logger.info("Clearing existing sample data...");
    await User.deleteMany({});
    await LeadSource.deleteMany({});
    await PipelineStage.deleteMany({});
    await Product.deleteMany({});
    await Lead.deleteMany({});
    await FollowUp.deleteMany({});

    logger.info("Seeding Users...");
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@appzeto.com",
      phone: "+919876543210",
      passwordHash: "Admin@123",
      role: "admin",
      status: "active",
    });

    const salesUser1 = await User.create({
      name: "Amit Sharma",
      email: "amit.sharma@appzeto.com",
      phone: "+919876511111",
      passwordHash: "Sales@123",
      role: "salesperson",
      status: "active",
    });

    const salesUser2 = await User.create({
      name: "Neha Verma",
      email: "neha.verma@appzeto.com",
      phone: "+919876522222",
      passwordHash: "Sales@123",
      role: "salesperson",
      status: "active",
    });

    logger.info("Seeding Lead Sources...");
    const websiteSource = await LeadSource.create({ name: "Website Inquiry", code: "WEB" });
    const whatsappSource = await LeadSource.create({ name: "WhatsApp Chat", code: "WA" });
    const metaSource = await LeadSource.create({ name: "Meta Ads", code: "META" });
    const referralSource = await LeadSource.create({ name: "Client Referral", code: "REF" });

    logger.info("Seeding Pipeline Stages...");
    const stageNew = await PipelineStage.create({ name: "New Lead", key: "new", order: 1, color: "#ff3b19" });
    const stageContacted = await PipelineStage.create({ name: "Contacted", key: "contacted", order: 2, color: "#7c3aed" });
    const stageFollowup = await PipelineStage.create({ name: "Follow-up", key: "follow_up", order: 3, color: "#d97706" });
    const stageInterested = await PipelineStage.create({ name: "Interested", key: "interested", order: 4, color: "#2563eb" });
    const stageConverted = await PipelineStage.create({ name: "Converted", key: "converted", order: 5, color: "#059669" });
    const stageLost = await PipelineStage.create({ name: "Lost", key: "lost", order: 6, color: "#dc2626" });

    logger.info("Seeding Products & Services...");
    const prod1 = await Product.create({ name: "Lead Management Software Enterprise", price: 49999, category: "Software" });
    const prod2 = await Product.create({ name: "CRM Integration & Customization", price: 25000, category: "Services" });

    logger.info("Seeding Leads...");
    const lead1 = await Lead.create({
      customLeadId: "LD-1001",
      name: "Rahul Sharma",
      company: "Rahul Traders",
      email: "rahul@rahultraders.com",
      phone: "+919876543210",
      sourceId: websiteSource._id,
      stageId: stageFollowup._id,
      status: "Follow-up",
      assignedTo: salesUser1._id,
      createdBy: adminUser._id,
      products: [prod1._id],
      estimatedValue: 49999,
      notes: "Product requirement call & pricing options discussion.",
    });

    const lead2 = await Lead.create({
      customLeadId: "LD-1004",
      name: "Suresh Patel",
      company: "Patel Chemicals & Solvents",
      email: "suresh@patelchem.com",
      phone: "+919876511111",
      sourceId: whatsappSource._id,
      stageId: stageFollowup._id,
      status: "Follow-up",
      assignedTo: salesUser1._id,
      createdBy: adminUser._id,
      products: [prod2._id],
      estimatedValue: 25000,
      notes: "Pricing negotiation and final timeline discussion.",
    });

    logger.info("Seeding Follow-ups...");
    await FollowUp.create({
      leadId: lead1._id,
      assignedTo: salesUser1._id,
      type: "Call",
      scheduledAt: new Date(2026, 8, 3, 16, 0),
      status: "Pending",
      notes: "Product requirement call & pricing options discussion.",
    });

    await FollowUp.create({
      leadId: lead2._id,
      assignedTo: salesUser1._id,
      type: "Call",
      scheduledAt: new Date(2026, 8, 3, 14, 30),
      status: "Pending",
      notes: "Pricing negotiation and final timeline discussion.",
    });

    logger.info("✅ Database Seeding Completed Successfully!");
    process.exit(0);
  } catch (error) {
    logger.error(`Error Seeding Database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
