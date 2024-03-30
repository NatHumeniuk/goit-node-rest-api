import express from "express";

import {
  signup,
  verify,
  resendVerify,
  signin,
  getCurrent,
  signout,
  updateSubscription,
  updateAvatar,
} from "../controllers/authControllers.js";
import {
  userSignupSchema,
  userEmailSchema,
  userSigninSchema,
  updateSubscriptionSchema,
} from "../schemas/usersSchemas.js";
import validateBody from "../decorators/validatorBody.js";
import authenticate from "../middlewares/authenticate.js";

import upload from "../middlewares/upload.js";

const authRouter = express.Router();

authRouter.post(
  "/register",
  upload.single("avatar"),
  validateBody(userSignupSchema),
  signup
);

authRouter.get("/verify/:verificationToken", verify);

authRouter.post("/verify", validateBody(userEmailSchema), resendVerify);

authRouter.post("/login", validateBody(userSigninSchema), signin);

authRouter.get("/current", authenticate, getCurrent);

authRouter.post("/logout", authenticate, signout);

authRouter.patch(
  "/",
  authenticate,
  validateBody(updateSubscriptionSchema),
  updateSubscription
);
authRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  updateAvatar
);

export default authRouter;
