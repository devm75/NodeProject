const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'A tour Must have a name'],
      maxlength: [40, 'A tour name must have less or equal than 40 Characters'],
      minlength: [10, 'A tour nmae must have more or equal than 10 Characters'],
      validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },

    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      // enum exists only for strings.
      enum: {
        values: ['easy', 'difficult', 'medium'],
        message: 'Difficulty is either: easy,medium, difficult ',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      // apart from numbers, min and max will also work for dates.
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour Must have a price'],
    },
    priceDiscount: {
      type: Number,

      // Now there is a caveat:Inside a validator function, this keyword
      // is only gonna point to the current document when we are
      // creating a new document.So below function is not gonna
      // run on update
      validate: {
        validator: function(val) {
          console.log(this);
          return this.price > val;
        },
        // message also has access to the value, little weird, the way it is
        // available , but that is from mongoose, nothing with js.
        message: `Discount Price ({VALUE}) Should be below regular price}`,
      },
    },
    summary: {
      type: String,
      // trim will remove all the white spaces in the end
      // and beginning of the string
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // making it select false here, will not return it any query
      select: false,
    },
    startDates: [Date],

    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  { toJSON: { virtuals: true } },
  { toObject: { virtuals: true } }
);

// regular function used here bcoz arrow function
//  does not get its own this keyword, 'this' keyword here points
//  to the  document.
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// mongoose middleware -->> DOCUMENT MIDDLEWARE runs
// before.save()  and.create()

// we can have multiple pre and post middlewares for the same hook.

tourSchema.pre('save', function(next) {
  // this here below will refrer to the currently processed document
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre('save', function(next) {
  console.log('will save document');
  next();
});

tourSchema.post('save', function(doc, next) {
  // console.log(doc);
  next();
});

//  QUERY MIDDLEWARE

// this keyword here will point to the query and not to docuemnt like for doc middleware

tourSchema.pre('find', function(next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// AGGREGATION MIDDLEWARE (we want the stuff to happen before
// actual aggregation begins to happen.)
// this keyword here gonna point to aggregation object
// we want to hide secret Tours,
tourSchema.pre('aggregate', function(next) {
  console.log(
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
  );
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
