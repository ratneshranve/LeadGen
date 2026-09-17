const mongoose = require("mongoose");
const XLSX = require("xlsx");
const { stringify } = require("csv-stringify/sync");
const Lead = require("../../models/Lead.model");
const LeadSource = require("../../models/LeadSource.model");
const PipelineStage = require("../../models/PipelineStage.model");
const User = require("../../models/User.model");
const leadService = require("../leads/lead.service");
const logger = require("../../utils/logger");

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const VALID_STATUSES = ["New", "Contacted", "Follow-up", "Interested", "Converted", "Lost"];

const REQUIRED_COLUMNS = ["name", "phone"];

const OPTIONAL_COLUMNS = [
  "company", "email", "status", "notes",
  "source", "stage", "assignedTo", "estimatedValue",
];

const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

// Canonical export column headers (in order)
const EXPORT_HEADERS = [
  "CustomID", "Name", "Company", "Email", "Phone",
  "Status", "Source", "Stage", "AssignedTo",
  "EstimatedValue", "Notes", "CreatedAt",
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalise raw spreadsheet/CSV headers to lowercase trimmed keys
 */
function normalizeHeaders(rawRow) {
  const normalized = {};
  for (const key of Object.keys(rawRow)) {
    normalized[key.trim().toLowerCase().replace(/\s+/g, "")] = rawRow[key];
  }
  return normalized;
}

/**
 * Parse an uploaded file buffer into an array of raw row objects.
 * Supports: .csv  .xls  .xlsx
 */
function parseFileBuffer(buffer, mimetype, originalname) {
  const ext = originalname?.split(".").pop()?.toLowerCase();

  // Use xlsx for everything — it handles .csv, .xls, .xlsx natively
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("The uploaded file has no sheets.");

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: "",       // empty cells → ""
    raw: false,       // everything as string for consistent handling
  });

  if (!rows || rows.length === 0) {
    throw new Error("The uploaded file contains no data rows.");
  }

  return rows;
}

/**
 * Validate a single normalised lead row.
 * Returns { valid: bool, errors: string[] }
 */
function validateRow(row, rowIndex) {
  const errors = [];

  if (!row.name || row.name.trim().length < 2) {
    errors.push(`Row ${rowIndex}: "name" is required and must be at least 2 characters.`);
  }

  if (!row.phone || row.phone.trim().length < 6) {
    errors.push(`Row ${rowIndex}: "phone" is required and must be at least 6 digits.`);
  }

  if (row.email && row.email.trim() !== "") {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(row.email.trim())) {
      errors.push(`Row ${rowIndex}: "email" (${row.email}) is not a valid email address.`);
    }
  }

  if (row.status && !VALID_STATUSES.includes(row.status)) {
    errors.push(
      `Row ${rowIndex}: "status" must be one of: ${VALID_STATUSES.join(", ")}. Got: "${row.status}".`
    );
  }

  if (row.estimatedvalue !== "" && row.estimatedvalue !== undefined) {
    const val = parseFloat(row.estimatedvalue);
    if (isNaN(val) || val < 0) {
      errors.push(`Row ${rowIndex}: "estimatedValue" must be a non-negative number.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────
class ImportExportService {

  // ── IMPORT ────────────────────────────────────────────────────────────────

  /**
   * Parse + validate + import leads from an uploaded CSV/Excel file.
   * Goes through leadService.createLead so all business rules & activity
   * logging apply exactly as for manual lead creation.
   *
   * @param {Buffer} fileBuffer
   * @param {string} mimetype
   * @param {string} originalname
   * @param {object} user  - authenticated user from request
   * @returns ImportResult
   */
  async importFromFile(fileBuffer, mimetype, originalname, user) {
    // 1. Parse file
    const rawRows = parseFileBuffer(fileBuffer, mimetype, originalname);

    // 2. Fetch lookups once (source / stage / salesperson maps)
    const [sources, stages, salespersons] = await Promise.all([
      LeadSource.find({ isActive: true }).lean(),
      PipelineStage.find({ isActive: true }).sort("order").lean(),
      User.find({ role: "salesperson", isActive: true }).lean(),
    ]);

    const sourceMap = {};
    for (const s of sources) {
      sourceMap[s.name.toLowerCase()] = s._id;
      sourceMap[s.code.toLowerCase()] = s._id;
    }

    const stageMap = {};
    for (const s of stages) {
      stageMap[s.name.toLowerCase()] = s._id;
      if (s.key) stageMap[s.key.toLowerCase()] = s._id;
    }

    const salespersonMap = {};
    for (const u of salespersons) {
      salespersonMap[u.email.toLowerCase()] = u._id;
      salespersonMap[u.name.toLowerCase()] = u._id;
    }

    const defaultSourceId = sources[0]?._id || null;
    const defaultStageId = stages[0]?._id || null;

    if (!defaultSourceId || !defaultStageId) {
      throw new Error(
        "System has no active sources or pipeline stages. Please configure them before importing."
      );
    }

    // 3. Validate all rows up front — collect errors without processing
    const validationErrors = [];
    const validRows = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = normalizeHeaders(rawRows[i]);
      const rowNum = i + 2; // row 1 is header in spreadsheet

      const { valid, errors } = validateRow(row, rowNum);
      if (!valid) {
        validationErrors.push({ row: rowNum, errors });
        continue;
      }

      validRows.push({ row, rowNum });
    }

    // 4. Duplicate detection — check phone numbers within file itself
    const phonesSeen = new Map();
    const emailsSeen = new Map();
    const fileDuplicates = [];

    for (const { row, rowNum } of validRows) {
      const phone = row.phone?.trim();
      const email = row.email?.trim().toLowerCase();

      if (phone && phonesSeen.has(phone)) {
        fileDuplicates.push({
          row: rowNum,
          errors: [`Row ${rowNum}: Duplicate phone "${phone}" found in this file (first seen at row ${phonesSeen.get(phone)}).`],
        });
        continue;
      }
      if (email && email !== "" && emailsSeen.has(email)) {
        fileDuplicates.push({
          row: rowNum,
          errors: [`Row ${rowNum}: Duplicate email "${email}" found in this file (first seen at row ${emailsSeen.get(email)}).`],
        });
        continue;
      }

      if (phone) phonesSeen.set(phone, rowNum);
      if (email && email !== "") emailsSeen.set(email, rowNum);
    }

    // Collect phones/emails to check against DB in a single query
    const allPhones = [...phonesSeen.keys()];
    const allEmails = [...emailsSeen.keys()];

    const existingLeads = await Lead.find({
      isDeleted: false,
      $or: [
        ...(allPhones.length ? [{ phone: { $in: allPhones } }] : []),
        ...(allEmails.length ? [{ email: { $in: allEmails } }] : []),
      ],
    }).select("phone email name").lean();

    const dbPhoneSet = new Set(existingLeads.map((l) => l.phone));
    const dbEmailSet = new Set(existingLeads.map((l) => l.email?.toLowerCase()));

    // 5. Process each validated, deduplicated row
    const succeeded = [];
    const failed = [...validationErrors, ...fileDuplicates];

    const fileDupRows = new Set(fileDuplicates.map((d) => d.row));

    for (const { row, rowNum } of validRows) {
      if (fileDupRows.has(rowNum)) continue; // skip file duplicates

      const phone = row.phone?.trim();
      const email = row.email?.trim().toLowerCase();

      // DB duplicate check
      if (dbPhoneSet.has(phone)) {
        failed.push({
          row: rowNum,
          errors: [`Row ${rowNum}: A lead with phone "${phone}" already exists in the system.`],
        });
        continue;
      }
      if (email && dbEmailSet.has(email)) {
        failed.push({
          row: rowNum,
          errors: [`Row ${rowNum}: A lead with email "${email}" already exists in the system.`],
        });
        continue;
      }

      // Resolve sourceId
      const sourceKey = row.source?.trim().toLowerCase();
      const resolvedSourceId = sourceMap[sourceKey] || defaultSourceId;

      // Resolve stageId
      const stageKey = row.stage?.trim().toLowerCase();
      const resolvedStageId = stageMap[stageKey] || defaultStageId;

      // Resolve assignedTo
      let resolvedAssignedTo = null;
      if (row.assignedto && row.assignedto.trim() !== "") {
        const key = row.assignedto.trim().toLowerCase();
        resolvedAssignedTo = salespersonMap[key] || null;
      }

      try {
        const leadData = {
          name: row.name.trim(),
          company: row.company?.trim() || "",
          email: email || "",
          phone: phone,
          sourceId: resolvedSourceId,
          stageId: resolvedStageId,
          status: VALID_STATUSES.includes(row.status) ? row.status : "New",
          notes: row.notes?.trim() || "Bulk imported lead",
          estimatedValue: parseFloat(row.estimatedvalue) || 0,
          ...(resolvedAssignedTo && { assignedTo: resolvedAssignedTo }),
        };

        const created = await leadService.createLead(leadData, user);
        succeeded.push({ row: rowNum, leadId: created._id, name: created.name });
      } catch (err) {
        logger.error(`Import failed at row ${rowNum}: ${err.message}`);
        failed.push({
          row: rowNum,
          errors: [`Row ${rowNum}: ${err.message}`],
        });
      }
    }

    return {
      total: rawRows.length,
      succeeded: succeeded.length,
      failed: failed.length,
      successDetails: succeeded,
      failureDetails: failed.sort((a, b) => a.row - b.row),
    };
  }

  // ── EXPORT ────────────────────────────────────────────────────────────────

  /**
   * Build the export match query respecting role + filter params.
   */
  _buildExportQuery(user, filters = {}) {
    const query = { isDeleted: false };

    if (user.role === "salesperson") {
      query.$or = [{ assignedTo: user._id }, { createdBy: user._id }];
    }

    if (filters.assignedTo && user.role !== "salesperson") {
      query.assignedTo = new mongoose.Types.ObjectId(filters.assignedTo);
    }
    if (filters.sourceId) query.sourceId = new mongoose.Types.ObjectId(filters.sourceId);
    if (filters.stageId) query.stageId = new mongoose.Types.ObjectId(filters.stageId);
    if (filters.status) query.status = filters.status;
    if (filters.from || filters.to) {
      query.createdAt = {};
      if (filters.from) query.createdAt.$gte = new Date(filters.from);
      if (filters.to) {
        const to = new Date(filters.to);
        to.setHours(23, 59, 59, 999);
        query.createdAt.$lte = to;
      }
    }

    return query;
  }

  /**
   * Fetch leads for export, applying role-scoped filters.
   * Returns flat row objects for serialization.
   * Uses cursor for large datasets.
   */
  async _fetchLeadRows(user, filters = {}) {
    const query = this._buildExportQuery(user, filters);

    const leads = await Lead.find(query)
      .populate("sourceId", "name")
      .populate("stageId", "name")
      .populate("assignedTo", "name email")
      .populate("products", "name")
      .sort("-createdAt")
      .lean();

    return leads.map((l) => ({
      CustomID: l.customLeadId || "",
      Name: l.name,
      Company: l.company || "",
      Email: l.email || "",
      Phone: l.phone,
      Status: l.status,
      Source: l.sourceId?.name || "N/A",
      Stage: l.stageId?.name || "N/A",
      AssignedTo: l.assignedTo?.name || "Unassigned",
      EstimatedValue: l.estimatedValue || 0,
      Notes: l.notes || "",
      CreatedAt: l.createdAt ? new Date(l.createdAt).toISOString() : "",
    }));
  }

  /**
   * Export as CSV — returns a Buffer
   */
  async exportToCsv(user, filters = {}) {
    const rows = await this._fetchLeadRows(user, filters);

    if (rows.length === 0) {
      // Return CSV with just headers when no data
      const empty = stringify([], { header: true, columns: EXPORT_HEADERS });
      return Buffer.from(empty, "utf-8");
    }

    const csv = stringify(rows, {
      header: true,
      columns: EXPORT_HEADERS,
    });

    return Buffer.from(csv, "utf-8");
  }

  /**
   * Export as XLSX — returns a Buffer
   */
  async exportToXlsx(user, filters = {}) {
    const rows = await this._fetchLeadRows(user, filters);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: EXPORT_HEADERS });

    // Column widths
    worksheet["!cols"] = EXPORT_HEADERS.map((h) => ({
      wch: Math.max(h.length + 4, 18),
    }));

    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  }

  /**
   * Generate a blank CSV import template with correct headers
   */
  getImportTemplate() {
    const templateRows = [
      {
        name: "John Doe",
        phone: "+91 9876543210",
        company: "Acme Corp",
        email: "john@example.com",
        status: "New",
        source: "Meta Ads",
        stage: "New",
        assignedTo: "salesperson@email.com",
        estimatedValue: "50000",
        notes: "Sample lead",
      },
    ];

    const csv = stringify(templateRows, {
      header: true,
      columns: [
        "name", "phone", "company", "email",
        "status", "source", "stage", "assignedTo",
        "estimatedValue", "notes",
      ],
    });

    return Buffer.from(csv, "utf-8");
  }
}

module.exports = new ImportExportService();
