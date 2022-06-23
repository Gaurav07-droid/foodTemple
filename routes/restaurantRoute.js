const express = require('express');
const restoController = require('../controller/restoController');
const authController = require('../controller/authController');
const reviewRouter = require('./reviewRoutes');

//ROUTE HANDLERS

const router = express.Router();

router.use('/:restoId/reviews', reviewRouter);

router
  .route('/topRatedRestaurants')
  .get(restoController.aliasTopRestos, restoController.getAllRestaurants);

router.get('/resto-stats', restoController.getRestoStats);

router
  .route('/restos-within/:distance/center/:latlng/unit/:unit')
  .get(restoController.getRestoWithin);
//restaurant-distance?distance=25?center=15452,-04562?unit=km/mi
//current is like restaurant-distance/25/center/649646,46496/unit/km
router.route('/distances/:latlng/unit/:unit').get(restoController.getDistances);

router
  .route('/getcities-data/:city')
  .get(
    authController.restrictTo('admin', 'user'),
    restoController.getCityweightage
  );

router
  .route('/')
  .get(restoController.getAllRestaurants)
  .post(
    authController.protect,
    authController.restrictTo('owner', 'admin'),
    restoController.createRestaurant
  );
router.use(authController.protect);

router
  .route('/:id')
  .get(restoController.getRestaurant)
  .patch(
    authController.restrictTo('admin'),
    restoController.uploadRestoImage,
    restoController.resizeRetsoImages,
    restoController.updateRestaurant
  )
  .delete(
    authController.restrictTo('admin', 'owner'),
    restoController.deleteRestaurant
  );

module.exports = router;
