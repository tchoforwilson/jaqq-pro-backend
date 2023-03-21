'use strict';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide your first name!'],
  },
  lastName: {
    type: String,
    required: [true, 'Please provide your last name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number'],
    unique: true,
    lowercase: true,
    validate: [validator.isMobilePhone, 'Please provide a valid phone number'],
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please tell us your date of birth!'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minLength: [
      8,
      'Password too short, password should have minimum 8 characters',
    ],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
});

/**
 * @breif middleware to hash user password before save
 */
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

/**
 * @breif Method to compare user provide password with user stored password
 * @param {String} candidatePassword -> User provided password
 * @param {String} userPassword -> User stored password
 * @returns Boolean
 *  TRUE if passwords are the same,
 *  FALSe if passwords are not the same
 */
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

/**
 * @breif middleware to check for password change
 */
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

/**
 * @breif middleware to check for password change time
 * @details check if the password recently change after the user login
 * @param {Date} -> JWTTimestamp -> The JWT time is token
 */
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

const User = model('User', userSchema);

export default User;
