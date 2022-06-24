const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const restoRouter = require('./routes/restaurantRoute');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controller/bookingController');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/globalErrorhandle');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//MIDDLEWARES
//limitting request per hour with same IP
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: 'Too many request from this IP.Please try again after an hour!',
});

app.use('/api', limiter);

//call this before the body parser
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

//body parser,reading data from the req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

//Access-Control-Allow-Origin headers to all
app.use(cors());
app.options('*', cors());
// app.options('/api/v1/restaurant/:id', cors());

//set security http headers
// app.use(helmet());

//data sanitization snosql mongodb  injection email can be changed
app.use(mongoSanitize());

//data sanitization against xss //change html to another type
app.use(xss());

//headers parametre pollution i.e two sort setc
app.use(
  hpp({
    whitelist: [
      'name',
      'closedOn',
      'ratingsAverage',
      'ratingsQuantity',
      'famousFor',
      'city',
    ],
  })
);

app.use(compression());

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//reading data from req.body
// app.use(express.json({ limit: '10kb' }));

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

//ROUTES
app.use('/', viewRouter);
app.use('/api/v1/restaurants', restoRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
// app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
