/**
 * Simulates an external ad-platform sending a lead via signed webhook - what you'd
 * show in a demo instead of a real Meta/Google Ads account. Run it twice with the
 * same idempotency key (default behavior) to prove replay protection: only the first
 * call creates a lead.
 *
 * Usage:
 *   node src/scripts/demoWebhookPing.js
 *   node src/scripts/demoWebhookPing.js --key custom-idempotency-key
 */
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const crypto = require("crypto");
const http = require("http");

const PORT = process.env.PORT || 5000;
const SECRET = process.env.LEAD_INGEST_WEBHOOK_SECRET || "";
const SOURCE_CODE = process.argv.includes("--source")
  ? process.argv[process.argv.indexOf("--source") + 1]
  : "META";
const idempotencyKey = process.argv.includes("--key")
  ? process.argv[process.argv.indexOf("--key") + 1]
  : `demo-meta-lead-${new Date().toISOString().slice(0, 10)}`;

// Shaped like a Meta Lead Ads webhook (see adapters/metaAdsAdapter.js)
const payload = {
  field_data: [
    { name: "full_name", values: ["Jordan Prospect"] },
    { name: "phone_number", values: ["+1 555 987 6543"] },
    { name: "email", values: ["jordan.prospect@example.com"] },
    { name: "company_name", values: ["Prospect Industries"] },
  ],
};

const body = JSON.stringify(payload);
const signature = SECRET ? crypto.createHmac("sha256", SECRET).update(body).digest("hex") : "";

const req = http.request(
  {
    hostname: "localhost",
    port: PORT,
    path: `/api/v1/ingest/webhook/${SOURCE_CODE}?adapter=meta`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
      "X-Idempotency-Key": idempotencyKey,
      ...(signature && { "X-Signature": signature }),
    },
  },
  (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      console.log(`Status: ${res.statusCode}`);
      console.log(data);
      console.log(`\nIdempotency key used: ${idempotencyKey}`);
      console.log("Run this script again with the same key to see the replay get deduped.");
    });
  }
);

req.on("error", (err) => console.error("Request failed:", err.message));
req.write(body);
req.end();
