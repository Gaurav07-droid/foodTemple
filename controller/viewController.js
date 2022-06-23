const catchAsync = require('../utils/catchAsync');
const Resto = require('../models/restoModel');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');

exports.getOverview = catchAsync(async (req, res) => {
  //Find all the data
  const restos = await Resto.find();

  res.status(200).render('overview', {
    restos,
    title: 'All Restaurants',
  });
});

exports.getRestaurant = catchAsync(async (req, res, next) => {
  //get the data for the requested tour(including reviews and owners)

  const resto = await Resto.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });

  // if (!resto) next(new AppError(' No restaurant found !Try again', 404));
  //Build template
  //Render template
  res.status(200).render('restaurant', {
    resto,
    title: resto.name,
  });
});

exports.getLoginForm = (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login to your account',
  });
};

exports.geMe = (req, res, next) => {
  res.status(200).render('account', {
    title: 'My account',
  });
};

exports.signUp = (req, res, next) => {
  res.status(200).render('signup', {
    title: 'create your account',
  });
};

exports.getRestoBooked = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id });

    const restoIds = bookings.map((el) => el.restaurant);
    const restos = await Resto.find({ _id: { $in: restoIds } });

    //Render not found errors

    if (bookings.length === 0 && restos.length === 0)
      res.status(404).render('notFound', {
        title: 'Not Found',
        type: 'Bookings',
      });

    res.status(200).render('bookedResto', {
      title: 'My bookings',
      restos,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getMyReviews = async (req, res, next) => {
  const reviews = await Review.find({ user: req.user.id }).populate(
    'restaurant'
  );

  //Render not found errors
  if (reviews.length === 0)
    res.status(404).render('notFound', {
      title: 'Not Found',
      type: 'Reviews',
    });

  res.status(200).render('myReviews', {
    title: 'my reviews',
    reviews,
  });
};

exports.manageUsers = async (req, res, next) => {
  const users = await User.find({ _id: { $ne: req.user.id } });

  if (!users) return next(new AppError('sorry!no user found', 404));

  res.status(200).render('manageUsers', {
    title: 'Manage users',
    users,
  });
};

exports.manageRestaurant = async (req, res, next) => {
  const restos = await Resto.find();

  if (!restos) return next(new AppError('sorry!no user found', 404));

  res.status(200).render('manageRestaurant', {
    title: 'Manage restaurant',
    restos,
  });
};
