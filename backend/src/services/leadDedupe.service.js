const Lead = require("../models/Lead.model");

const normalizeEmail = (email) => (email || "").trim().toLowerCase();
// Keep only digits, then the last 10 (drops country-code/formatting differences like
// "+91 98765-43210" vs "9876543210" vs "098765 43210").
const normalizePhone = (phone) => (phone || "").replace(/[^\d]/g, "").slice(-10);

class LeadDedupeService {
  /**
   * Find an existing non-deleted lead matching the given email or phone.
   * Demo/college-project scale: normalizes in JS rather than a DB-side regex, which is
   * simpler and correct for formatting differences (spacing, dashes, country code).
   */
  async findDuplicate({ email, phone }) {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedEmail && !normalizedPhone) return null;

    const or = [];
    if (normalizedEmail) or.push({ email: normalizedEmail });
    if (normalizedPhone) or.push({ phone: { $regex: `${normalizedPhone}$` } });

    // $regex "ends with last-10-digits" still needs formatting stripped for a true match,
    // so verify candidates precisely in JS before trusting the match.
    const candidates = await Lead.find({ isDeleted: false, $or: or }).sort("-createdAt").limit(25);

    return (
      candidates.find((lead) => {
        if (normalizedEmail && normalizeEmail(lead.email) === normalizedEmail) return true;
        if (normalizedPhone && normalizePhone(lead.phone) === normalizedPhone) return true;
        return false;
      }) || null
    );
  }
}

module.exports = new LeadDedupeService();
