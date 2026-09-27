const express = require("express");
const router = express.Router();
const ingestionController = require("./ingestion.controller");
const validate = require("../../middlewares/validate.middleware");
const { ingestLimiter } = require("../../middlewares/rateLimiter.middleware");
const { publicIngestSchema } = require("./ingestion.validation");

// Deliberately NOT behind authenticate() - these are the pipeline's public entry
// points (SOP section 6: website forms, external platform webhooks).
router.post("/public", ingestLimiter, validate(publicIngestSchema), ingestionController.ingestPublic);
router.post("/webhook/:sourceCode", ingestLimiter, ingestionController.ingestWebhook);

module.exports = router;
