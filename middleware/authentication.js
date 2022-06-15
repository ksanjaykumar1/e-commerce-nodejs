const CustomError = require("../errors");
const { isTokenValid } = require("../utils");
const Logger = require("../logger/logger");
const logger = Logger.getLogger("./middleware/authentication");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new CustomError.UnauthenticatedError("Token not present");
  }
  logger.info("Token present");
  try {
    const { userId, name, role } = isTokenValid({ token });
    req.user = { name, userId, role };
    logger.info(JSON.stringify(req.user));
  } catch (error) {}
  next();
};

const authorizePermissions = (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new CustomError.UnauthorizedError('Only admin is authorized to access')
  }
  next();
};

module.exports = {
  authenticateUser,
  authorizePermissions,
};
