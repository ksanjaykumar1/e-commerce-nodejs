const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const CustomError = require("../errors");
const Logger = require("../logger/logger");
const { createTokenUser, attachCookiesToResponse } = require("../utils");
const logger = Logger.getLogger("./contollers/userController");

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  return res.status(StatusCodes.OK).json({ users });
};
const getUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new CustomError.NotFoundError(
      `User doesn't exist with id ${req.params.id}`
    );
  }
  return res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    throw new CustomError.BadRequestError("Name and email should be present");
  }
  const user = await User.findOneAndUpdate(
    { _id: req.user.userId },
    {
      email,
      name,
    },
    { new: true, runValidators: true }
  );
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ msg: "user updated", user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      "Both old password and new password should be present"
    );
  }
  if (oldPassword === newPassword) {
    throw new CustomError.BadRequestError(
      "Old password and new password cannot be same"
    );
  }

  const user = await User.findOne({ _id: req.user.userId });
  logger.info("aaa", user);
  if (!user) {
    throw new CustomError.BadRequestError(`User doesn't exit`);
  }
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "password updated" });
};

const updateUserSave = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    throw new CustomError.BadRequestError("Name and email should be present");
  }
  const user = await User.findOne({ _id: req.user.userId });
  user.name = name;
  user.email = email;
  await user.save();
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ msg: "user updated", user: tokenUser });
};

module.exports = {
  getAllUsers,
  getUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
