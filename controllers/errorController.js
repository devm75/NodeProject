// handling cast errors like if the id someone sends for updating field is different from
// what the values generally are.
const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  const appErr = new AppError(message, 400);
  return appErr;
};

const handleJWTError = () => {
  return new AppError('Invalid Token. Please login again!', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your Token has expired, Please Login Again!');
};

const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorForProd = (err, res) => {
  // Operational Trusted Error:send Message to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming or other unknown error, don't leak error  details
  else {
    // 1.Log Error(For helping the developers)

    console.error(err, 'Error!!');

    //2. Send Generic Message
    res.status(500).json({
      status: 'error',
      message: 'Something Went Wrong!',
    });
  }
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  console.log(value);
  const message = `Duplicate field value: X. Please use another value!`;
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  console.log(err, 'yo');
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    console.log(error);
    if (error.name == 'CastError') error = handleCastErrorDB(error);
    // below is mongodb error(when trying to create a tour
    // with same name existing and schema set to unique)
    if (error.code === 11000) {
      console.log(error.code, 'Error Code was logged!');

      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorForProd(error, res);
  }
};
