import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import AppError from '../../utilities/appError.js';
import catchAsync from '../../utilities/catchAsync.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

/**
 * @breif Create and send member(user or provider) login token with response status code
 * @param {Object} member -> Stored member object
 * @param {Number} statusCode -> Response status code
 * @param {Response} res -> Response object
 */
const createSendToken = (member, statusCode, req, res) => {
  const token = signToken(member._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // remove password in output
  member.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      member,
    },
  });
};

/**
 * @breif register a new member (user/provider) in the database
 * @param {Collection} Model
 * @returns Function
 */
export const register = (Model) =>
  catchAsync(async (req, res, next) => {
    const newMember = await Model.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      device: req.body.device,
      dateOfBirth: new Date(req.body.dateOfBirth),
    });
    createSendToken(newMember, 201, req, res);
  });

/**
 * @breif Login a member into the system, this is done after member provides
 * email or contact with password, if the email or contact and password provided
 * as the same as the one stored in the database, then the member is login
 * @param {Collection} Model -> Member Collection model
 * @returns Function
 */
export const login = (Model) =>
  catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return next(
        new AppError('Please provide email or contact and password!', 400)
      );
    }
    // 2) Check if member exists && password is correct
    const member = await Model.findOne({
      $or: [{ email }, { phone: email }],
    }).select('+password');

    if (!member || !(await member.correctPassword(password, member.password))) {
      return next(new AppError('Incorrect email or contact or password', 401));
    }

    // 3) If everything ok, send token to client
    createSendToken(member, 200, req, res);
  });

export const logout = (req, res) => {
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

/**
 * @breif middleware function to protect routes, this middleware
 * function ensures only login members can access certain routes
 * @param {Collection} Model -> member collection model
 * @return Function
 */
export const protect = (Model) =>
  catchAsync(async (req, res, next) => {
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
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentMember = await Model.findById(decoded.id);
    if (!currentMember) {
      return next(
        new AppError(
          'The member belonging to this token does no longer exist.',
          401
        )
      );
    }

    // 4) Check if user changed password after the token was issued
    if (currentMember.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          'User recently changed password! Please log in again.',
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.member = currentMember;
    next();
  });

/**
 * @breif Update member(user/provider) password
 * @param {Collection} Model -> Member collection model
 * @returns Function
 */
export const updatePassword = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1) Get member from collection
    const member = await Model.findById(req.member.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (
      !(await member.correctPassword(req.body.passwordCurrent, member.password))
    ) {
      return next(new AppError('Your current password is wrong.', 401));
    }

    // 3) If so, update password
    member.password = req.body.password;
    member.passwordConfirm = req.body.passwordConfirm;
    await member.save();
    // member.findByIdAndUpdate will NOT work as intended!

    // 4) Log member in, send JWT
    createSendToken(member, 200, req, res);
  });
