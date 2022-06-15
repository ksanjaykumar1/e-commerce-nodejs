const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const CustomError = require("../errors");


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
  res.send("send current user route");
};

const updateUser = async (req, res) => {
  res.send("update user route");
};

const updateUserPassword = async (req, res) => {
  res.send("updateUserPassword ");
};
module.exports = {
  getAllUsers,
  getUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
