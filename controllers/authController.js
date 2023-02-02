const User = require("./../models/userModel");
const { promisify } = require("util");
const crypto = require("crypto");
const catchAsync = require("./../utils/catchAsync");
const bancode = require("./../utils/bancode");
const sendEmail = require("./../utils/email");
const AppError = require("./../utils/appError");
const jwt = require("jsonwebtoken");
exports.bancode = (req, res, next) => {
  req.body.bancode = bancode(4);
  next();
};
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  user.bancode = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const bancode = req.body.bancode;
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    bancode: req.body.bancode,
  });
  const message = `Hi there! 
I hope you're having a great day! Below I have provided a band code for you to use to 
enter our Super Exercise Band App! Thank you for your product purchase and we hope 
you choose to do business with us in the future! 
Band Code: ${bancode}
Instructions: 
1. Download Super Exercise Band App 
2. Create credentials (And save them somewhere) 
3. Add Band Code 
4. You're in! 
Please email us at support@ca-lifestyles.com with any questions or concerns, we would
be happy to address them. 
Best, 
Chris Flora 
Customer Service - support@ca-lifestyles.com
Super Exercise Band USA `;

  // const message = `We are sending the bandcode ${bancode} that you will use for the login`;
  try {
    await sendEmail({
      email: newUser.email,
      subject: `Dear ${newUser.name} here is your Bandcode for the login`,
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Bancode sent to email!",
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

exports.login = catchAsync(async (req, res, next) => {
  const { email, password, bancode } = req.body;

  // 1) Check if email and password exist
  if (!email || !password || !bancode) {
    return next(
      new AppError("Please provide email and password and bancode!", 400)
    );
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email: email, bancode: bancode }).select(
    "+password "
  );
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password or bancode", 401));
  }
  createSendToken(user, 200, res);
});
// 2) Generate the random reset token
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Hi there! 
I hope you're having a great day! Below I have provided the requested password reset. 
Please click the link below
Reset link: 
Instructions: 
1. Click the link. ${resetURL}
2. Type in new password
3. Confirm new password
Please email us at support@ca-lifestyles.com with any questions or concerns, we would
be happy to address them. 
Best, 
Chris Flora 
Customer Service - support@ca-lifestyles.com
Super Exercise Band USA 
superexerciseband.com`;

  // const message = `please click the link this: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }
  if (!currentUser.active) {
    return next(
      new AppError("The user belonging to this token is no longer active", 401)
    );
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};
