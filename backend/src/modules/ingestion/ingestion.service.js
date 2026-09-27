const crypto = require("crypto");
const User = require("../../models/User.model");
const LeadSource = require("../../models/LeadSource.model");
const PipelineStage = require("../../models/PipelineStage.model");
const IngestEvent = require("../../models/IngestEvent.model");
const ApiError = require("../../utils/apiError");
const leadService = require("../leads/lead.service");
const genericAdapter = require("./adapters/genericAdapter");
const metaAdsAdapter = require("./adapters/metaAdsAdapter");

const ADAPTERS = {
  generic: genericAdapter,
  meta: metaAdsAdapter,
};

let systemUserCache = null;

class IngestionService {
  /**
   * Every lead needs a createdBy/activity actor (backend/src/models/Lead.model.js,
   * Activity.model.js). Public ingestion has no logged-in user, so it attributes to a
   * lazily-created internal "System" account instead.
   */
  async getSystemUser() {
    if (systemUserCache) return systemUserCache;

    let user = await User.findOne({ email: "system@leadgen.internal" });
    if (!user) {
      user = await User.create({
        name: "LeadGen System",
        email: "system@leadgen.internal",
        phone: "+10000000000",
        passwordHash: crypto.randomBytes(32).toString("hex"), // never used to log in
        role: "admin",
        status: "active",
      });
    }
    systemUserCache = user;
    return user;
  }

  async getDefaultSource() {
    const source = await LeadSource.findOne().sort("createdAt");
    if (!source) {
      throw new ApiError(500, "No lead source is configured yet - an admin must create one first.");
    }
    return source;
  }

  async getDefaultStage() {
    const stage = await PipelineStage.findOne().sort("order");
    if (!stage) {
      throw new ApiError(500, "No pipeline stage is configured yet - an admin must create one first.");
    }
    return stage;
  }

  /**
   * Public "website form" endpoint - unauthenticated, always maps to the Website
   * source. Goes through the exact same createLead() as the admin UI, so it gets
   * dedupe + the automation pipeline (score -> auto-assign) for free.
   */
  async ingestPublic(payload) {
    const systemUser = await this.getSystemUser();
    const stage = await this.getDefaultStage();

    let source = await LeadSource.findOne({ code: "WEB" });
    if (!source) source = await this.getDefaultSource();

    return leadService.createLead(
      {
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        company: payload.company,
        notes: payload.message,
        sourceId: source._id,
        stageId: stage._id,
      },
      systemUser
    );
  }

  /**
   * Generic signed webhook receiver for external platforms (SOP section 6.3/27).
   * Verifies HMAC signature + idempotency key, maps the payload via the source's
   * adapter, then reuses the same createLead() pipeline as everything else.
   */
  async ingestWebhook({ sourceCode, idempotencyKey, payload, adapterName = "generic" }) {
    const existing = await IngestEvent.findOne({ idempotencyKey });
    if (existing) {
      return { duplicate: true, leadId: existing.leadId };
    }

    const source = await LeadSource.findOne({ code: sourceCode });
    if (!source) {
      throw new ApiError(404, `Unknown lead source code "${sourceCode}". Ask an admin to create it first.`);
    }
    const stage = await this.getDefaultStage();
    const systemUser = await this.getSystemUser();

    const adapter = ADAPTERS[adapterName] || genericAdapter;
    const mapped = adapter(payload);

    if (!mapped.name || !mapped.phone) {
      await IngestEvent.create({ idempotencyKey, sourceCode, rawPayload: payload, status: "failed" });
      throw new ApiError(400, "Webhook payload is missing a name or phone after mapping - check the adapter.");
    }

    const result = await leadService.createLead(
      { ...mapped, sourceId: source._id, stageId: stage._id },
      systemUser
    );

    await IngestEvent.create({
      idempotencyKey,
      sourceCode,
      rawPayload: payload,
      status: "processed",
      leadId: result.lead._id,
    });

    return result;
  }

  /** Verifies the X-Signature header (HMAC-SHA256 of the raw JSON body). */
  verifySignature(rawBody, signature, secret) {
    if (!secret) return true; // signing disabled (no LEAD_INGEST_WEBHOOK_SECRET configured)
    if (!signature) return false;
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }
}

module.exports = new IngestionService();
