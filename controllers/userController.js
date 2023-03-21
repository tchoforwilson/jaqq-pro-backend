'use strict';
import multer from 'multer';
import sharp from 'sharp';
import AppError from '../utilities/appError.js';
import catchAsync from '../utilities/catchAsync.js';
import User from '../models/userModel.js';

/**
 * @breif Multer memory storage
 */
const multerStorage = multer.memoryStorage();

/**
 * @breif Method to check if file uploaded is an image
 * @param {Request} req -> Request object
 * @param {File} file -> File field
 * @param {Callback} cb -> Callback function
 */
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};
// Maximum size of user uploaded file(photo) 1MB
const maxImageSize = 1 * 1000 * 1000;

/**
 * @brief multer utility to upload image
 */
const upload = multer({
  storage: multerStorage,
  limits: { fileSize: maxImageSize },
  fileFilter: multerFilter,
});

export const uploadUserPhoto = upload.single('photo');

/**
 * @breif Method to resize user photo, convert image to "jpeg and increase quality"
 */
export const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // Stored user image name string user-userId-currentDate.jpeg
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`uploads/profiles/${req.file.filename}`);

  next();
});

/**
 * @breif Filter out unwanted fields in an object
 * @param {Object} obj -> Provided object
 * @param  {...any} allowedFields -> Allowed fields array
 * @returns {Object}
 */
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const editProfile = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    'firstName',
    'lastName',
    'email',
    'phone',
    'dateOfBirth'
  );
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
