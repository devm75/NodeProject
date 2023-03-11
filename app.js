const express = require('express');
const app = express('./utils/appError');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');

// 1.MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Routes

app.use('/api/v1/tours', tourRouter);
app.use('api/v1/users', userRouter);

//  if the route doesn't match the above metioned two routes,
// what we will be left with is below matching

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // this argument string to Erro will be err.message
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  // If the next middleware receives an input, express by default will know it is an error
  // so again if we pass anything into next,it will assume that it is an error,and then,
  // it will skip all the other middlewares in the middleware stack and sent the error that
  // we passed in to our global error handling middleware(just below), it will then
  // ofcourse be executed

  // next(err);
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// express error handler global implementation

app.use(globalErrorHandler);

module.exports = app;
