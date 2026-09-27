const mongoose = require("mongoose");

// Idempotency ledger for the webhook ingestion endpoint (SOP section 27): a replayed
// webhook with the same idempotencyKey is a no-op instead of creating a duplicate lead.
const ingestEventSchema = new mongoose.Schema(
  {
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sourceCode: {
      type: String,
      required: true,
    },
    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["processed", "duplicate", "failed"],
      default: "processed",
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },
  },
  { timestamps: true }
);

const IngestEvent = mongoose.model("IngestEvent", ingestEventSchema);
module.exports = IngestEvent;
