// Maps a generic {name, phone, email, message} webhook payload into the common Lead
// shape. Adding a real platform later is "write one adapter file like this one" - see
// metaAdsAdapter.js for a differently-shaped example.
module.exports = function genericAdapter(payload) {
  return {
    name: payload.name || payload.full_name || "Unknown Contact",
    phone: payload.phone || payload.phone_number || "",
    email: payload.email || "",
    company: payload.company || "",
    notes: payload.message || payload.notes || "",
  };
};
