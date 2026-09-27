const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require("../../config/env");
const companyContext = require("../config/companyContext");
const ApiError = require("../utils/apiError");

let client = null;
const getClient = () => {
  if (!config.gemini.apiKey) {
    throw new ApiError(503, "AI response drafting is not configured (GEMINI_API_KEY is missing).");
  }
  if (!client) client = new GoogleGenerativeAI(config.gemini.apiKey);
  return client;
};

const buildPrompt = (lead, interactions) => {
  const recentInteractions = interactions
    .slice(-5)
    .map((i) => `- [${i.channel}] ${i.note}`)
    .join("\n") || "(no prior interactions yet)";

  return `You are drafting a sales reply on behalf of ${companyContext.companyName}.

APPROVED COMPANY FACTS (do not state anything about pricing, products, or policy that
isn't listed here - if asked about something not listed, say a team member will confirm):
${JSON.stringify(companyContext.products, null, 2)}
Policies: ${companyContext.policies.join(" ")}

TONE: ${companyContext.tone}

LEAD:
Name: ${lead.name}
Company: ${lead.company || "N/A"}
Requirement / notes: ${lead.notes || "(none provided)"}
Recent interactions:
${recentInteractions}

Write a short, personalized reply (3-6 sentences) addressing their requirement, using
only the approved facts above. Do not invent prices, discounts, delivery dates, or
commitments not listed. End with a clear next step (e.g. propose a call/demo time).
Output only the message text, no subject line, no markdown.`;
};

class AiResponseService {
  /**
   * Generates a draft reply for a lead. Never sends anything - the caller (sales rep)
   * reviews/edits and explicitly approves before it becomes a real interaction
   * (SOP section 29: AI suggests -> salesperson reviews -> salesperson sends).
   */
  async generateDraft(lead, interactions = []) {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = buildPrompt(lead, interactions);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    if (!text) {
      throw new ApiError(502, "AI service returned an empty draft. Please try again or write manually.");
    }

    return text;
  }
}

module.exports = new AiResponseService();
