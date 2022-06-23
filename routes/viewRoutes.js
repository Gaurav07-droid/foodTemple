const express = require('express');
const bookingController = require('../controller/bookingController');
const viewController = require('../controller/viewController');
const authController = require('../controller/authController');

const router = express.Router();

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);
router.get(
  '/restaurant/:slug',
  authController.isLoggedIn,
  viewController.getRestaurant
);

router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/signup', viewController.signUp);
router.get('/me', authController.protect, viewController.geMe);
router.get(
  '/my-bookings',
  authController.protect,
  viewController.getRestoBooked
);

router.get('/my-reviews', authController.protect, viewController.getMyReviews);
router.get(
  '/manage-users',
  authController.protect,
  authController.restrictTo('admin'),
  viewController.manageUsers
);

router.get(
  '/manage-restaurant',
  authController.protect,
  authController.restrictTo('admin'),
  viewController.manageRestaurant
);

module.exports = router;
