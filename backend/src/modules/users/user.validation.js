const Joi = require("joi");

const createUserSchema = {
  body: Joi.object().keys({
    name: Joi.string().required().trim().min(2).max(100),
    email: Joi.string().required().email().lowercase().trim(),
    phone: Joi.string().required().trim().min(10).max(15),
    password: Joi.string().required().min(6),
    role: Joi.string().valid("admin", "salesperson", "manager").default("salesperson"),
  }),
};

const updateUserSchema = {
  body: Joi.object().keys({
    name: Joi.string().optional().trim().min(2).max(100),
    email: Joi.string().optional().email().lowercase().trim(),
    phone: Joi.string().optional().trim().min(10).max(15),
    role: Joi.string().optional().valid("admin", "salesperson", "manager"),
    status: Joi.string().optional().valid("active", "inactive"),
  }),
};

module.exports = {
  createUserSchema,
  updateUserSchema,
};
