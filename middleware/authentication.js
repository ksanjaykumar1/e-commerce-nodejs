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

module.exports = {
  authenticateUser,
};
