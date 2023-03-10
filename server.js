const mongoose = require('mongoose');
const dotenv = require('dotenv');
// we intentionally place the config before initializing process,
//  so that the process can access it.
dotenv.config({ path: './config.env' });
const app = require('./app');

// this line below will read environemnt variables from the
// config.env file and save them in nodejs environment varialbes

// simply replacing password stirng with our password
// console.log(process.env.DATABASE);
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server Listening on ${port} `);
});
