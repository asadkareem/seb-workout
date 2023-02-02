const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");
const router = express.Router();

router.post("/signup", authController.bancode, authController.signup);
router.post("/forgotPassword", authController.forgotPassword);
~router.patch("/resetPassword/:token", authController.resetPassword);
router.post("/login", authController.login);

router.use(authController.protect);
router.use(authController.restrictTo("admin"));
router
  .route("/")
  .get(userController.getAllUsers)
  .post(authController.bancode, userController.createUser);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
router.patch("/deactivate/:id", userController.deactivate);
router.patch("/activate/:id", userController.activate);
module.exports = router;
