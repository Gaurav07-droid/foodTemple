const Resto = require('../models/restoModel');
const multer = require('multer');
const sharp = require('sharp');
const ApiFeatures = require('../utils/ApiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const controllerFactory = require('./controllerFactory');

const multerStorage = multer.memoryStorage();

//filter other things other than images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image!Please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadRestoImage = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeRetsoImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `resto-${req.params.id}-${Date.now()}-cover.jpeg`;

  //1.imageCover
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/resto/${req.body.imageCover}`);

  // 2.images
  req.body.images = [];

  //as there are three images each image return a promise
  await Promise.all(
    req.files.images.map(async (img, i) => {
      const filename = `resto-${req.params.id}-${Date.now()}-${i + 1}-img.jpeg`;

      await sharp(img.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/resto/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.aliasTopRestos = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage';
  req.query.fields = 'name,city,ratingsAverage,famousFor';
  next();
};

exports.getAllRestaurants = controllerFactory.getAll(Resto);

exports.getRestaurant = controllerFactory.getOne(Resto, { path: 'reviews' });

exports.createRestaurant = controllerFactory.createOne(Resto);
exports.updateRestaurant = controllerFactory.updateOne(Resto);
exports.deleteRestaurant = controllerFactory.deleteOne(Resto);

exports.getRestoStats = catchAsync(async (req, res, next) => {
  const stats = await Resto.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4 } },
    },
    {
      $group: {
        _id: '$name',
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        inCity: { $push: '$city' },
        address: { $push: '$locations.address' },
      },
    },
    // { $project: { _id: 0 } }, //0 means exclude
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getCityweightage = catchAsync(async (req, res, next) => {
  const cityName = req.params.city;

  const restaurants = await Resto.aggregate([
    { $unwind: '$city' },
    { $match: { city: cityName } },
    {
      $group: {
        _id: '$city',
        numRestos: { $sum: 1 },
        restos: { $push: '$name' },
        avgRating: { $push: '$ratingsAverage' },
      },
    },
    // { $sort: { ratingsAverage: 1 } },
    // { $project: { _id: 0 } },
    // { $limit: 1 },
  ]);

  if (restaurants.length == 0) {
    return next(new AppError('No restaurant found!Please try another city'));
  }

  res.status(200).json({
    status: 'success',
    data: restaurants,
  });
});

//current is like restaurant-distance/25/center/649646,46496/unit/km
exports.getRestoWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'please define the latitude and longitude property in proper format!',
        400
      )
    );
  }
  // console.log(distance, lat, lng, unit);

  const restos = await Resto.find({
    locations: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: restos.length,
    data: { data: restos },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.00062137 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'please define the latitude and longitude property in format',
        400
      )
    );
  }

  const distances = await Resto.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances,
    },
  });
});
