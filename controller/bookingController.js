const stripe = require('stripe')(process.env.Stripe_secret_key);
const catchAsync = require('../utils/catchAsync');
const Booking = require('../models/bookingModel');
const Resto = require('../models/restoModel');
const controllerFactory = require('../controller/controllerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //get currently resto booked
  const resto = await Resto.findById(req.params.restoId);

  //create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?restaurant=${
      req.params.restoId
    }&user=${req.user.id}&price=${resto.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/restaurant/${resto.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.restoId,
    line_items: [
      {
        name: `${resto.name} `,
        description: resto.summary,
        images: [
          'https://media-cdn.tripadvisor.com/media/photo-s/12/12/08/8d/venison.jpg',
        ],
        amount: resto.price * 100,
        currency: 'INR',
        quantity: 1,
      },
    ],
  });

  //create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = async (req, res, next) => {
  const { restaurant, user, price } = req.query;

  if (!restaurant && !user && !price) return next();

  await Booking.create({
    restaurant,
    user,
    price,
  });

  res.redirect(req.originalUrl.split('?')[0]);

  next();
};

exports.getAllBookings = controllerFactory.getAll(Booking);
exports.getBooking = controllerFactory.getOne(Booking);
exports.updateBooking = controllerFactory.updateOne(Booking);
exports.deletebooking = controllerFactory.deleteOne(Booking);
exports.createBooking = controllerFactory.createOne(Booking);
