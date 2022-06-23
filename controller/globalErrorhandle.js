const AppError = require('../utils/appError');

const handleCastError = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};

const handleDupKeyError = (err) => {
  // const value = err.errmsg.match;
  const message = `"${err.keyValue.name}" name already exist!Please try another`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  // console.log(err.name);
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data.${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handlejwtError = () =>
  new AppError('Invalid token error.Please log in again!', 401);

const handlejwtExpiredError = () =>
  new AppError('Your token has been expired!Please login again', 401);

const devError = (req, err, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
    //Rendered page
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      mssg: err.message,
    });
  }
};

const prodError = (req, err, res) => {
  //A) API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      //1) Log error
      console.error('ERROR💥', err);
      //Programming or other error that dont leak details to te clients
      //2) send genric message
      return res.status(500).json({
        status: 'fail',
        message: 'Something went very wrong ',
      });
    }
  } else {
    //B) RENDERED WEBSITE
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        mssg: err.message,
      });
    } else {
      //1) Log error
      console.error('ERROR💥', err);

      //Programming or other error that dont leak details to te clients
      //2) send genric message
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        mssg: 'Please try again later.',
      });
    }
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  if (process.env.NODE_ENV === 'development') {
    devError(req, err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (err.name === 'CastError') error = handleCastError(err);
    if (err.code === 11000) error = handleDupKeyError(err);
    if (err.name === 'ValidationError') error = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') error = handlejwtError();
    if (err.name === 'TokenExpiredError') error = handlejwtExpiredError();

    // console.log(err.name);
    prodError(req, error, res);
  }
};
