import Task from '../models/task.model.js';
import factory from './handler.factory.js';
import AppError from '../utilities/appError.js';
import catchAsync from '../utilities/catchAsync.js';
import eStatusCode from '../utilities/enums/e.status-code.js';
import Review from '../models/review.model.js';

const setUserTaskIds = catchAsync(async (req, res, next) => {
  // 1. Get task
  const task = await Task.findById(req.params.taskId || req.body.task);
  if (!task) {
    return next(
      new AppError('No task found with that id', eStatusCode.NOT_FOUND)
    );
  }
  // 2. Set task and provider id's
  if (!req.body.task) req.body.task = task._id;
  if (!req.body.provider) req.body.provider = task.provider._id;

  next();
});

export default {
  setUserTaskIds,
  createReview: factory.createOne(Review),
  getAllReviews: factory.getAll(Review),
  getReview: factory.getOne(Review, { path: 'provider', select: '-__v' }),
  updateReview: factory.updateOne(Review),
  deleteReview: factory.deleteOne(Review),
};
