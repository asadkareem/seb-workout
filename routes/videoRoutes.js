const express = require("express");
const videoController = require("./../controllers/videoController");
const authController = require("./../controllers/authController");
const multer = require("multer");
const router = express.Router();

router.route("/:id/like").patch(videoController.likeVideo);
router.route("/:id/dislike").patch(videoController.dislikeVideo);

router.use(authController.protect);
router.use(authController.restrictTo("admin"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/videos");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
router
  .route("/")
  .get(videoController.getAllVideos)
  .post(upload.single("video"), videoController.videoMiddleware);
router
  .route("/:id")
  .get(videoController.getVideo)
  .patch(
    upload.single("video"),
    videoController.videoUpdateMiddleware,
    videoController.updateVideo
  )
  .delete(videoController.deleteVideo);

module.exports = router;
