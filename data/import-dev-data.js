const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Resto = require('./../models/restoModel');

dotenv.config({ path: './config.env' });

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
    // console.log('connected to database');
  });

const restaurants = JSON.parse(
  fs.readFileSync(`${__dirname}/restaurant.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Resto.create(restaurants);
    console.log('data successfully loaded');
  } catch (err) {
    console.log(err.message);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Resto.deleteMany();
    console.log('data deleted successfully');
  } catch (err) {
    console.log(err.message);
  }
  process.exit();
};

// console.log(process.argv[1]);
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
