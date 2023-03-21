const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// creating a function for token, bcoz being used in signup awa login.

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
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

  const token = signToken(newUser?.id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
    message: 'User Created Successfully',
  });
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

  console.log(req.body,"yoyoy")
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
});

const resetPassword = (req, res, next) => {};

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
};
