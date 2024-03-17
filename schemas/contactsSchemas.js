import Joi from "joi";
import { patternPhone } from "../constants/contacts-constants.js";

export const createContactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().pattern(patternPhone).required().messages({
    "string.pattern.base": "Phone number must be in the format: (xxx) xxx-xxxx",
    "string.empty": "Phone number is required",
    "any.required": "Phone number is required",
  }),
  favorite: Joi.boolean(),
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
  favorite: Joi.boolean(),
})
  .min(1)
  .messages({ "object.min": "Body must have at least one field" });

export const updateStatusContactSchema = Joi.object({
  favorite: Joi.boolean().required(),
});
