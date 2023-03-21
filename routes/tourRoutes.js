const express = require('express');

const {
  getAllTours,
  aliasTopTours,
  getTour,
  deleteTour,
  updateTour,
  createTour,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');
const router = express.Router();

// router.param('id', checkID);

// aliasing
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

// Before running getAllTours Handler here, we need
// to have a check in place to see whether the user
// is logged in or not.
// we are gonna do that by running a middleware function
// before we run the actual code, and this middleware is either gonna
// return error (if not authorised) or gonna call the next middleware
router
  .route('/')
  .get(protect,getAllTours)
  .post(createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  // here before deleting , we  need to check for three things,
  // whether the user is authenticated and authorised as well,
  // so for autherization we are dealing with userroles here.
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
