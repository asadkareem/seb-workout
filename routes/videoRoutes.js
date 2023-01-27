const express = require("express");
const videoController = require("./../controllers/videoController");
const authController = require("./../controllers/authController");
const router = express.Router();

router.use(authController.protect);
router.use(authController.restrictTo("admin"));
router
  .route("/")
  .get(videoController.getAllVideos)
  .post(videoController.uploadVideo, videoController.createVideo);

router
  .route("/:id")
  .get(videoController.getVideo)
  .patch(videoController.updateVideo)
  .delete(videoController.deleteVideo);

module.exports = router;
