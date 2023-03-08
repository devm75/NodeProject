const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

const getAllTours = (req, res) => {
  res.status(200).json({
    statsu: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });
};

module.exports = { getAllTours };
