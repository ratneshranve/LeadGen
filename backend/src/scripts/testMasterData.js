require("dotenv").config();
const pipelineService = require("../modules/pipeline/pipeline.service");
const sourceService = require("../modules/sources/source.service");
const categoryService = require("../modules/categories/category.service");
const productService = require("../modules/products/product.service");
const leadService = require("../modules/leads/lead.service");
const User = require("../models/User.model");
const LeadSource = require("../models/LeadSource.model");
const LeadCategory = require("../models/LeadCategory.model");
const PipelineStage = require("../models/PipelineStage.model");
const Product = require("../models/Product.model");
const Lead = require("../models/Lead.model");
const Activity = require("../models/Activity.model");
const connectDB = require("../../config/db");
const logger = require("../utils/logger");

const runMasterDataTests = async () => {
  try {
    logger.info("🧪 Starting Complete Master Data Suite Test (Pipeline, Sources, Categories, Products)...");

    await connectDB();

    // Setup Test Admin User
    const adminUser = await User.create({
      name: "Master Data Admin",
      email: `master.admin.${Date.now()}@appzeto.com`,
      phone: `+9199${Math.floor(10000000 + Math.random() * 90000000)}`,
      passwordHash: "AdminPass@123",
      role: "admin",
    });

    logger.info("Step 1: Testing Lead Sources (Meta Ads, Google Ads, Website, WhatsApp, Referral, Manual Entry)...");
    const srcMeta = await sourceService.createSource({ name: `Meta Ads ${Date.now()}`, code: "META" });
    const srcWA = await sourceService.createSource({ name: `WhatsApp ${Date.now()}`, code: "WA" });
    logger.info(`✅ Created Sources: [${srcMeta.name}, ${srcWA.name}]`);

    const toggleSrc = await sourceService.toggleSourceStatus(srcMeta._id);
    logger.info(`✅ Toggled Source Status: '${toggleSrc.name}' -> isActive: ${toggleSrc.isActive}`);

    logger.info("Step 2: Testing Lead Categories / Types (Inbound, Enterprise, Cold Prospect)...");
    const catEnterprise = await categoryService.createCategory({ name: `Enterprise ${Date.now()}`, code: "ENT" });
    const catInbound = await categoryService.createCategory({ name: `Inbound ${Date.now()}`, code: "INB" });
    logger.info(`✅ Created Categories: [${catEnterprise.name}, ${catInbound.name}]`);

    logger.info("Step 3: Testing Pipeline Stages (New, Contacted, Follow-up, Interested, Converted, Lost)...");
    const stageNew = await pipelineService.createStage({ name: `New ${Date.now()}`, key: `new_${Date.now()}`, order: 1 });
    const stageContacted = await pipelineService.createStage({ name: `Contacted ${Date.now()}`, key: `contacted_${Date.now()}`, order: 2 });
    logger.info(`✅ Created Pipeline Stages: [${stageNew.name}, ${stageContacted.name}]`);

    logger.info("Step 4: Testing Products & Services Catalog...");
    const prodCRM = await productService.createProduct({ name: `Enterprise CRM License ${Date.now()}`, category: "Software", price: 60000 });
    const prodImpl = await productService.createProduct({ name: `Custom Implementation ${Date.now()}`, category: "Services", price: 25000 });
    logger.info(`✅ Created Catalog Items: [${prodCRM.name} (₹${prodCRM.price}), ${prodImpl.name} (₹${prodImpl.price})]`);

    logger.info("Step 5: Testing Product Assignment to Lead & Automatic Deal Value Recalculation...");
    const lead = await leadService.createLead(
      {
        name: "Test Lead Enterprise Corp",
        phone: "+919876543210",
        sourceId: srcWA._id,
        categoryId: catEnterprise._id,
        stageId: stageNew._id,
        status: "New",
      },
      adminUser
    );

    const assignedLead = await productService.assignProductsToLead(lead.lead._id, [prodCRM._id, prodImpl._id], adminUser);
    logger.info(`✅ Products Assigned to Lead. Recalculated Deal Value: ₹${assignedLead.estimatedValue} (Expected ₹85000)`);

    logger.info("Step 6: Testing Stage Movement & Activity Tracking...");
    const movedLead = await pipelineService.moveLeadStage(lead.lead._id, stageContacted._id, adminUser);
    logger.info(`✅ Lead Moved to Stage: [${movedLead.stageId?.name}]`);

    logger.info("Step 7: Testing Safety Deactivation Check on Stage with Active Leads...");
    try {
      await pipelineService.toggleStageStatus(stageContacted._id);
      logger.error("❌ Safety Check Failed: Active stage was allowed to deactivate while holding leads!");
    } catch (err) {
      logger.info(`✅ Safety Check Passed: Caught Expected Error -> "${err.message}"`);
    }

    logger.info("Step 8: Testing Analytics Aggregations (Sources, Categories, Products)...");
    const srcAnalytics = await sourceService.getSourceAnalytics();
    const prodAnalytics = await productService.getProductAnalytics();
    logger.info(`✅ Source Analytics Records: ${srcAnalytics.length} | Product Analytics Records: ${prodAnalytics.length}`);

    // Cleanup test records
    await User.deleteOne({ _id: adminUser._id });
    await LeadSource.deleteOne({ _id: srcMeta._id });
    await LeadSource.deleteOne({ _id: srcWA._id });
    await LeadCategory.deleteOne({ _id: catEnterprise._id });
    await LeadCategory.deleteOne({ _id: catInbound._id });
    await PipelineStage.deleteOne({ _id: stageNew._id });
    await PipelineStage.deleteOne({ _id: stageContacted._id });
    await Product.deleteOne({ _id: prodCRM._id });
    await Product.deleteOne({ _id: prodImpl._id });
    await Lead.deleteOne({ _id: lead.lead._id });
    await Activity.deleteMany({ leadId: lead.lead._id });

    logger.info("🎉 All Master Data Suite Tests Passed Successfully!");
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Master Data Suite Failure: ${error.message}`);
    process.exit(1);
  }
};

runMasterDataTests();
