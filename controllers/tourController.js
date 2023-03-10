const fs = require('fs');
const Tour = require('./../models/tourModel');

const aliasTopTours = (req, res, next) => {
  (req.query.limit = '5'),
    (req.query.sort = '-ratingsAverage,price'),
    (req.query.fields = 'name,price,ratingsAverage,summary,difficulty');
  next();
};

const getAllTours = async (req, res) => {
  // the below find method will return an array
  // of all the documents and will also very nicely,
  // convert them into javascript objects.

  try {
    // req.query returns the object nicely formatted
    //  from the query string

    // to implement filtering as we should(avoiding pagination problem)

    // BUILD QUERY
    // 1.A)  Filtering
    let queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((element) => delete queryObj[element]);

    // 1.B) Advanced Filtering

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    queryObj = JSON.parse(queryStr);
    console.log(queryObj);

    let query = Tour.find(queryObj);

    //  {difficulty:"easy",durtion:{$gte:5}}

    // 2) Sorting

    if (req.query.sort) {
      const sortString = req.query.sort.split(',').join(' ');
      console.log(sortString);
      query = query.sort(sortString);
    } else {
      query = query.sort('-createdAt');
    }

    // 3) Field Limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 4.) Pagination

    // multiply by one to convert into Number
    const page = req.query.page * 1 || 1;

    const limit = req.query.limit * 100;

    const skip = (page - 1) * limit;

    // page=2&limit=50
    // skip here is the amount of results that should be skipped before querying the data
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip > numTours) {
        throw new Error('This Page does not exist');
      }
    }
    // EXECUTE QUERY

    const tours = await query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      length: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const getTour = async (req, res) => {
  try {
    // we are calling in req.param.id because in route , we setup it as
    // /api/v1/tours/:id ------> if in place of id there was x, we will do
    // req.param.x

    // m -1
    const tour = await Tour.findById(req.params.id);

    // m-2 --> FindById is shorthand for below code
    //  const tour = await Tour.findOne({_id:req.params.id})

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

const createTour = async (req, res) => {
  // two ways here for creating tour

  // M-1
  // const newTour = new Tour({});
  // notice below that we are callling save method on newTour object,
  // not on Tour model.
  // newTour.save();

  // M-2 here we call create method right no the modal itself

  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    // what sort of error you think we will be getting here, if you think
    // we create a document with document not passing the validation test,
    // that will come here as an error and above promise will be rejected
    // i.e. Tour.create and that rejected Promise will enter the catch
    // block
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const updateTour = async (req, res) => {
  try {
    // by passing the third argument as new:true, what will happen is
    // the updated tour will be returned.
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

module.exports = {
  aliasTopTours,
  getAllTours,
  getTour,
  deleteTour,
  updateTour,
  createTour,
};
