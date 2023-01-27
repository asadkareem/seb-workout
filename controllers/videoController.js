const Video = require("./../models/videoModel");
const factory = require("./handlerFactory");
const authController = require("./../controllers/authController");
const multer = require("multer");

// exports.uploadVideo = multer.single("video");

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};
exports.getAllVideos = factory.getAll(Video);
exports.getVideo = factory.getOne(Video);
exports.createVideo = factory.createOne(Video);
exports.updateVideo = factory.updateOne(Video);
exports.deleteVideo = factory.deleteOne(Video);
