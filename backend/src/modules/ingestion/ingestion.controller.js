const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const ApiError = require("../../utils/apiError");
const config = require("../../../config/env");
const ingestionService = require("./ingestion.service");

const ingestPublic = asyncHandler(async (req, res) => {
  const result = await ingestionService.ingestPublic(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, result, result.duplicate ? "Contact matched an existing lead" : "Lead received successfully"));
});

const ingestWebhook = asyncHandler(async (req, res) => {
  const { sourceCode } = req.params;
  const idempotencyKey = req.headers["x-idempotency-key"];
  const signature = req.headers["x-signature"];
  const adapterName = req.query.adapter || "generic";

  if (!idempotencyKey) {
    throw new ApiError(400, "Missing X-Idempotency-Key header.");
  }

  // Signed over the parsed+re-serialized body - simpler than raw-body capture, and
  // sufficient for this project (the demo webhook script signs the same way).
  const isValid = ingestionService.verifySignature(
    JSON.stringify(req.body),
    signature,
    config.ingestion.webhookSecret
  );
  if (!isValid) {
    throw new ApiError(401, "Invalid webhook signature.");
  }

  const result = await ingestionService.ingestWebhook({
    sourceCode,
    idempotencyKey,
    payload: req.body,
    adapterName,
  });

  return res
    .status(result.duplicate ? 200 : 201)
    .json(new ApiResponse(result.duplicate ? 200 : 201, result, result.duplicate ? "Already processed (idempotent replay)" : "Lead received successfully"));
});

module.exports = { ingestPublic, ingestWebhook };
