const mongoose = require('mongoose');
const Resto = require('../models/restoModel');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review must be required'],
    minLength: [3, 'Review must have more than 3 characters'],
  },

  rating: {
    type: Number,
    min: [1, 'Rating must be between 1 and 5'],
    max: [5, 'Rating must be between 1 and 5'],
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Resto',
    required: [true, 'A review must belong to a restaurant '],
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A review must belong to a user'],
  },
});

reviewSchema.set({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

//preventing multiple user to write more then one review
reviewSchema.index({ restaurant: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

reviewSchema.statics.calcAverageRating = async function (restoId) {
  const stats = await this.aggregate([
    {
      $match: { restaurant: restoId },
    },
    {
      $group: {
        _id: '$restaurant',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);

  if (stats.length > 0) {
    await Resto.findByIdAndUpdate(restoId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Resto.findByIdAndUpdate(restoId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  //this point to current review model
  this.constructor.calcAverageRating(this.restaurant);
});

//findByIdAndUpdate
//findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //this.r = review full data
  this.r = await this.findOne();
  // console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRating(this.r.restaurant);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
