const ExpertTips = require("./../models/expertTipsModel");
const factory = require("./handlerFactory");
const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appError");
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not image! Please upload only images.", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadTipsImages = upload.fields([{ name: "images", maxCount: 1 }]);

exports.resizeTipsImages = catchAsync(async (req, res, next) => {
  if (!req.files.images) return next();
  // 2) Images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tips-${file.originalname}`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.createExpertTips = factory.createOne(ExpertTips);
exports.getAllExpertTips = factory.getAll(ExpertTips);
exports.getExpertTips = factory.getOne(ExpertTips);
exports.updateExpertTips = factory.updateOne(ExpertTips);
exports.deleteExpertTips = factory.deleteOne(ExpertTips);
