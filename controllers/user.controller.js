import sharp from "sharp";
import User from "../models/user.model.js";

import factory from "./handler.factory.js";
import AppError from "../utilities/appError.js";
import catchAsync from "../utilities/catchAsync.js";
import { filterObj } from "../utilities/utils.js";
import { upload } from "../utilities/upload.js";
import eStatusCode from "../utilities/enums/e.status-code.js";

/**
 * @breif Upload a single user photo
 */
const uploadUserPhoto = upload.single("photo");

/**
 * @breif Resize user photo to size 500x500 and convert format to jpeg
 * then store photo in folder public/images/users
 */
const resizeUserPhoto = catchAsync(async (req, res, next) => {
  // 1. Check if file exists
  if (!req.file) return next();

  // 2. Rename file
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  req.body.photo = req.file.filename;

  // 3. Upload file
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/images/users/${req.file.filename}`);

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
 * @breif Controller for updating user profile
 */
const updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        eStatusCode.BAD_REQUEST
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "birthday",
    "email",
    "services",
    "photo"
  );

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(eStatusCode.SUCCESS).json({
    status: "success",
    message: "data updated!",
    data: {
      user: updatedUser,
    },
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
    status: "success",
    data: null,
  });
});

const createUser = (req, res) => {
  res.status(eStatusCode.SERVER_ERROR).json({
    status: "error",
    message: "This route is not defined! Please use /signup instead",
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
  deleteMe,
  createUser,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
  countUsers,
  searchUser,
};
