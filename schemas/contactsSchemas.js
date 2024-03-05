import Joi from "joi";

const patternPhone = /^\(\d{3}\)\s\d{3}-\d{4}$/;

export const createContactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().pattern(patternPhone).required().messages({
    "string.pattern.base": "Phone number must be in the format: (xxx) xxx-xxxx",
    "string.empty": "Phone number is required",
    "any.required": "Phone number is required",
  }),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().empty(),
  email: Joi.string()
    .empty()
    .email()
    .messages({ "string.email": "Email must be a valid email format" }),
  phone: Joi.string().empty().pattern(patternPhone).messages({
    "string.pattern.base": "Phone number must be in the format: (xxx) xxx-xxxx",
  }),
})
  .min(1)
  .messages({ "object.min": "Body must have at least one field" });
