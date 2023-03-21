const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

// creating a function for token, bcoz being used in signup awa login.

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user?.id);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

const signup = catchAsync(async (req, res, next) => {
  // Actually below here are directly setting body from request object, to the
  // create function, not right way , what if some randome user sets itself as
  // an admin.
  // const newUser = await User.create(req.body);

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // id below is the payload that we want to put into our jwt
  createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  // 1.Check if email and password exists.
  //2. Check if user exists && password is correct.
  // If everything is ok, send token to client.
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please Provide Email and Password!', 404));
  }

  // const user = User.findOne({ email: email });
  // Simplifying further
  const user = await User.findOne({ email }).select('+password');
  //   const correct = await user.correctPassword(password, user.password);

  // if (!user || !correct)
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // If everything ok, send token to the client
  const token = signToken(user?.id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

const protect = catchAsync(async (req, res, next) => {
  // 1.Getting Token and checking if its there.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please Login to get Access', 401)
    );
  }
  // 2.Verifying Token.Below we are gonna promisify this below function
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  // 3. Check if user Still Exists.

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The User belonging to this token no longer exists!', 401)
    );
  }
  // 4. Check if the user changed password, after the  JWT was isued
  // To implement this function , we will actually create and instance method,that,
  // will be available on all the documents,

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User Recently Changed Password! Please Login Again')
    );
  }

  // Grant Access to the protected Route and also put current user on req
  // will be needed further in middleware
  req.user = currentUser;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

const forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get User Based on Posted Email.

  console.log(req.body, 'yoyoy');
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }

  // 2. Generate the random reset token.

  const resetToken = user.createPasswordResetToken();
  // here we are saving the user in db, without filling the required marked fields, it
  //  requires us to have this mentioned to ignore the validations
  await user.save({ validateBeforeSave: false });

  // 3. Send it to user's email.
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request 
  with your new password and passwordConfirm to:${resetURL}.\n If you 
  didn't forget your password, please ignore this emaiil!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password reset Token (valid for 10 minutes)',
      message,
    });
    res.status(200).json({ status: 'success', message: 'Token sent to email' });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email, try again later!',
        500
      )
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on Token.
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // At the same time we check for the user and also check
  // whether the token has expired or not
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2. If token has not expired, and there is user,set the new password.

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // we are doing save bcoz we want to run middlewares for
  await user.save();

  // 3.  Update changedPasswordAt property for the current user.

  // 4. Log the user in, send JWT
  const token = signToken(user?.id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

const updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get user from collection.

  // const hashedPassword = bycrypt.

  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current Password is wrong!', 401));
  }

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 2. Check if posted current password is correct.
  // 3. If so , update password.
  // 4. log user in , send JWT.

  createSendToken(user, 200, res);
});

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
};
