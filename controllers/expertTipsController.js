const ExpertTips = require("./../models/expertTipsModel");
const factory = require("./handlerFactory");
const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createExpertTips = factory.createOne(ExpertTips);
exports.getAllExpertTips = factory.getAll(ExpertTips);
exports.getExpertTips = factory.getOne(ExpertTips);
exports.updateExpertTips = factory.updateOne(ExpertTips);
exports.deleteExpertTips = factory.deleteOne(ExpertTips);
