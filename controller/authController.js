const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = function (user, statusCode, res) {
  const token = signToken(user._id);

  if (process.env === 'production') cookieOption.secure = true;

  //removing password
  res.password = undefined;

  //sending cookie
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXP + 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  });

  //sending token
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  //check email and password exists
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  //check if user exists and password is correct

  const user = await User.findOne({ email }).select('+password');
  // const correct = await user.correctPassword(password, user.password);

  // through bcrypt.compare in model by ceating instance method
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorect email or password!', 401));
  }

  createSendToken(user, 200, res);
});

// exports.logOut = (req, res, next) => {
//   res.cookie('jwt', 'Jsonwebtoken', {
//     expires: Date.now() + 10 * 1000,
//     httpOnly: true,
//   });

//   res.status(200).json({
//     status: 'success',
//   });
// };

exports.protect = catchAsync(async (req, res, next) => {
  //check if token already there exist or not
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]; //taking bearer token out
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError(
        'Your are not logged In! please logged in to get access',
        401
      )
    );
  }

  //verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  //check if user still exist not deleted after login
  const currentUser = await User.findById(decoded.id);
  // console.log(freshUser);

  if (!currentUser) {
    return next(
      new AppError('The user beloging to this token is no longer exists!', 401)
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed the password! Please login again',
        401
      )
    );
  }

  //ACCESS GRANTED TO THE PROTECTED ROUTES
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

//Only for rendered pages,so there will be no0 errors
exports.isLoggedIn = async (req, res, next) => {
  //check if token already there exist or not
  if (req.cookies.jwt) {
    try {
      token = req.cookies.jwt;

      //verify the token
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );
      // console.log(decoded);

      //check if user still exist not deleted after login
      const currentUser = await User.findById(decoded.id);
      // console.log(freshUser);

      if (!currentUser) {
        return next();
      }

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      //ACCESS GRANTED TO THE PROTECTED ROUTES
      req.user = currentUser;
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.logOut = (req, res, next) => {
  res.cookie('jwt', 'Expires', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    message: 'success',
  });
};

exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    // console.log(req.user.role);
    //roles['user','owner','admin']
    if (!roles.includes(req.user.role)) {
      //req.user coming from above middleware
      return next(
        new AppError('You donot have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //GET user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('User not found with that email address.', 404));
  }
  //generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //send it to the email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordToken();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to the email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending email.Please try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //Get the user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // console.log(hashedToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresIn: { $gt: Date.now() },
  });
  //check token not expired and there is user then take the token
  if (!user) {
    return next(new AppError('Token is invalid or expired.', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresIn = undefined;

  await user.save();
  //update changedPasswordAt property for the user
  //log the user in,send jwt
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // req.user coming from protect rourtes
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError('Current password is incorrect!Please try again', 401)
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});
