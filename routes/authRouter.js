import express from "express";

import {
  signup,
  signin,
  getCurrent,
  signout,
  updateSubscription,
} from "../controllers/authControllers.js";
import {
  userSignupSchema,
  userSigninSchema,
  updateSubscriptionSchema,
} from "../schemas/usersSchemas.js";
import validateBody from "../decorators/validatorBody.js";
import authenticate from "../middlewares/authenticate.js";

const authRouter = express.Router();

authRouter.post("/register", validateBody(userSignupSchema), signup);

authRouter.post("/login", validateBody(userSigninSchema), signin);

authRouter.get("/current", authenticate, getCurrent);

authRouter.post("/logout", authenticate, signout);

authRouter.patch(
  "/",
  authenticate,
  validateBody(updateSubscriptionSchema),
  updateSubscription
);

export default authRouter;
