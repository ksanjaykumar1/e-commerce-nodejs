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

// const authorizePermissions = (req, res, next) => {
//   if (req.user.role !== "admin") {
//     throw new CustomError.UnauthorizedError('Only admin is authorized to access')
//   }
//   next();
// };
const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError("authorized to access");
    }
    logger.info(req.user.role);
    next();
  };
};

const checkPermissions = (req,res,next) => {
  if (req.params.id !== req.user.userId) {
    throw new CustomError.UnauthorizedError(`User doesn't have permission`);
  }
  next();
};

module.exports = {
  authenticateUser,
  authorizePermissions,
  checkPermissions
};
