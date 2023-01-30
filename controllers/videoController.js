const Video = require("./../models/videoModel");
const factory = require("./handlerFactory");
const authController = require("./../controllers/authController");
const multer = require("multer");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appError");
const multerStorage = multer.memoryStorage();

exports.videoMiddleware = catchAsync(async (req, res, next) => {
  req.body.video = req.file.filename;
  if (!req.body.video) {
    return new AppError("you must upload the video", 404);
  }
  const doc = await Video.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});
exports.videoUpdateMiddleware = (req, res, next) => {
  if (req.file.filename) {
    req.body.video = req.file.filename;
  }
  next();
};
exports.likeVideo = catchAsync(async (req, res, next) => {
  const doc = await Video.findByIdAndUpdate(req.params.id, {
    $inc: { likes: 1 },
  });
  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});
exports.dislikeVideo = catchAsync(async (req, res, next) => {
  const doc = await Video.findByIdAndUpdate(req.params.id, {
    $inc: { dislikes: 1 },
  });
  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});
exports.createVideo = factory.createOne(Video);
exports.getAllVideos = factory.getAll(Video);
exports.getVideo = factory.getOne(Video);
exports.updateVideo = factory.updateOne(Video);
exports.deleteVideo = factory.deleteOne(Video);
