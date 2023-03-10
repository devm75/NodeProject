const fs = require('fs');
const Tour = require('./../models/tourModel');

const getAllTours = async (req, res) => {
  // the below find method will return an array
  // of all the documents and will also very nicely,
  // convert them into javascript objects.

  try {
    const tours = await Tour.find();

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
  getAllTours,
  getTour,
  deleteTour,
  updateTour,
  createTour,
};
