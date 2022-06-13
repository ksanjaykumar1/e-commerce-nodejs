const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const { BadRequestError } = require("../errors");
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Provide both email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError("User doesn't exit");
  }

  const token = user.createJWT();

  res.send("logged in");
};

const register = async (req, res) => {
  const { email, name, password } = req.body;

  const tempUser = await User.findOne({ email });
  if (tempUser) {
    throw new BadRequestError("Email already exists");
  }
  const user = await User.create({ email, name, password });
  const token = user.createJWT();
  res
    .status(StatusCodes.CREATED)
    .json({ token, user: { userId: user._id, name: user.name } });
};

const logout = async (req, res) => {
  res.send("Logged out");
};

module.exports = {
  login,
  register,
  logout,
};
