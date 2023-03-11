// we want our custom error class to inherit all methods of
// default error class

class AppError extends Error {
  // Remember the constructor is called each time we create,
  // a new object out of this class, whenver we extend a class
  // we call super to extend the parent class contstructor,
  // we pass in the message, bcoz message is the only thing
  // that the built in Error accepts
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // all the errors that we will create using this class
    // will all be operational Errors.
    this.operational = true;

    // this last line is not clear , try to understand it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
