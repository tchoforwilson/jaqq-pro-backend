import validator from 'validator';
import bcrypt from 'bcrypt';
import { Schema, model, plugin } from 'mongoose';
import utils from '../utilities/utils.js';

const providerSchema = new Schema({
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
      required: [true, 'Please provide your phone number'],
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
});

/**
 * @breif middleware to hash Provider password before save
 */
providerSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

/**
 * @breif Method to compare provider given password with Provider stored password
 * @param {String} candidatePassword -> Provider given password
 * @param {String} ProviderPassword -> Provider stored password
 * @returns Boolean
 *  TRUE if passwords are the same,
 *  FALSe if passwords are not the same
 */
providerSchema.methods.correctPassword = async function (
  candidatePassword,
  providerPassword
) {
  return await bcrypt.compare(candidatePassword, providerPassword);
};

/**
 * @breif Method to compare if provider provided code with stored code
 * @param {Number} candidateCode -> User provided code
 * @param {Number} providerCode -> Stored code
 * @returns {Boolean}
 *   TRUE if code are the same
 *   FALSE  if code are not the same
 */
providerSchema.methods.correctCode = function (candidateCode, providerCode) {
  return candidateCode === providerCode;
};

/**
 * @breif middleware to check if provider password changed
 */
providerSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

/**
 * @breif middleware to check for password change time
 * @details check if the password recently change after the Provider login
 * @param {Date} -> JWTTimestamp -> The JWT time is token
 */
providerSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
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

const Provider = model('Provider', providerSchema);

export default Provider;
