// Example adapter shaped like a Meta Lead Ads webhook payload (field_data array of
// {name, values}) - not wired to a real Meta account, just demonstrates that adding a
// real platform is "write one adapter matching its payload shape."
// Real payload reference: https://developers.facebook.com/docs/marketing-api/guides/lead-ads/
module.exports = function metaAdsAdapter(payload) {
  const fields = {};
  for (const field of payload.field_data || []) {
    fields[field.name] = (field.values || [])[0] || "";
  }

  return {
    name: fields.full_name || fields.name || "Unknown Contact",
    phone: fields.phone_number || fields.phone || "",
    email: fields.email || "",
    company: fields.company_name || "",
    notes: fields.message || "",
  };
};
