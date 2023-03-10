const express = require('express');

const {
  getAllTours,
  aliasTopTours,
  getTour,
  deleteTour,
  updateTour,
  createTour,
} = require('../controllers/tourController');
const router = express.Router();

// router.param('id', checkID);

// aliasing
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router
  .route('/')
  .get(getAllTours)
  .post(createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

module.exports = router;
