const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");
const sendEmail = require("./../utils/email");

exports.createUser = catchAsync(async (req, res, next) => {
  const password = req.body.password;
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    bancode: req.body.bancode,
  });
  const message = `We are  sending the the bancode ${newUser.bancode} and password ${password} that you will use for the login`;
  try {
    await sendEmail({
      email: newUser.email,
      subject: `Dear ${newUser.name} here is your bancode for the login`,
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Bancode sent and password sent to email!",
    });
  } catch (err) {
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
  res.status(200).json({
    status: "success",
    data: {
      newUser,
    },
  });
});
exports.deactivate = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { active: false });

  res.status(200).json({
    status: "success",
    message: "user successfully deactivate",
  });
});
exports.activate = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { active: true });
  res.status(200).json({
    status: "success",
    message: "user successfully activate",
  });
});
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
