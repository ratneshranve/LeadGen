const ApiError = require("../utils/apiError");

const validate = (schema) => (req, res, next) => {
  const validSchema = {};
  const object = {};

  ["params", "query", "body"].forEach((key) => {
    if (schema[key]) {
      validSchema[key] = schema[key];
      object[key] = req[key];
    }
  });

  const Joi = require("joi");
  const compiledSchema = Joi.object(validSchema);
  const { value, error } = compiledSchema.validate(object, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(", ");
    return next(new ApiError(400, errorMessage, error.details));
  }

  Object.assign(req, value);
  return next();
};

module.exports = validate;
