import { Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import pointSchema from '../schemas/point.schema.js';
import eUserRole from '../utilities/enums/e.user-role.js';
import eGender from '../utilities/enums/e.gender.js';

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: [true, 'Please provide your first name!'],
    },
    lastname: {
      type: String,
      required: [true, 'Please provide your last name!'],
    },
    gender: {
      type: String,
      enum: {
        values: [...Object.values(eGender)],
        message: `Gender must either be 'male' or 'female'`,
      },
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
      maxlength: [13, 'A phone number must be 13 digits'],
      unique: true,
    },
    birthday: {
      type: Date,
      default: Date.now(),
    },
    photo: String,
    phoneValidated: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: [...Object.values(eUserRole)],
      default: eUserRole.USER,
    },
    services: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Service',
      },
    ],
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.666666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    lastVerificationSMSCode: Number,
    smsCodeExpiresAt: Date,
    smsCodeSent: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    online: { type: Boolean, default: true },
    connectionId: String,
    lastConnection: Date,
    pushToken: String,
    location: pointSchema,
    currentLocation: pointSchema,
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
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });
userSchema.index({ currentLocation: '2dsphere' });

/**
 * @breif Fetch user services
 */
userSchema.pre(/^find/, function () {
  this.populate({
    path: 'services',
    select: '_id title',
  });
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
 * @breif Method to compare if user provided sms code with stored sms code
 * @param {Number} candidateSMSCode -> User provided code
 * @param {Number} userSMSCode -> Stored code
 * @returns {Boolean}
 *   TRUE if code are the same
 *   FALSE  if code are not the same
 */
userSchema.methods.correctSMSCode = function (candidateSMSCode, userSMSCode) {
  return candidateSMSCode === userSMSCode;
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
