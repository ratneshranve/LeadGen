const mongoose = require("mongoose");

/**
 * Production-ready QueryBuilder
 *
 * Handles: text search (via $text index), safe filter parsing,
 * sort validation, pagination with hard limits, and standardised
 * pagination metadata.
 *
 * Usage:
 *   const qb = new QueryBuilder(Lead.find(), req.query)
 *     .search(["name","company","phone","email","customLeadId"])
 *     .filter()
 *     .sort()
 *     .paginate();
 *
 *   const docs  = await qb.modelQuery;
 *   const total = await qb.countQuery.countDocuments();
 *   const meta  = qb.paginationMeta(total);
 */
class QueryBuilder {
  static PAGINATION_DEFAULT_LIMIT = 20;
  static PAGINATION_MAX_LIMIT = 200;

  // Fields that are never passed directly to Mongo from user input
  static EXCLUDED_FILTER_KEYS = [
    "page", "limit", "sort", "search", "fields",
    // Lead-specific semantic keys handled explicitly by LeadQueryBuilder
    "from", "to", "followUpFrom", "followUpTo",
    "productId", "assignedTo", "sourceId", "stageId", "categoryId", "status",
  ];

  // Whitelist of sort fields to prevent sort injection
  static ALLOWED_SORT_FIELDS = new Set([
    "createdAt", "-createdAt",
    "updatedAt", "-updatedAt",
    "name", "-name",
    "company", "-company",
    "status", "-status",
    "estimatedValue", "-estimatedValue",
    "nextFollowUpDate", "-nextFollowUpDate",
    "customLeadId", "-customLeadId",
  ]);

  constructor(modelQuery, queryString = {}) {
    this.modelQuery = modelQuery;
    this.queryString = queryString;
    this._filter = {}; // accumulated filter for countQuery
    this._textSearchActive = false;
    this.page = 1;
    this.limit = QueryBuilder.PAGINATION_DEFAULT_LIMIT;
  }

  /**
   * Full-text search using MongoDB $text index.
   * Falls back to no-op if search term is empty.
   * Safe: $text index is deterministic, not a regex COLLSCAN.
   */
  search(fields = []) {
    const term = this.queryString.search?.trim();
    if (!term || term.length < 1) return this;

    // Use $text index if the query is on a model that has one
    // (Lead model has a text index on name, company, email, phone, customLeadId)
    this.modelQuery = this.modelQuery.find({ $text: { $search: term } });
    this._filter.$text = { $search: term };
    this._textSearchActive = true;
    return this;
  }

  /**
   * Apply additional pre-built filter object (from lead/followup specific logic).
   * This is the safe alternative to blindly passing query params.
   */
  applyFilter(filterObj = {}) {
    if (Object.keys(filterObj).length) {
      this.modelQuery = this.modelQuery.find(filterObj);
      Object.assign(this._filter, filterObj);
    }
    return this;
  }

  /**
   * Sort — validates against whitelist, defaults to -createdAt.
   */
  sort() {
    const rawSort = this.queryString.sort?.trim();

    if (rawSort) {
      const parts = rawSort.split(",");
      const safeParts = parts.filter((p) =>
        QueryBuilder.ALLOWED_SORT_FIELDS.has(p.trim())
      );
      if (safeParts.length) {
        this.modelQuery = this.modelQuery.sort(safeParts.join(" "));
        return this;
      }
    }

    // Default: newest first; if text search active add score sort
    const defaultSort = this._textSearchActive
      ? { score: { $meta: "textScore" }, createdAt: -1 }
      : { createdAt: -1 };

    this.modelQuery = this.modelQuery.sort(defaultSort);
    return this;
  }

  /**
   * Paginate — enforces maximum limit, prevents unbounded queries.
   */
  paginate() {
    this.page = Math.max(1, parseInt(this.queryString.page, 10) || 1);
    this.limit = Math.min(
      QueryBuilder.PAGINATION_MAX_LIMIT,
      Math.max(1, parseInt(this.queryString.limit, 10) || QueryBuilder.PAGINATION_DEFAULT_LIMIT)
    );
    const skip = (this.page - 1) * this.limit;
    this.modelQuery = this.modelQuery.skip(skip).limit(this.limit);
    return this;
  }

  /**
   * Build standard pagination metadata object.
   * Call after await countQuery.countDocuments()
   */
  paginationMeta(total) {
    const totalPages = Math.ceil(total / this.limit);
    return {
      page: this.page,
      limit: this.limit,
      total,
      totalPages,
      hasNextPage: this.page < totalPages,
      hasPrevPage: this.page > 1,
    };
  }

  /**
   * Return the accumulated filter for use in a separate count query.
   */
  getFilter() {
    return this._filter;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LeadQueryBuilder — specialised for lead-specific filter semantics
// Parses the full list of lead-aware query params safely without
// passing raw user input to Mongoose.
// ─────────────────────────────────────────────────────────────────────────────
class LeadQueryBuilder extends QueryBuilder {

  /**
   * Parse all lead-specific query params into a safe Mongo filter object.
   * Handles: status, sourceId, stageId, categoryId, assignedTo, products,
   *          date range (from/to), follow-up date range, estimatedValue range
   */
  buildLeadFilter(scopeFilter = {}) {
    const q = this.queryString;
    const filter = { ...scopeFilter };

    // status — single or comma-separated list
    if (q.status) {
      const statuses = q.status.split(",").map((s) => s.trim()).filter(Boolean);
      filter.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
    }

    // sourceId
    if (q.sourceId && mongoose.isValidObjectId(q.sourceId)) {
      filter.sourceId = new mongoose.Types.ObjectId(q.sourceId);
    }

    // stageId
    if (q.stageId && mongoose.isValidObjectId(q.stageId)) {
      filter.stageId = new mongoose.Types.ObjectId(q.stageId);
    }

    // categoryId (lead type)
    if (q.categoryId && mongoose.isValidObjectId(q.categoryId)) {
      filter.categoryId = new mongoose.Types.ObjectId(q.categoryId);
    }

    // assignedTo — single salesperson or "unassigned"
    if (q.assignedTo) {
      if (q.assignedTo === "unassigned") {
        filter.assignedTo = null;
      } else if (mongoose.isValidObjectId(q.assignedTo)) {
        filter.assignedTo = new mongoose.Types.ObjectId(q.assignedTo);
      }
    }

    // productId — leads with a specific product in their array
    if (q.productId && mongoose.isValidObjectId(q.productId)) {
      filter.products = new mongoose.Types.ObjectId(q.productId);
    }

    // createdAt date range (from / to)
    if (q.from || q.to) {
      filter.createdAt = {};
      if (q.from) filter.createdAt.$gte = new Date(q.from);
      if (q.to) {
        const to = new Date(q.to);
        to.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = to;
      }
    }

    // nextFollowUpDate range (followUpFrom / followUpTo)
    if (q.followUpFrom || q.followUpTo) {
      filter.nextFollowUpDate = {};
      if (q.followUpFrom) filter.nextFollowUpDate.$gte = new Date(q.followUpFrom);
      if (q.followUpTo) {
        const to = new Date(q.followUpTo);
        to.setHours(23, 59, 59, 999);
        filter.nextFollowUpDate.$lte = to;
      }
    }

    // estimatedValue range (minValue / maxValue)
    if (q.minValue !== undefined || q.maxValue !== undefined) {
      filter.estimatedValue = {};
      if (q.minValue !== undefined) filter.estimatedValue.$gte = parseFloat(q.minValue) || 0;
      if (q.maxValue !== undefined) filter.estimatedValue.$lte = parseFloat(q.maxValue) || 0;
    }

    // isDeleted always false (enforced by model pre-find, but explicit for aggregations)
    filter.isDeleted = false;

    return filter;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FollowUpQueryBuilder
// ─────────────────────────────────────────────────────────────────────────────
class FollowUpQueryBuilder extends QueryBuilder {
  static ALLOWED_SORT_FIELDS = new Set([
    "scheduledAt", "-scheduledAt",
    "createdAt", "-createdAt",
    "status", "-status",
  ]);

  buildFollowUpFilter(scopeFilter = {}) {
    const q = this.queryString;
    const filter = { ...scopeFilter, isDeleted: false };

    if (q.status) filter.status = q.status;
    if (q.type) filter.type = q.type;
    if (q.leadId && mongoose.isValidObjectId(q.leadId)) {
      filter.leadId = new mongoose.Types.ObjectId(q.leadId);
    }
    if (q.assignedTo && mongoose.isValidObjectId(q.assignedTo)) {
      filter.assignedTo = new mongoose.Types.ObjectId(q.assignedTo);
    }
    if (q.from || q.to) {
      filter.scheduledAt = {};
      if (q.from) filter.scheduledAt.$gte = new Date(q.from);
      if (q.to) {
        const to = new Date(q.to);
        to.setHours(23, 59, 59, 999);
        filter.scheduledAt.$lte = to;
      }
    }

    return filter;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TaskQueryBuilder
// ─────────────────────────────────────────────────────────────────────────────
class TaskQueryBuilder extends QueryBuilder {
  static ALLOWED_SORT_FIELDS = new Set([
    "dueDate", "-dueDate",
    "createdAt", "-createdAt",
    "priority", "-priority",
    "status", "-status",
  ]);

  buildTaskFilter(scopeFilter = {}) {
    const q = this.queryString;
    const filter = { ...scopeFilter };

    if (q.status) filter.status = q.status;
    if (q.priority) filter.priority = q.priority;
    if (q.leadId && mongoose.isValidObjectId(q.leadId)) {
      filter.leadId = new mongoose.Types.ObjectId(q.leadId);
    }
    if (q.assignedTo && mongoose.isValidObjectId(q.assignedTo)) {
      filter.assignedTo = new mongoose.Types.ObjectId(q.assignedTo);
    }
    if (q.from || q.to) {
      filter.dueDate = {};
      if (q.from) filter.dueDate.$gte = new Date(q.from);
      if (q.to) {
        const to = new Date(q.to);
        to.setHours(23, 59, 59, 999);
        filter.dueDate.$lte = to;
      }
    }

    return filter;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UserQueryBuilder
// ─────────────────────────────────────────────────────────────────────────────
class UserQueryBuilder extends QueryBuilder {
  static ALLOWED_SORT_FIELDS = new Set([
    "name", "-name",
    "email", "-email",
    "role", "-role",
    "status", "-status",
    "createdAt", "-createdAt",
  ]);

  buildUserFilter(scopeFilter = {}) {
    const q = this.queryString;
    const filter = { ...scopeFilter };

    if (q.role) filter.role = q.role;
    if (q.status) filter.status = q.status;

    return filter;
  }
}

module.exports = {
  QueryBuilder,
  LeadQueryBuilder,
  FollowUpQueryBuilder,
  TaskQueryBuilder,
  UserQueryBuilder,
};
