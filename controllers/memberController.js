import AppError from '../utilities/appError.js';
import catchAsync from '../utilities/catchAsync.js';
import factory from './handlerFactory.js';

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

/**
 * @breif Set the current parameter id to member id, this is to enable
 * request needing member Id to have it
 * @param {Request} req -> Request object
 * @param {Response} res -> Response object
 * @param {Next} next -> Next Function
 */
const getMe = (req, res, next) => {
  req.params.id = req.member.id;
  next();
};

/**
 * @breif Update profile, only certain fields are allowed to be updated.
 * This update is done by login members
 * @param {Collection} Model -> Database Collection
 * @param  {...any} updateValues -> Collection fields allowed to be updated
 * @returns
 */
const updateMe = (Model, ...updateValues) =>
  catchAsync(async (req, res, next) => {
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
    const filteredBody = filterObj(req.body, ...updateValues);
    if (req.file) filteredBody.photo = req.file.filename;

    // 3) Update user document
    const updatedMember = await Model.findByIdAndUpdate(
      req.member.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        member: updatedMember,
      },
    });
  });

/**
 * @breif Delete a member from the collection,
 * this is done by setting the member is_active status to "FALSe"
 * @param {Collection} Model -> Collection model
 * @returns Function
 */
const deleteMe = (Model) =>
  catchAsync(async (req, res, next) => {
    await Model.findByIdAndUpdate(req.member.id, { is_active: false });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

const createMember = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

const getMember = (Model) => factory.getOne(Model);
const getAllMembers = (Model) => factory.getAll(Model);

// Do NOT update passwords with this!
const updateMember = (Model) => factory.updateOne(Model);
const deleteMember = (Model) => factory.deleteOne(Model);

export default {
  filterObj,
  getMe,
  updateMe,
  deleteMe,
  createMember,
  getMember,
  getAllMembers,
  updateMember,
  deleteMember,
};
