import jwt from "jsonwebtoken";

import * as authServices from "../services/authServices.js";
import HttpError from "../helpers/HttpError.js";

const { JWT_SECRET } = process.env;

export const signup = async (req, res, next) => {
  const { email } = req.body;
  const user = await authServices.findUser({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }
  try {
    const newUser = await authServices.signup(req.body);

    res.status(201).json({
      username: newUser.username,
      email: newUser.email,
      subscription: newUser.subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await authServices.findUser({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const comparePassword = await authServices.validatePassword(
    password,
    user.password
  );

  if (!comparePassword) {
    throw HttpError(401, "Email or password is wrong");
  }

  const { _id: id } = user;

  const payload = {
    id,
  };
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
    await authServices.updateUser({ _id: id }, { token });

    res.json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrent = async (req, res, next) => {
  try {
    const { email, subscription } = req.user;

    res.json({
      email,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const signout = async (req, res, next) => {
  try {
    const { _id } = req.user;
    await authServices.updateUser({ _id }, { token: "" });

    res.json({
      message: "Signout success",
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const { _id: id } = req.user;
    const updatedUser = await authServices.updateUser(
      { _id: id },
      { subscription: req.body.subscription }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ subscription: updatedUser.subscription });
  } catch (error) {
    next(error);
  }
};
