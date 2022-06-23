const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(err);
  console.log('unhandled expression💥..shutting down');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');
// console.log(process.env);

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database connected succesfully');
  });

//Importing data to databse
// importData();
//deleteing the data
// deleteData();

//SERVER
const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`server is running ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err);
  console.log('unhandled rejection💥....Shutting down');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  consoel.log('Sigterm recieved.Shutting down gracefully...💥');
  server.close(() => {
    console.log('process terminated....');
  });
});
