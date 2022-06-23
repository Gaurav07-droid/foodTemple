const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.ObjectId,
    required: [true, 'A booking must belong to a restaurant.'],
    ref: 'Resto',
  },

  user: {
    type: mongoose.Schema.ObjectId,
    required: [true, 'A booking must belong to a user.'],
    ref: 'User',
  },

  price: {
    type: Number,
    required: [true, 'Booking must have price'],
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({ path: 'restaurant', select: 'name' });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
