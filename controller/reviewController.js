const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const controllerFactory = require('./controllerFactory');
const Resto = require('../models/restoModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');

exports.setRestoIds = (req, res, next) => {
  if (!req.body.restaurant) req.body.restaurant = req.params.restoId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReview = controllerFactory.createOne(Review);
exports.getAllReviews = controllerFactory.getAll(Review);
exports.getReview = controllerFactory.getOne(Review);

exports.deleteReview = controllerFactory.deleteOne(Review);
exports.updateReview = controllerFactory.updateOne(Review);

exports.getRestaurant = (req, res, next) => {
  console.log(req.originalUrl);
  next();
};

exports.checkMyReview = async (req, res, next) => {
  const resto = await Resto.findOne({ slug: req.originalUrl.slug });

  if (
    !(await Review.findOne({ user: req.user.id })) &&
    !(await Review.findOne({ restaurant: resto.id }))
  )
    next(new AppError('Review a restaurant first!', 404));

  const yourReview = await Review.findOne({ user: req.user.id });
  // console.log(yourReview);
  req.params.id = yourReview._id;
  next();
};

exports.checkRestoBooked = async (req, res, next) => {
  const { restoId } = req.params;

  const booking = await Booking.find({ user: req.user.id });
  const restos = booking.map((el) => el.restaurant._id);

  console.log(restos);
  const bookedResto = restos.filter((el) => el == restoId);
  console.log(bookedResto.length === 0);
  // console.log(restos.forEach((restoId) === false);

  if (bookedResto.length === 0)
    return next(
      new AppError('You can only review a restaurant you booked!', 401)
    );

  next();
};
