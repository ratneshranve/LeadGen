require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../../config/db");
const User = require("../models/User.model");
const LeadSource = require("../models/LeadSource.model");
const LeadCategory = require("../models/LeadCategory.model");
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
    await LeadCategory.deleteMany({});
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

    const managerUser = await User.create({
      name: "Priya Manager",
      email: "priya.manager@appzeto.com",
      phone: "+919876500000",
      passwordHash: "Manager@123",
      role: "manager",
      status: "active",
    });

    const salesUser1 = await User.create({
      name: "Amit Sharma",
      email: "amit.sharma@appzeto.com",
      phone: "+919876511111",
      passwordHash: "Sales@123",
      role: "salesperson",
      status: "active",
      maxActiveLeads: 20,
    });

    const salesUser2 = await User.create({
      name: "Neha Verma",
      email: "neha.verma@appzeto.com",
      phone: "+919876522222",
      passwordHash: "Sales@123",
      role: "salesperson",
      status: "active",
      maxActiveLeads: 20,
    });

    const salesUser3 = await User.create({
      name: "Rahul Mehta",
      email: "rahul.mehta@appzeto.com",
      phone: "+919876533333",
      passwordHash: "Sales@123",
      role: "salesperson",
      status: "active",
      maxActiveLeads: 15,
    });

    logger.info("Seeding Lead Sources...");
    const websiteSource = await LeadSource.create({ name: "Website Inquiry", code: "WEB" });
    const whatsappSource = await LeadSource.create({ name: "WhatsApp Chat", code: "WA" });
    const metaSource = await LeadSource.create({ name: "Meta Ads", code: "META" });
    const referralSource = await LeadSource.create({ name: "Client Referral", code: "REF" });

    logger.info("Seeding Lead Categories...");
    const catEnterprise = await LeadCategory.create({ name: "Enterprise", code: "ENT" });
    const catSMB = await LeadCategory.create({ name: "SMB", code: "SMB" });
    const catStartup = await LeadCategory.create({ name: "Startup", code: "STARTUP" });

    // Amit specializes in Enterprise accounts - used by the auto-assignment engine
    // (backend/src/services/leadAssignment.service.js) to prefer specialist matches.
    salesUser1.specializations = [catEnterprise._id];
    await salesUser1.save();

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
    const leadDefs = [
      { name: "Rahul Sharma", company: "Rahul Traders", email: "rahul@rahultraders.com", phone: "+919876543210", source: websiteSource, category: catEnterprise, stage: stageFollowup, status: "Follow-up", assignedTo: salesUser1, product: prod1, value: 49999, notes: "Product requirement call & pricing options discussion." },
      { name: "Suresh Patel", company: "Patel Chemicals & Solvents", email: "suresh@patelchem.com", phone: "+919876511111", source: whatsappSource, category: catSMB, stage: stageFollowup, status: "Follow-up", assignedTo: salesUser1, product: prod2, value: 25000, notes: "Pricing negotiation and final timeline discussion." },
      { name: "Anjali Gupta", company: "Global Tech Labs", email: "anjali@globaltechlabs.com", phone: "+919654321098", source: metaSource, category: catEnterprise, stage: stageNew, status: "New", assignedTo: salesUser1, product: prod1, value: 49999, notes: "Requested a demo of the enterprise plan." },
      { name: "Riya Kapoor", company: "Kapoor Architecture", email: "riya@kapoorarch.com", phone: "+919866554433", source: referralSource, category: catStartup, stage: stageNew, status: "New", assignedTo: null, product: null, value: 0, notes: "" },
      { name: "Priya Verma", company: "Apex Logistics LLP", email: "priya@apexlogistics.com", phone: "+919812345678", source: metaSource, category: catEnterprise, stage: stageContacted, status: "Contacted", assignedTo: salesUser2, product: prod1, value: 49999, notes: "Follow-up call scheduled to discuss support requirements." },
      { name: "Amit Mehta", company: "Mehta Auto Corp", email: "amit@mehtaauto.com", phone: "+919900122334", source: websiteSource, category: catEnterprise, stage: stageInterested, status: "Interested", assignedTo: salesUser3, product: prod1, value: 49999, notes: "Very interested, wants a demo next week." },
      { name: "Pooja Sharma", company: "Bright Horizon Edu", email: "pooja@brighthorizon.edu", phone: "+919711223344", source: websiteSource, category: catSMB, stage: stageContacted, status: "Contacted", assignedTo: salesUser2, product: prod2, value: 25000, notes: "Requested pricing for support requirements." },
      { name: "Neha Singh", company: "Zenith Software Systems", email: "neha.s@zenithsoft.io", phone: "+919776655443", source: whatsappSource, category: catStartup, stage: stageInterested, status: "Interested", assignedTo: salesUser3, product: prod2, value: 25000, notes: "Technical evaluation in progress." },
      { name: "Karan Johar", company: "Johar Media", email: "karan@joharmedia.com", phone: "+919876787878", source: referralSource, category: catEnterprise, stage: stageConverted, status: "Converted", assignedTo: salesUser1, product: prod1, value: 49999, notes: "Deal closed - annual enterprise license." },
      { name: "Rohit Kumar", company: "Kumar & Sons Retail", email: "rohit@kumarsons.com", phone: "+919876555555", source: referralSource, category: catSMB, stage: stageConverted, status: "Converted", assignedTo: salesUser2, product: prod2, value: 25000, notes: "Deal closed - CRM integration package." },
      { name: "Vikas Jain", company: "Jain Steel Pvt Ltd", email: "vikas@jainsteel.com", phone: "+919876666666", source: websiteSource, category: catSMB, stage: stageLost, status: "Lost", assignedTo: salesUser3, product: null, value: 0, notes: "Budget mismatch - went with a competitor." },
      { name: "Deepa Nair", company: "Greenfield Organics", email: "deepa@greenfield.com", phone: "+919876777777", source: metaSource, category: catStartup, stage: stageLost, status: "Lost", assignedTo: salesUser1, product: null, value: 0, notes: "Not the right fit for their team size." },
    ];

    const createdLeads = [];
    for (const def of leadDefs) {
      const lead = await Lead.create({
        customLeadId: `LD-${1001 + createdLeads.length}`,
        name: def.name,
        company: def.company,
        email: def.email,
        phone: def.phone,
        sourceId: def.source._id,
        categoryId: def.category._id,
        stageId: def.stage._id,
        status: def.status,
        assignedTo: def.assignedTo ? def.assignedTo._id : null,
        createdBy: adminUser._id,
        products: def.product ? [def.product._id] : [],
        estimatedValue: def.value,
        notes: def.notes,
      });
      createdLeads.push(lead);
    }

    logger.info("Seeding Follow-ups...");
    await FollowUp.create({
      leadId: createdLeads[0]._id,
      assignedTo: salesUser1._id,
      type: "Call",
      scheduledAt: new Date(2026, 8, 3, 16, 0),
      status: "Pending",
      notes: "Product requirement call & pricing options discussion.",
    });

    await FollowUp.create({
      leadId: createdLeads[1]._id,
      assignedTo: salesUser1._id,
      type: "Call",
      scheduledAt: new Date(2026, 8, 3, 14, 30),
      status: "Pending",
      notes: "Pricing negotiation and final timeline discussion.",
    });

    await FollowUp.create({
      leadId: createdLeads[4]._id,
      assignedTo: salesUser2._id,
      type: "Meeting",
      scheduledAt: new Date(2026, 8, 30, 11, 0),
      status: "Pending",
      notes: "In-person product demonstration and team pitch.",
    });

    await FollowUp.create({
      leadId: createdLeads[5]._id,
      assignedTo: salesUser3._id,
      type: "Meeting",
      scheduledAt: new Date(2026, 8, 30, 15, 0),
      status: "Pending",
      notes: "Product demo walkthrough.",
    });

    logger.info(`✅ Database Seeding Completed Successfully! (${createdLeads.length} leads, 3 salespeople, 1 manager)`);
    logger.info("Login credentials:");
    logger.info("  Admin:   admin@appzeto.com / Admin@123");
    logger.info("  Manager: priya.manager@appzeto.com / Manager@123");
    logger.info("  Sales:   amit.sharma@appzeto.com / Sales@123");
    logger.info("  Sales:   neha.verma@appzeto.com / Sales@123");
    logger.info("  Sales:   rahul.mehta@appzeto.com / Sales@123");
    process.exit(0);
  } catch (error) {
    logger.error(`Error Seeding Database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
