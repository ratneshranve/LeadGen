const Joi = require("joi");

const publicIngestSchema = {
  body: Joi.object().keys({
    name: Joi.string().required().trim().min(2).max(100),
    phone: Joi.string().required().trim(),
    email: Joi.string().optional().allow("", null).email(),
    company: Joi.string().optional().allow("", null),
    message: Joi.string().optional().allow("", null).max(2000),
  }),
};

module.exports = { publicIngestSchema };
