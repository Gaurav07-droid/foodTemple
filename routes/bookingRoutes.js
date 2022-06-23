const express = require('express');
const bookingController = require('../controller/bookingController');
const authController = require('../controller/authController');

const router = express.Router();

router.get(
  '/checkout-session/:restoId',
  authController.protect,
  bookingController.getCheckoutSession
);

router.use(authController.protect);

router
  .route('/')
  .get(
    authController.restrictTo('admin', 'owner'),
    bookingController.getAllBookings
  )
  .post(
    authController.restrictTo('admin', 'owner'),
    bookingController.createBooking
  );

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(authController.restrictTo('admin'), bookingController.updateBooking)
  .delete(bookingController.deletebooking, authController.restrictTo('admin'));

module.exports = router;
