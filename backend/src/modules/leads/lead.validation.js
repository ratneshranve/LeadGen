const Joi = require("joi");

const createLeadSchema = {
  body: Joi.object().keys({
    name: Joi.string().required().trim().min(2).max(100),
    company: Joi.string().optional().allow("", null),
    email: Joi.string().optional().allow("", null).email().lowercase().trim(),
    phone: Joi.string().required().trim(),
    sourceId: Joi.string().required(),
    categoryId: Joi.string().optional().allow(null, ""),
    stageId: Joi.string().required(),
    status: Joi.string().valid("New", "Contacted", "Follow-up", "Interested", "Converted", "Lost").default("New"),
    assignedTo: Joi.string().optional().allow(null, ""),
    products: Joi.array().items(Joi.string()).optional(),
    estimatedValue: Joi.number().optional().min(0),
    notes: Joi.string().optional().allow("", null),
  }),
};

const updateLeadSchema = {
  body: Joi.object().keys({
    name: Joi.string().optional().trim().min(2).max(100),
    company: Joi.string().optional().allow("", null),
    email: Joi.string().optional().allow("", null).email().lowercase().trim(),
    phone: Joi.string().optional().trim(),
    sourceId: Joi.string().optional(),
    categoryId: Joi.string().optional().allow(null, ""),
    stageId: Joi.string().optional(),
    status: Joi.string().optional().valid("New", "Contacted", "Follow-up", "Interested", "Converted", "Lost"),
    assignedTo: Joi.string().optional().allow(null, ""),
    products: Joi.array().items(Joi.string()).optional(),
    estimatedValue: Joi.number().optional().min(0),
    notes: Joi.string().optional().allow("", null),
    lossReason: Joi.string().optional().allow("", null),
  }),
};

const assignLeadSchema = {
  body: Joi.object().keys({
    assignedTo: Joi.string().required(),
  }),
};

const bulkActionSchema = {
  body: Joi.object().keys({
    leadIds: Joi.array().items(Joi.string()).required().min(1),
    action: Joi.string().valid("assign", "status", "delete").required(),
    assignedTo: Joi.string().when("action", { is: "assign", then: Joi.required() }),
    status: Joi.string().valid("New", "Contacted", "Follow-up", "Interested", "Converted", "Lost").when("action", { is: "status", then: Joi.required() }),
  }),
};

module.exports = {
  createLeadSchema,
  updateLeadSchema,
  assignLeadSchema,
  bulkActionSchema,
};
