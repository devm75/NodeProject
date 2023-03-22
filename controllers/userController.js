const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // send Response
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const updateMe = catchAsync(async (req, res, next) => {
  // 1. Create Error if user posts password data.
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This Route is not for password Updates', 400));
  }

  // 2. Update User Document.
  // since here we are not dealing with passwords and so, we can
  // use findByIdAndUpdate

  const user = await User.findByIdAndUpdate(req.user.id);

  res.status(200).json({
    status: 'success',
  });
});
module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
};
