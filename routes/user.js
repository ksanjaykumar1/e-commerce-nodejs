const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const {
  getAllUsers,
  getUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");

router.route("/").get(authenticateUser, authorizePermissions('admin','owner'), getAllUsers);
router.route("/showMe").get(showCurrentUser);
router.route("/updateUser").post(updateUser);
router.route("/updateUserPassword").post(updateUserPassword);

// the route with /:id should be added at the bottom , because other routes such as "showMe" will be mistaken for :id parameter
router.route("/:id").get(authenticateUser, getUser);

module.exports = router;
