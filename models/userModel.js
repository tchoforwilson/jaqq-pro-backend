import validator from 'validator';
import bcrypt from 'bcrypt';
import { Schema, model, plugin } from 'mongoose';
import utils from '../utilities/utils.js';

const userSchema = new Schema(
  {
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
    contact: {
      telephone: {
        type: String,
        required: [true, 'Please provide your telephone number'],
        unique: true,
        lowercase: true,
        validate: [
          validator.isMobilePhone,
          'Please provide a valid phone number',
        ],
      },
      verified: {
        type: Boolean,
        default: false,
      },
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Please tell us your date of birth!'],
    },
    photo: String,
    device: { type: String },
    verified: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_blocked: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    reports: {
      type: Number,
      default: 0,
    },
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
    code: Number,
    codeExpires: Date,
  },
  { timestamps: true }
);

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
 * @breif Method to compare if user provided code with stored code
 * @param {Number} candidateCode -> User provided code
 * @param {Number} userCode -> Stored code
 * @returns {Boolean}
 *   TRUE if code are the same
 *   FALSE  if code are not the same
 */
userSchema.methods.correctCode = function (candidateCode, userCode) {
  return candidateCode === userCode;
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

/**
 * @breif Plugin to reload schema object
 */
plugin(utils.reloadRecord);

const User = model('User', userSchema);

export default User;
