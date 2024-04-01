import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import gravatar from "gravatar";
import jimp from "jimp";
import { nanoid } from "nanoid";

import * as authServices from "../services/authServices.js";
import HttpError from "../helpers/HttpError.js";
import sendEmail from "../helpers/sendEmail.js";

const { JWT_SECRET, BASE_URL } = process.env;

const avatarsPath = path.resolve("public", "avatars");

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const avatarURL = gravatar.url(email, { s: "200", r: "pg", d: "mm" }, false);
  const verificationToken = nanoid();

  const user = await authServices.findUser({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  try {
    const newUser = await authServices.signup({
      username,
      email,
      password,
      avatarURL,
      verificationToken,
    });

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a href="${BASE_URL}/api/users/verify/${verificationToken}" target="_blank">Click to verify</a>`,
    };

    await sendEmail(verifyEmail);

    res.status(201).json({
      username: newUser.username,
      email: newUser.email,
      subscription: newUser.subscription,
      avatarURL: newUser.avatarURL,
    });
  } catch (error) {
    next(error);
  }
};

export const verify = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await authServices.findUser({ verificationToken });

    if (!user) {
      throw HttpError(404, "User not found");
    }

    await authServices.updateUser(
      { _id: user._id },
      { verify: true, verificationCode: "" }
    );
    res.json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};

export const resendVerify = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await authServices.findUser({ email });

    if (!user) {
      throw HttpError(404, "User not found");
    }

    if (user.verify) {
      throw HttpError(400, "Verification has already been passed");
    }

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a href="${BASE_URL}/api/users/verify/${user.verificationToken}" target="_blank">Click to verify</a>`,
    };

    await sendEmail(verifyEmail);

    res.json({ message: "Verification email sent" });
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

  if (!user.verify) {
    throw HttpError(401, "Email not vefify");
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

export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw HttpError(400, "Please provide an image for the avatar.");
    }

    const { _id } = req.user;
    const { path: tempPath, filename } = req.file;

    const avatar = await jimp.read(tempPath);
    await avatar.resize(250, 250).quality(60).writeAsync(tempPath);

    const newFilename = `${_id}_${filename}`;
    const newAvatarPath = path.join(avatarsPath, newFilename);

    await fs.rename(tempPath, newAvatarPath);
    const avatarURL = path.join("/avatars", newFilename);

    const updatedUserAvatar = await authServices.updateUser(
      { _id },
      { avatarURL }
    );

    if (!updatedUserAvatar) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json({ avatarURL });
  } catch (error) {
    next(error);
  }
};
