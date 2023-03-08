const express = require('express');
const app = express();
const router = express.Router();

const tourRouter = require('./routes/tourRoutes');
router.get('/', (req, res, next) => {
  res.send('Hello Worldd');
});

router.post('/', (req, res) => {
  res.send('Post request on the server');
});

//Routes

app.use('/api/v1/tours', tourRouter);

module.exports = app;
