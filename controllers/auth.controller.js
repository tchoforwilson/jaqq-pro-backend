import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import Randomstring from 'randomstring';
import moment from 'moment';

import User from '../models/user.model.js';
import sendMessage from '../utilities/sms.js';
import AppError from '../utilities/appError.js';
import catchAsync from '../utilities/catchAsync.js';
import { filterObj } from '../utilities/utils.js';
import config from '../configurations/config.js';

/**
 * @breif Generate user jwt token from user object
 * @param {Object} user -> user (user or provider) object
 * @returns JWT
 */
const signToken = (user) =>
  jwt.sign({ user }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

/**
 * @breif Create and send user(user or provider) login token with response status code
 * @param {Object} user -> Stored user object
 * @param {Number} statusCode -> Response status code
 * @param {Response} res -> Response object
 */
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + config.jwt.cookieExpires * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // remove password in output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

/**
 * @breif Generate and send user phone authentication sms
 * @param {Object} user -> Current user to which sms code is sent to phone
 * @returns {Function}
 */
const generateAndSendSMSCode = (user) =>
  catchAsync(async (next) => {
    // 1. Generate random sms code
    let code = Randomstring.generate({
      length: 5,
      charset: 'numeric',
    });
    let codeExpires = new Date(Date.now() + 20 * 60 * 1000);

    // 2. Build message
    const message = `Your Jaqq authentication code is ${code}.\nSubmit this code to verify your phone number`;

    // 3. Send message to user
    try {
      await sendMessage(message, `+237${user.phone}`); // TODO: This dialer code shouldn't be appended
    } catch (err) {
      // 4. Reset values if error in sending sms
      code = null;
      codeExpires = null;
      return next(
        new AppError('Invalid phone or unable to validate phone number', 500)
      );
    }

    // 5. Save generated code and expiry date
    await User.findByIdAndUpdate(user.id, {
      lastVerificationSMSCode: code,
      smsCodeExpiresAt: codeExpires,
    }); // ? Look for a better way to save this
  });

/**
 * @breif Resend user verification code
 * @param {Object} user
 * @returns {Function}
 */
const resendSMSCode = catchAsync(async (req, res, next) => {
  // 1. Make sure user is not verified before resend code
  if (req.user.phoneValidated) {
    return next(
      new AppError(
        'Invalid request, your are phone number is already authenticated',
        400
      )
    );
  }

  // 2. Generate and send code
  generateAndSendSMSCode(req.user);

  // 3. Send response
  res.status(200).json({ status: 'success', data: null });
});

/**
 * @breif register a new user (user/provider) in the database
 * @returns {Function}
 */
const register = catchAsync(async (req, res, next) => {
  // 1. Get filtered value
  const filteredBody = filterObj(
    req.body,
    'firstName',
    'lastName',
    'email',
    'phone',
    'password',
    'passwordConfirm',
    'device',
    'birthday'
  );
  // filter values
  moment(filteredBody.birthday, 'DD/MM/YYYY HH:mm:ss').toISOString(); // set date of birth to ISOS string

  // 2. Create new user (user or provider)
  const newUser = await User.create(filteredBody);

  // 3. Generate and send verification sms
  generateAndSendSMSCode(newUser);

  // 4. Send response
  createSendToken(newUser, 201, req, res);
});

/**
 * @breif Login a user into the system, this is done after user provides
 * email or contact with password, if the email or contact and password provided
 * as the same as the one stored in the database, then the user is login
 * @returns {Function}
 */
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if contact and password exist
  if (!phone || !password) {
    return next(new AppError('Please provide email or phone number!', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({
    $or: [{ email }, { phone: email }],
  }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or contact or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

const verifyMe = catchAsync(async (req, res, next) => {
  // 1. Get code
  const { code } = req.body;
  if (!code) {
    return next(new AppError('Please provide code', 400));
  }
  // 2. Get user
  const user = await User.findById(req.user.id);

  // 3. Verify if code has expire
  if (Date.now() > user.smsCodeExpiresAt) {
    return next(new AppError('Your code has expired', 400));
  }

  // 4. Check if code matches
  if (!user.correctSMSCode(code, user.lastVerificationSMSCode)) {
    return next(new AppError('Codes did not match', 401));
  }
  // 4. Update user verification status to true
  user.lastVerificationSMSCode = undefined;
  user.smsCodeExpiresAt = undefined;
  user.phoneValidated = true;
  await user.save();

  // 5. Send response
  res.status(200).json({
    status: 'success',
    data: null,
  });
});

/**
 * @breif middleware function to protect routes, this middleware
 * function ensures only login users can access certain routes
 * @return {Function}
 */
const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, config.jwt.secret);

  // 3) Check if user still exists
  const currentuser = await User.findById(decoded.user._id);

  if (!currentuser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentuser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentuser;
  next();
});

/**
 * @breif Middleware to restrict route access only to user of
 * a particular role
 * @param  {...any} roles -> User roles
 * @returns {Function}
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'user','provider']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

/**
 * @breif Restrict access only to users with verified contacts
 * @returns
 */
const restrictToVerified = (req, res, next) => {
  if (!req.user.phoneValidated && !req.user.emailValidated) {
    return next(
      new AppError(
        'Your are not allowed to performed this action, please authenticate your contact /verifyMe',
        403
      )
    );
  }
  next();
};

/**
 * @breif Update user contacts telephone and set the verified status to FALSE.
 * The a new code is generate for the user to authenticate their contact
 */
const updatePhone = catchAsync(async (req, res, next) => {
  // 1. Modify phone
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      phone: req.body.phone,
      phoneValidated: false,
    },
    { new: true, runValidators: true }
  );

  // 2. Generate and send contact verification code
  generateAndSendSMSCode(updatedUser);

  // 3. Send response
  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

/**
 * @breif Update user(user/provider) password
 * @returns {Function}
 */
const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // user.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res);
});

export default {
  resendSMSCode,
  register,
  login,
  verifyMe,
  protect,
  restrictTo,
  restrictToVerified,
  updatePhone,
  updatePassword,
};
