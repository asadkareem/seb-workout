const express = require("express");
const expertTipsController = require("./../controllers/expertTipsController");
const authController = require("./../controllers/authController");
const router = express.Router();
const multer = require("multer");
router.use(authController.protect);
router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(expertTipsController.getAllExpertTips)
  .post(
    expertTipsController.uploadTipsImages,
    expertTipsController.resizeTipsImages,
    expertTipsController.createExpertTips
  );
router
  .route("/:id")
  .get(expertTipsController.getExpertTips)
  .patch(
    expertTipsController.uploadTipsImages,
    expertTipsController.resizeTipsImages,
    expertTipsController.updateExpertTips
  )
  .delete(expertTipsController.deleteExpertTips);
module.exports = router;
