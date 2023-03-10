const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.././config.env' });
const Tour = require('./../../models/tourModel');
// this line below will read environemnt variables from the
// config.env file and save them in nodejs environment varialbes

// simply replacing password stirng with our password
// console.log(process.env.DATABASE);
// console.log(process.env)
// return;
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// Into the below connect  method , we need to pass our database
// connection string, followed by an object with many options(these
// options are here to deal with some deprecation warnings)

// This connect method is gonna return a promise.

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((connection) => {
    // console.log(connection.connections);
    console.log('DB Connection Successfull!');
  })
  .catch((err) => console.log(err, 'Error while connecting to the database'));

// Read Json File
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// Import Data Into DB
const importData = async () => {
  try {
    console.log(tours, 'tours Read From File');
    await Tour.create(tours);
    console.log('Data Successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete All Data From DB

const deleteData = async () => {
  console.log(' ran me!');
  try {
    await Tour.deleteMany();
    console.log('Data Deleted SuccessFully');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
}

if (process.argv[2] === '---delete') {
  deleteData();
}

console.log(process.argv[2]);
