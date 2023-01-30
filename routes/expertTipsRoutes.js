const express = require("express");
const expertTipsController = require("./../controllers/expertTipsController");
const authController = require("./../controllers/authController");
const router = express.Router();
const multer = require("multer");
router.use(authController.protect);
router.use(authController.restrictTo("admin"));

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

router
  .route("/")
  .get(expertTipsController.getAllExpertTips)
  .post(expertTipsController.createExpertTips);
router
  .route("/:id")
  .get(expertTipsController.getExpertTips)
  .patch(expertTipsController.updateExpertTips)
  .delete(expertTipsController.deleteExpertTips);
module.exports = router;
