const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const restoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A restaurant must have a name'],
      unique: true,
      maxLength: [35, 'A restaurant must have name less than 25 characters'],
      minLength: [3, 'A restaurant must have more than 5 characters'],
    },
    slug: String,

    ratingsAverage: {
      type: Number,
      min: [1, 'Ratings can not be less than 0'],
      max: [5, 'Ratings can not be greater than 5'],
      default: 4.5,
      set: (val) => Math.round(val * 10) / 10,
    },
    timings: {
      type: String,
      required: [true, 'A restaurant must have timings speicfied'],
    },
    price: { type: Number, required: [true, 'A restaurant must have a price'] },
    ratingsQuantity: Number,
    city: {
      type: [String],
      required: [true, 'A restaurant must have city defined'],
      default: 1,
    },
    contact: {
      type: String,
    },
    images: [String],
    description: String,
    imageCover: { type: String, required: true },
    closedOn: {
      type: [String],
    },
    specialRestro: {
      type: Boolean,
      default: false,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
      },
    ],
    owners: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Compound Indexing
restoSchema.index({ ratingsAverage: 1, startingFrom: -1 });
restoSchema.index({ slug: 1 });

// restoSchema.index({ locations: '2dsphere' });

// restoSchema.virtual('inCities').get(function () {
//   return this.city.length;
// });

//virtual populate
restoSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'restaurant',
  localField: '_id',
});

//document middleware runs before create and save
// post after save
restoSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//QUERY MIDDLEWARE for all find use /^find/
restoSchema.pre(/^find/, function (next) {
  this.find({ specialRestro: { $ne: true } });

  this.start = Date.now();
  next();
});
//post is just to see the document as thequery is already executed

//Owners referencing child referencing
restoSchema.pre(/^find/, function (next) {
  this.populate({ path: 'owners', select: '-__v -passwordChangedAt -role' });
  next();
});

restoSchema.post(/^find/, function () {
  console.log(`this query took ${Date.now() - this.start}`);
});

const Resto = mongoose.model('Resto', restoSchema);

module.exports = Resto;
