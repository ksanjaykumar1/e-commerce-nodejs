const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const {
  createJWT,
  attachCookiesToResponse,
  createTokenUser,
} = require("../utils");

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Provide both email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError("User doesn't exit");
  }
  const isMatch = await user.comparePassword(password);
  console.log(isMatch);
  if (!isMatch) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  // const tokenUser = { name: user.name, userId: user._id, role: user.role };
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const register = async (req, res) => {
  const { email, name, password } = req.body;

  const tempUser = await User.findOne({ email });
  if (tempUser) {
    throw new BadRequestError("Email already exists");
  }

  // alternative admin setup
  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";
  const user = await User.create({ email, name, password, role });
  // const tokenUser = { name: user.name, userId: user._id, role: user.role };
  //   const token = createJWT({ payload: tokenUser });

  //   // create cookie
  //   const oneDay = 1000 * 60 * 60 * 24;
  //   res.cookie("token", token, {
  //     httpOnly: true,
  //     exprires: new Date(Date.now() + oneDay),
  //   });

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res
    .status(StatusCodes.CREATED)
    .json({ user: { userId: user._id, name: user.name } });
};

const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now() + 5 * 1000),
  });
  res.status(StatusCodes.OK).json({ msg: "user has logged out" });
};

module.exports = {
  login,
  register,
  logout,
};
