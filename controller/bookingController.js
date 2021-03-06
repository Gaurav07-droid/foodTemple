const stripe = require('stripe')(process.env.Stripe_secret_key);
const catchAsync = require('../utils/catchAsync');
const Booking = require('../models/bookingModel');
const Resto = require('../models/restoModel');
const User = require('../models/userModel');

const controllerFactory = require('../controller/controllerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //get currently resto booked
  const resto = await Resto.findById(req.params.restoId);

  //create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get('host')}/?restaurant=${
    //   req.params.restoId
    // }&user=${req.user.id}&price=${resto.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-bookings`,
    cancel_url: `${req.protocol}://${req.get('host')}/restaurant/${resto.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.restoId,
    line_items: [
      {
        name: `${resto.name} `,
        description: resto.summary,
        images: [
          `${req.protocol}://${req.get('host')}/resto/${resto.imageCover}`,
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

// exports.createBookingCheckout = async (req, res, next) => {
//   const { restaurant, user, price } = req.query;

//   if (!restaurant && !user && !price) return next();

//   await Booking.create({
//     restaurant,
//     user,
//     price,
//   });

//   res.redirect(req.originalUrl.split('?')[0]);

//   next();
// };

const createBookingDatabse = async (session) => {
  const restaurant = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.amount_total / 100;

  return await Booking.create({
    restaurant,
    user,
    price,
  });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.Stripe_webhook_secret
    );
  } catch (err) {
    return res.status(400).send(`webhook error: ${err.message}`);
    // console.log(err);
  }

  if (event.type === 'checkout.session.completed')
    createBookingDatabse(event.data.object);

  res.status(200).json({ received: true });
};

exports.getAllBookings = controllerFactory.getAll(Booking);
exports.getBooking = controllerFactory.getOne(Booking);
exports.updateBooking = controllerFactory.updateOne(Booking);
exports.deletebooking = controllerFactory.deleteOne(Booking);
exports.createBooking = controllerFactory.createOne(Booking);
