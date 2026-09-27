// Approved company/product facts the AI response generator is allowed to reference.
// The prompt explicitly instructs the model not to invent anything outside this object
// (SOP section 30: no invented prices/discounts/features/commitments). Edit this for
// your own company before a demo.
module.exports = {
  companyName: "LeadGen (Appzeto)",
  aboutUs:
    "LeadGen is an AI-powered lead management and sales automation platform for growing sales teams.",
  products: [
    { name: "Lead Management Software - Enterprise", priceINR: 49999, notes: "Full CRM + automation suite, annual license" },
    { name: "CRM Integration & Customization", priceINR: 25000, notes: "One-time setup and custom integration work" },
  ],
  policies: [
    "Demos are scheduled within 2 business days of a request.",
    "Pricing quotes are valid for 30 days.",
    "Custom enterprise pricing is available for 50+ seat deployments - a sales rep will follow up separately.",
  ],
  tone: "Friendly, professional, concise. No excessive exclamation points or emoji.",
};
