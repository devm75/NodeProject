const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    unique: true,
    minlength: [3, 'A User name must be two characters or long'],
    maxLength: [30, "A User Name can't be more than 30 Characters"],
  },
  email: {
    type: String,
    required: [true, 'A user must have an Email Id'],
    unique: [true, 'Email Already Taken'],
    lowercase: true,
    validate: [validator.isEmail, 'Invalid Email Address!'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password is required field!'],
    minlength: 8,
    // making select false will insure that
    select: false,
  },
  confirmPassword: {
    type: String,
    // required: [true, 'Please Confirm your password!'],
    validate: {
      // This only works on CREATE a nd Save!!!
      validator: function(val) {
        return this.password === val;
      },
      message: "Passwords don't match",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// pre save middleware runs between
//  getting the data and saving it to the database
userSchema.pre('save', async function(next) {
  // only run this function if the password was actually modified
  // we actually only want to encrypt the password if the password field has actully been updated
  //So basically , only when the password is changed or also when it is created new,bcoz, imagine
  // if the user is only updating the email, and in that case, ofcourse ,we don't want to
  // encrypt the password again
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Now we are gonna create something called and instance method,
// It is basically a method that is gonna be available on all documents
// of a certain collection.Since these instance methods are available on
// the documents, this keyword actually points to the current document,
// But in this case,Since we have the password set select to false,
// bcoz of that this.password will not be available.hence we need to pass
// the candidate password.The goal of below function is to only return
// true or false
// candidate password is the original password, not hashed.
// but userPassword is ofcourse hashed.
// next we need to call this function in the auth controller.

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  console.log(candidatePassword, userPassword, 'Passwords Logged!');
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp;
  }

  // False means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // we are setting time to be 10 min valid for token
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
