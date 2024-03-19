import Joi from "joi";
import { patternEmail } from "../constants/user-constants.js";

export const userSignupSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().pattern(patternEmail).required(),
  password: Joi.string().min(6).required(),
});

export const userSigninSchema = Joi.object({
  email: Joi.string().pattern(patternEmail).required(),
  password: Joi.string().min(6).required(),
});

export const updateSubscriptionSchema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});
