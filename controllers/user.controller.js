import sharp from 'sharp';
import User from '../models/user.model.js';

import factory from './handler.factory.js';
import AppError from '../utilities/appError.js';
import catchAsync from '../utilities/catchAsync.js';
import { filterObj } from '../utilities/utils.js';
import { upload } from '../utilities/upload.js';
import eStatusCode from '../utilities/enums/e.status-code.js';

/**
 * @breif Upload a single user photo
 */
const uploadUserPhoto = upload.single('photo');

/**
 * @breif Resize user photo to size 500x500 and convert format to jpeg
 * then store photo in folder public/images/users
 */
const resizeUserPhoto = catchAsync(async (req, res, next) => {
  // 1. Check if file exists
  if (!req.file) return next();

  // 2. Rename file
  const imagePath = 'public/images/users';
  const fullPath = `${req.protocol}://${req.get('host')}/${imagePath}`;
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  req.body.photo = `${fullPath}/${req.file.filename}`;

  // 3. Upload file
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`${imagePath}/${req.file.filename}`);

  next();
});

/**
 * @bref Set parameter id in getting current user
 */
const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
/**
 * @breif Add ore remove services from provider
 */
const toggleMyServices = catchAsync(async (req, res, next) => {
  // 1. Get services
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      services: req.body.services,
    },
    { new: true }
  );

  // 2. Check if the task are updated or user not found
  if (!user) {
    return next(new AppError(eStatusCode.NOT_FOUND, 'User not found!'));
  }

  // 3. Send response
  res.status(eStatusCode.SUCCESS).json({
    status: 'success',
    message: 'Services updated successfully',
    data: user,
  });
});

/**
 * @breif Controller for updating user profile
 */
const updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        eStatusCode.BAD_REQUEST
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    'firstname',
    'lastname',
    'birthday',
    'email',
    'services',
    'photo'
  );

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(eStatusCode.SUCCESS).json({
    status: 'success',
    message: 'data updated!',
    data: updatedUser,
  });
});

/**
 * @breif Update user password
 */
const updateUserLocation = catchAsync(async (req, res, next) => {
  // 1. Get user
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      location: req.body.location,
    },
    { new: true, runValidators: false }
  );

  // 2. Check if  the location is updated or user not found
  if (!user) {
    return next(new AppError(eStatusCode.NOT_FOUND, 'User not found!'));
  }

  // 3. Send response
  res.status(eStatusCode.SUCCESS).json({
    status: 'success',
    message: 'Location updated successfully',
    data: user,
  });
});

/**
 * @breif Update user push notification token
 */
const updatePushToken = catchAsync(async (req, res, next) => {
  // 1. Get user
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      pushToken: req.body.pushToken,
    },
    { new: true, runValidators: false }
  );

  // 2. Check if  the push is updated or user not found
  if (!user) {
    return next(new AppError(eStatusCode.NOT_FOUND, 'User not found!'));
  }

  // 3. Send response
  res.status(eStatusCode.SUCCESS).json({
    status: 'success',
    message: 'Push token updated successfully',
    data: user,
  });
});

/**
 * @breif Fetch all current user services
 */
const getUserServices = catchAsync(async (req, res, next) => {
  // 1. Get all user services
  const services = (await User.findById(req.user._id)).services;

  // 2. Send response
  res.status(eStatusCode.SUCCESS).json({
    status: 'success',
    message: 'Services successfully retrived!',
    data: services,
  });
});

/**
 * @breif Controller for deleting user profile, by setting active status to false.
 */
const deleteMe = catchAsync(async (req, res, next) => {
  // 1. Find user and update active to false
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  // 2. Send response
  res.status(eStatusCode.NO_CONTENT).json({
    status: 'success',
    data: null,
  });
});

const createUser = (req, res) => {
  res.status(eStatusCode.SERVER_ERROR).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

const getUser = factory.getOne(User);
const getAllUsers = factory.getAll(User);

// Do NOT update passwords with this!
const updateUser = factory.updateOne(User);
const deleteUser = factory.deleteOne(User);
const countUsers = factory.count(User);
const searchUser = factory.search(User);

export default {
  uploadUserPhoto,
  resizeUserPhoto,
  getMe,
  updateMe,
  updateUserLocation,
  updatePushToken,
  getUserServices,
  toggleMyServices,
  deleteMe,
  createUser,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
  countUsers,
  searchUser,
};
